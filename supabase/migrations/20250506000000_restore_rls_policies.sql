/*
 * Migration: restore_rls_policies
 * 
 * Purpose: Restore all Row Level Security (RLS) policies that were disabled in previous migration
 * Affected tables: profiles, projects, user_activities, ai_suggestion_feedbacks, user_sessions
 * 
 * This migration recreates all previously defined RLS policies that were dropped in migration 
 * 20250412110000_disable_rls_policies.sql
 */

-- restore policies on profiles table
create policy "anon users cannot access profiles" on profiles
  for all
  to anon
  using (false);

create policy "authenticated users can read own profile" on profiles
  for select
  to authenticated
  using (auth.uid() = id);

create policy "authenticated users can update own profile" on profiles
  for update
  to authenticated
  using (auth.uid() = id);

-- restore policies on projects table
create policy "anon users cannot access projects" on projects
  for all
  to anon
  using (false);

create policy "authenticated users can read own projects" on projects
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "authenticated users can insert own projects" on projects
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "authenticated users can update own projects" on projects
  for update
  to authenticated
  using (auth.uid() = user_id);

-- restore policies on user_activities table
create policy "anon users cannot access user_activities" on user_activities
  for all
  to anon
  using (false);

create policy "authenticated users can read own activities" on user_activities
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "authenticated users can insert own activities" on user_activities
  for insert
  to authenticated
  with check (auth.uid() = user_id);

-- restore policies on ai_suggestion_feedbacks table
create policy "anon users cannot access ai_suggestion_feedbacks" on ai_suggestion_feedbacks
  for all
  to anon
  using (false);

create policy "authenticated users can read own feedbacks" on ai_suggestion_feedbacks
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "authenticated users can create own feedbacks" on ai_suggestion_feedbacks
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "authenticated users can update own feedbacks" on ai_suggestion_feedbacks
  for update
  to authenticated
  using (auth.uid() = user_id);

-- restore policies on user_sessions table
create policy "anon users cannot access user_sessions" on user_sessions
  for all
  to anon
  using (false);

create policy "authenticated users can read own sessions" on user_sessions
  for select
  to authenticated
  using (auth.uid() = user_id);

create policy "authenticated users can insert own sessions" on user_sessions
  for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "authenticated users can update own sessions" on user_sessions
  for update
  to authenticated
  using (auth.uid() = user_id);

-- update comments to reflect that RLS policies are now enabled
comment on table profiles is 'User profiles extending the auth.users functionality (RLS policies enabled)';
comment on table projects is 'User projects with JSON structures (RLS policies enabled)';
comment on table user_activities is 'Tracking of user activities in the system (RLS policies enabled)';
comment on table ai_suggestion_feedbacks is 'User feedback on AI suggestions (RLS policies enabled)';
comment on table user_sessions is 'User session tracking (RLS policies enabled)';