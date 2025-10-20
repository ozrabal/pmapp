-- Migration: create chat_sessions and chat_messages
-- New tables for chat functionality

CREATE TABLE IF NOT EXISTS "chat_sessions" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  "user_id" uuid NOT NULL,
  "current_step" text NOT NULL,
  "collected_data" jsonb,
  "completion_status" text NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "chat_messages" (
  "id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
  "session_id" uuid NOT NULL,
  "role" text NOT NULL,
  "content" text NOT NULL,
  "content_text" text,
  "timestamp" timestamp with time zone DEFAULT now() NOT NULL,
  "created_at" timestamp with time zone DEFAULT now() NOT NULL,
  "token_count" integer DEFAULT 0,
  "is_deleted" boolean DEFAULT false
);

-- Add foreign key constraints
DO $$ 
BEGIN
  -- Add foreign key to auth.users if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_sessions_user_id_fkey' 
    AND table_name = 'chat_sessions'
  ) THEN
    ALTER TABLE "chat_sessions" ADD CONSTRAINT "chat_sessions_user_id_fkey" 
    FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;
  END IF;

  -- Add foreign key to chat_sessions if it doesn't already exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_messages_session_id_fkey' 
    AND table_name = 'chat_messages'
  ) THEN
    ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_session_id_fkey" 
    FOREIGN KEY ("session_id") REFERENCES "chat_sessions"("id") ON DELETE CASCADE;
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS "idx_chat_sessions_user_updated" ON "chat_sessions" ("user_id", "updated_at" DESC);
CREATE INDEX IF NOT EXISTS "idx_chat_messages_session_time" ON "chat_messages" ("session_id", "timestamp" DESC);
CREATE INDEX IF NOT EXISTS "chat_messages_content_text_gin" ON "chat_messages" USING GIN (to_tsvector('english', coalesce("content_text", '')));

-- Enable RLS for security (following the pattern of other tables)
ALTER TABLE "chat_sessions" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "chat_messages" ENABLE ROW LEVEL SECURITY;
