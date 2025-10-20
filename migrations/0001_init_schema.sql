-- Chat tables migration - tables already exist, this is a no-op for safety
-- The chat tables (chat_sessions and chat_messages) were created manually
-- and are already in the correct state with proper constraints and indexes.

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

CREATE TABLE IF NOT EXISTS "chat_sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"current_step" text NOT NULL,
	"collected_data" jsonb,
	"completion_status" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Note: auth.users table is managed by Supabase and already exists
-- Skipping auth schema creation as it's system-managed
