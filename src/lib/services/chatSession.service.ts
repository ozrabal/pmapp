import { eq, and, desc, sql } from "drizzle-orm";
import type { CompletionStatus, PlanningStep } from "@/api/modules/planning/consts";
import type { Message } from "@/api/types/chat";
import db from "@/db/service";
import { chatSessions, chatMessages } from "@/db/schema/chat";
import type {
  CreateSessionInput,
  UpdateSessionInput,
  SessionWithMessages,
  DeleteSessionOptions,
  AddMessageInput,
} from "./chatSession.types";

/**
 * ChatSession Service
 *
 * Provides CRUD operations for chat sessions with both soft and hard delete capabilities.
 * Manages the relationship between chat_sessions and chat_messages tables.
 */
export class ChatSessionService {
  /**
   * Create a new chat session with an optional initial message
   * Uses a transaction to ensure atomicity
   */
  async createSession(input: CreateSessionInput): Promise<SessionWithMessages> {
    const database = db();

    return await database.transaction(async (tx) => {
      // Insert session
      const [session] = await tx
        .insert(chatSessions)
        .values({
          userId: input.userId,
          currentStep: input.currentStep,
          collectedData: input.collectedData || {},
          completionStatus: input.completionStatus,
          isDeleted: false,
        })
        .returning();

      // Insert initial message if provided
      if (input.initialMessage) {
        await tx.insert(chatMessages).values({
          sessionId: session.id,
          role: input.initialMessage.role as string,
          content: input.initialMessage.content,
          contentText: input.initialMessage.content, // Store plain text copy
          timestamp: input.initialMessage.timestamp.toISOString(),
        });
      }

      // Fetch and assemble the complete session
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return await this._assembleSessionWithMessages(session.id, tx as any);
    });
  }

  /**
   * Get a session by ID with all messages
   * Excludes soft-deleted sessions by default
   */
  async getSessionById(
    sessionId: string,
    options: { includeSoftDeleted?: boolean } = {}
  ): Promise<SessionWithMessages | null> {
    const database = db();

    const conditions = options.includeSoftDeleted
      ? eq(chatSessions.id, sessionId)
      : and(eq(chatSessions.id, sessionId), eq(chatSessions.isDeleted, false));

    const [session] = await database.select().from(chatSessions).where(conditions!);

    if (!session) {
      return null;
    }

    return await this._assembleSessionWithMessages(sessionId, database);
  }

  /**
   * Get all sessions for a user
   * Excludes soft-deleted sessions by default
   */
  async getSessionsByUserId(
    userId: string,
    options: { includeSoftDeleted?: boolean } = {}
  ): Promise<SessionWithMessages[]> {
    const database = db();

    const conditions = options.includeSoftDeleted
      ? eq(chatSessions.userId, userId)
      : and(eq(chatSessions.userId, userId), eq(chatSessions.isDeleted, false));

    const sessions = await database
      .select()
      .from(chatSessions)
      .where(conditions!)
      .orderBy(desc(chatSessions.updatedAt));

    // Assemble each session with messages
    const sessionsWithMessages = await Promise.all(
      sessions.map((session) => this._assembleSessionWithMessages(session.id, database))
    );

    return sessionsWithMessages;
  }

  /**
   * Update an existing session
   * Automatically updates the updatedAt timestamp
   */
  async updateSession(sessionId: string, updates: UpdateSessionInput): Promise<SessionWithMessages | null> {
    const database = db();

    const [updated] = await database
      .update(chatSessions)
      .set({
        ...updates,
        updatedAt: sql`now()`,
      })
      .where(and(eq(chatSessions.id, sessionId), eq(chatSessions.isDeleted, false)))
      .returning();

    if (!updated) {
      return null;
    }

    return await this._assembleSessionWithMessages(sessionId, database);
  }

