import { eq, asc } from "drizzle-orm";
import db from "@/db/service";
import { chatSessions, chatMessages } from "@/db/schema/chat";
import type { ChatSession, Message } from "@/api/types/chat";
import type { PlanningStep, CompletionStatus } from "@/api/modules/planning/consts";

/**
 * Create a new chat session. Returns inserted ChatSession (without messages).
 */
export async function createSession(payload: {
  userId: string;
  currentStep: string;
  collectedData?: Record<string, unknown>;
  completionStatus?: string;
}): Promise<ChatSession> {
  const { userId, currentStep, collectedData = {}, completionStatus = "in_progress" } = payload;
  const rows = await db()
    .insert(chatSessions)
    .values({ userId, currentStep, collectedData, completionStatus })
    .returning();
  const row = rows[0];

  return {
    id: row.id,
    userId: row.userId,
    currentStep: row.currentStep as unknown as PlanningStep,
    collectedData: row.collectedData ?? {},
    conversationHistory: [],
    completionStatus: row.completionStatus as unknown as CompletionStatus,
    createdAt: new Date(row.createdAt),
    updatedAt: new Date(row.updatedAt),
  };
}

/**
 * Append a message to a session and update the session's updatedAt timestamp.
 * Returns the inserted Message record.
 */
export async function appendMessage(
  sessionId: string,
  msg: { role: string; content: string; timestamp?: Date }
): Promise<Message> {
  const ts = (msg.timestamp ?? new Date()).toISOString();

  return await db().transaction(async (tx) => {
    const insertedRows = await tx
      .insert(chatMessages)
      .values({ sessionId, role: msg.role, content: msg.content, contentText: msg.content, timestamp: ts })
      .returning();

    const inserted = insertedRows[0];

    await tx.update(chatSessions).set({ updatedAt: new Date().toISOString() }).where(eq(chatSessions.id, sessionId));

    return {
      role: inserted.role,
      content: inserted.content,
      timestamp: new Date(inserted.timestamp),
    };
  });
}

/**
 * Load a ChatSession including all messages (conversationHistory) in ascending timestamp order
 */
export async function loadChatSession(sessionId: string): Promise<ChatSession | null> {
  const rows = await db().select().from(chatSessions).where(eq(chatSessions.id, sessionId)).limit(1);
  const s = rows[0];
  if (!s) return null;

  const msgs = await db()
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.timestamp));

  const conversationHistory: Message[] = msgs.map((m) => ({
    role: m.role,
    content: m.content,
    timestamp: new Date(m.timestamp),
  }));

  return {
    id: s.id,
    userId: s.userId,
    currentStep: s.currentStep as unknown as PlanningStep,
    collectedData: s.collectedData ?? {},
    conversationHistory,
    completionStatus: s.completionStatus as unknown as CompletionStatus,
    createdAt: new Date(s.createdAt),
    updatedAt: new Date(s.updatedAt),
  };
}
