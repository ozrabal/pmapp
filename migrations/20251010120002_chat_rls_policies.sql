-- Migration: Add RLS policies for chat tables
-- Follows the security patterns used by other tables in the application

-- RLS policies for chat_sessions table
CREATE POLICY "anon users cannot access chat_sessions" ON "chat_sessions" 
  AS PERMISSIVE FOR ALL TO "anon" USING (false);

CREATE POLICY "authenticated users can read own chat sessions" ON "chat_sessions" 
  AS PERMISSIVE FOR SELECT TO "authenticated" 
  USING (user_id = auth.uid());

CREATE POLICY "authenticated users can insert own chat sessions" ON "chat_sessions" 
  AS PERMISSIVE FOR INSERT TO "authenticated" 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated users can update own chat sessions" ON "chat_sessions" 
  AS PERMISSIVE FOR UPDATE TO "authenticated" 
  USING (user_id = auth.uid()) 
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "authenticated users can delete own chat sessions" ON "chat_sessions" 
  AS PERMISSIVE FOR DELETE TO "authenticated" 
  USING (user_id = auth.uid());

-- RLS policies for chat_messages table
CREATE POLICY "anon users cannot access chat_messages" ON "chat_messages" 
  AS PERMISSIVE FOR ALL TO "anon" USING (false);

CREATE POLICY "authenticated users can read own chat messages" ON "chat_messages" 
  AS PERMISSIVE FOR SELECT TO "authenticated" 
  USING (session_id IN (
    SELECT id FROM chat_sessions WHERE user_id = auth.uid()
  ));

CREATE POLICY "authenticated users can insert own chat messages" ON "chat_messages" 
  AS PERMISSIVE FOR INSERT TO "authenticated" 
  WITH CHECK (session_id IN (
    SELECT id FROM chat_sessions WHERE user_id = auth.uid()
  ));

CREATE POLICY "authenticated users can update own chat messages" ON "chat_messages" 
  AS PERMISSIVE FOR UPDATE TO "authenticated" 
  USING (session_id IN (
    SELECT id FROM chat_sessions WHERE user_id = auth.uid()
  )) 
  WITH CHECK (session_id IN (
    SELECT id FROM chat_sessions WHERE user_id = auth.uid()
  ));

CREATE POLICY "authenticated users can delete own chat messages" ON "chat_messages" 
  AS PERMISSIVE FOR DELETE TO "authenticated" 
  USING (session_id IN (
    SELECT id FROM chat_sessions WHERE user_id = auth.uid()
  ));