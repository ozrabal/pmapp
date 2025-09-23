/*
 * Migration: disable_rls_policies
 * 
 * Purpose: Disable all Row Level Security (RLS) policies from core tables
 * Affected tables: profiles, projects, user_activities, ai_suggestion_feedbacks, user_sessions
 * 
 * This migration removes all previously defined RLS policies but does not
 * disable row level security on the tables themselves.
 */

-- disable all policies on profiles table
drop policy if exists "anon users cannot access profiles" on profiles;
drop policy if exists "authenticated users can read own profile" on profiles;
drop policy if exists "authenticated users can update own profile" on profiles;

-- disable all policies on projects table
drop policy if exists "anon users cannot access projects" on projects;
drop policy if exists "authenticated users can read own projects" on projects;
drop policy if exists "authenticated users can insert own projects" on projects;
drop policy if exists "authenticated users can update own projects" on projects;

-- disable all policies on user_activities table
drop policy if exists "anon users cannot access user_activities" on user_activities;
drop policy if exists "authenticated users can read own activities" on user_activities;
drop policy if exists "authenticated users can insert own activities" on user_activities;

-- disable all policies on ai_suggestion_feedbacks table
drop policy if exists "anon users cannot access ai_suggestion_feedbacks" on ai_suggestion_feedbacks;
drop policy if exists "authenticated users can read own feedbacks" on ai_suggestion_feedbacks;
drop policy if exists "authenticated users can create own feedbacks" on ai_suggestion_feedbacks;
drop policy if exists "authenticated users can update own feedbacks" on ai_suggestion_feedbacks;

-- disable all policies on user_sessions table
drop policy if exists "anon users cannot access user_sessions" on user_sessions;
drop policy if exists "authenticated users can read own sessions" on user_sessions;
drop policy if exists "authenticated users can insert own sessions" on user_sessions;
drop policy if exists "authenticated users can update own sessions" on user_sessions;

-- comment explaining the impact of this migration
comment on table profiles is 'User profiles extending the auth.users functionality (RLS policies disabled)';
comment on table projects is 'User projects with JSON structures (RLS policies disabled)';
comment on table user_activities is 'Tracking of user activities in the system (RLS policies disabled)';
comment on table ai_suggestion_feedbacks is 'User feedback on AI suggestions (RLS policies disabled)';
comment on table user_sessions is 'User session tracking (RLS policies disabled)';
