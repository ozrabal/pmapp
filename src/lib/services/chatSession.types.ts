import type { CompletionStatus, PlanningStep } from "@/api/modules/planning/consts";
import type { Message, ProjectData } from "@/api/types/chat";

/**
 * Input type for creating a new chat session
 */
export interface CreateSessionInput {
  userId: string;
  currentStep: PlanningStep;
  collectedData?: ProjectData;
  completionStatus: CompletionStatus;
  initialMessage?: Message;
}

/**
 * Input type for updating an existing chat session
 */
export interface UpdateSessionInput {
  currentStep?: PlanningStep;
  collectedData?: ProjectData;
  completionStatus?: CompletionStatus;
}

/**
 * Input type for adding a message to a session
 */
export interface AddMessageInput {
  sessionId: string;
  role: Message["role"];
  content: string;
  timestamp?: Date;
}

/**
 * Database row type for chat_sessions
 */
export interface ChatSessionRow {
  id: string;
  userId: string;
  currentStep: string;
  collectedData: ProjectData | null;
  completionStatus: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Database row type for chat_messages
 */
export interface ChatMessageRow {
  id: string;
  sessionId: string;
  role: string;
  content: string;
  contentText: string | null;
  timestamp: string;
  createdAt: string;
  tokenCount: number | null;
  isDeleted: boolean | null;
}

/**
 * Full session with assembled messages (maps to ChatSession from API types)
 */
export interface SessionWithMessages {
  id: string;
  userId: string;
  currentStep: PlanningStep;
  collectedData: ProjectData;
  conversationHistory: Message[];
  completionStatus: CompletionStatus;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Options for deleting sessions
 */
export interface DeleteSessionOptions {
  /** If true, performs soft delete (marks as deleted). If false, performs hard delete */
  soft?: boolean;
  /** If true, also deletes (soft/hard) associated messages. Default: true */
  deleteMessages?: boolean;
}