  /**
   * Delete a session (soft or hard delete)
   * Can optionally cascade delete to messages
   *
   * @param sessionId - The session ID to delete
   * @param options - Delete options (soft/hard, cascade to messages)
   */
  async deleteSession(
    sessionId: string,
    options: DeleteSessionOptions = { soft: true, deleteMessages: true }
  ): Promise<boolean> {
    const database = db();

    return await database.transaction(async (tx) => {
      // Handle message deletion if requested
      if (options.deleteMessages) {
        if (options.soft) {
          // Soft delete messages
          await tx.update(chatMessages).set({ isDeleted: true }).where(eq(chatMessages.sessionId, sessionId));
        } else {
          // Hard delete messages
          await tx.delete(chatMessages).where(eq(chatMessages.sessionId, sessionId));
        }
      }

      // Handle session deletion
      if (options.soft) {
        // Soft delete session
        const [result] = await tx
          .update(chatSessions)
          .set({ isDeleted: true, updatedAt: sql`now()` })
          .where(eq(chatSessions.id, sessionId))
          .returning();

        return !!result;
      } else {
        // Hard delete session
        const [result] = await tx.delete(chatSessions).where(eq(chatSessions.id, sessionId)).returning();

        return !!result;
      }
    });
  }

  /**
   * Add a message to a session
   */
  async addMessage(input: AddMessageInput): Promise<Message> {
    const database = db();

    const timestamp = input.timestamp || new Date();

    const [message] = await database
      .insert(chatMessages)
      .values({
        sessionId: input.sessionId,
        role: input.role as string,
        content: input.content,
        contentText: input.content,
        timestamp: timestamp.toISOString(),
      })
      .returning();

    // Update session's updatedAt timestamp
    await database
      .update(chatSessions)
      .set({ updatedAt: sql`now()` })
      .where(eq(chatSessions.id, input.sessionId));

    return {
      role: message.role as Message["role"],
      content: message.content,
      timestamp: new Date(message.timestamp),
    };
  }

  /**
   * Get messages for a session
   * Excludes soft-deleted messages by default
   */
  async getMessages(sessionId: string, options: { includeSoftDeleted?: boolean } = {}): Promise<Message[]> {
    const database = db();

    const conditions = options.includeSoftDeleted
      ? eq(chatMessages.sessionId, sessionId)
      : and(eq(chatMessages.sessionId, sessionId), eq(chatMessages.isDeleted, false));

    const messages = await database.select().from(chatMessages).where(conditions!).orderBy(chatMessages.timestamp);

    return messages.map((msg) => ({
      role: msg.role as Message["role"],
      content: msg.content,
      timestamp: new Date(msg.timestamp),
    }));
  }

  /**
   * Delete messages (soft or hard delete)
   */
  async deleteMessages(
    sessionId: string,
    options: { soft?: boolean; messageIds?: string[] } = { soft: true }
  ): Promise<number> {
    const database = db();

    const conditions = options.messageIds
      ? and(eq(chatMessages.sessionId, sessionId), sql`${chatMessages.id} = ANY(${options.messageIds})`)
      : eq(chatMessages.sessionId, sessionId);

    if (options.soft) {
      // Soft delete
      const result = await database.update(chatMessages).set({ isDeleted: true }).where(conditions!).returning();

      return result.length;
    } else {
      // Hard delete
      const result = await database.delete(chatMessages).where(conditions!).returning();

      return result.length;
    }
  }

  /**
   * Private helper to assemble a session with its messages
   * Supports being called within a transaction
   */
  private async _assembleSessionWithMessages(
    sessionId: string,
    database: ReturnType<typeof db>
  ): Promise<SessionWithMessages> {
    // Get session
    const [session] = await database.select().from(chatSessions).where(eq(chatSessions.id, sessionId));

    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }

    // Get messages (exclude soft-deleted)
    const messages = await database
      .select()
      .from(chatMessages)
      .where(and(eq(chatMessages.sessionId, sessionId), eq(chatMessages.isDeleted, false)))
      .orderBy(chatMessages.timestamp);

    // Assemble into SessionWithMessages format
    return {
      id: session.id,
      userId: session.userId,
      currentStep: session.currentStep as PlanningStep,
      collectedData: (session.collectedData || {}) as SessionWithMessages["collectedData"],
      conversationHistory: messages.map((msg) => ({
        role: msg.role as Message["role"],
        content: msg.content,
        timestamp: new Date(msg.timestamp),
      })),
      completionStatus: session.completionStatus as CompletionStatus,
      createdAt: new Date(session.createdAt),
      updatedAt: new Date(session.updatedAt),
    };
  }
}

// Export a singleton instance
export const chatSessionService = new ChatSessionService();
