-- RLS policies for chat_sessions and chat_messages
-- Adjust role names/claims as needed for your auth setup (this follows a Supabase-like approach)

-- Enable RLS on tables
ALTER TABLE IF EXISTS chat_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS chat_messages ENABLE ROW LEVEL SECURITY;

-- Policy: only the session owner can select/insert/update/delete sessions
CREATE POLICY "authenticated users can manage own chat_sessions" ON chat_sessions
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: only session owner can select/insert/update/delete messages belonging to their sessions
CREATE POLICY "authenticated users can manage own chat_messages" ON chat_messages
  FOR ALL
  USING (EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM chat_sessions WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()));

-- Optionally add a permissive policy for authenticated users to read their sessions/messages
-- (Already covered by FOR ALL above; adjust as needed)
