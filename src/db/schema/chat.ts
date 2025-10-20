import { pgTable, uuid, text, jsonb, timestamp, integer, boolean, foreignKey, index } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authUsers } from "drizzle-orm/supabase";

/**
 * Drizzle schema for normalized chat sessions and messages.
 *
 * This maps to the TypeScript interface at `src/api/types/chat.ts`:
 * - ChatSession fields are stored on `chat_sessions` (collectedData -> jsonb)
 * - conversationHistory is assembled from `chat_messages` rows
 *
 * Note: References Supabase auth.users table for user relationships
 */

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id").notNull(),
    currentStep: text("current_step").notNull(),
    collectedData: jsonb("collected_data"),
    completionStatus: text("completion_status").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    // Foreign key reference to Supabase auth.users
    foreignKey({
      columns: [table.userId],
      foreignColumns: [authUsers.id],
      name: "chat_sessions_user_id_fkey",
    }),
    // Index for efficient queries
    index("idx_chat_sessions_user_updated").on(table.userId, table.updatedAt.desc()),
  ]
);

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    sessionId: uuid("session_id").notNull(),
    // role should align with your `Message.role` type (no 'system')
    role: text("role").notNull(),
    content: text("content").notNull(),
    // keep a plain text copy for full-text search indexes if needed
    contentText: text("content_text"),
    // when the message was created / the logical timestamp for the message
    timestamp: timestamp("timestamp", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    // optional: created_at for operational sorting if you prefer
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    // optional token accounting or flags could be added here
    tokenCount: integer("token_count").default(0),
    isDeleted: boolean("is_deleted").default(false),
  },
  (table) => [
    // Foreign key reference to chat_sessions
    foreignKey({
      columns: [table.sessionId],
      foreignColumns: [chatSessions.id],
      name: "chat_messages_session_id_fkey",
    }),
    // Index for efficient queries by session and timestamp
    index("idx_chat_messages_session_time").on(table.sessionId, table.timestamp.desc()),
    // Full-text search index on content_text
    index("chat_messages_content_text_gin").using(
      "gin",
      sql`to_tsvector('english', coalesce(${table.contentText}, ''))`
    ),
  ]
);

// Exported table names are ready to use with your Drizzle DB instance.
