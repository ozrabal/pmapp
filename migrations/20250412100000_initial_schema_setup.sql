/*
 * Migration: initial_schema_setup
 * 
 * Purpose: Create the initial database schema for the Plan My App application
 * Affected tables: profiles, projects, user_activities, ai_suggestion_feedbacks, user_sessions
 * 
 * This migration sets up the core data structure, RLS policies, functions, and triggers
 * based on the database schema design document.
 */

-- enable the uuid-ossp extension for uuid generation
create extension if not exists "uuid-ossp";

-- function to update the updated_at timestamp automatically
create or replace function update_modified_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- create the profiles table to extend auth.users functionality
create table profiles (
  id uuid primary key references auth.users(id),
  first_name varchar(100) not null,
  last_name varchar(100),
  timezone varchar(50) not null default 'UTC',
  last_login_at timestamp with time zone,
  projects_limit integer not null default 5,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone
);

-- create the projects table
create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id),
  name varchar(200) not null,
  description text,
  assumptions jsonb,
  functional_blocks jsonb,
  schedule jsonb,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  deleted_at timestamp with time zone
);

-- create the user_activities table
create table user_activities (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id),
  activity_type varchar(50) not null,
  duration_seconds integer,
  metadata jsonb,
  created_at timestamp with time zone not null default now()
);

-- create the ai_suggestion_feedbacks table
create table ai_suggestion_feedbacks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id),
  suggestion_context varchar(100) not null,
  suggestion_hash varchar(64) not null,
  is_helpful boolean not null,
  feedback_text text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

-- create the user_sessions table
create table user_sessions (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references profiles(id),
  start_time timestamp with time zone not null default now(),
  end_time timestamp with time zone,
  total_duration_seconds integer,
  is_active boolean not null default true
);

-- create indexes for optimized queries
create index projects_user_id_idx on projects(user_id);
create index projects_deleted_at_idx on projects(deleted_at);
create index user_activities_user_id_idx on user_activities(user_id);
create index user_activities_activity_type_idx on user_activities(activity_type);
create index ai_suggestion_feedbacks_user_id_idx on ai_suggestion_feedbacks(user_id);
create index ai_suggestion_feedbacks_context_hash_idx on ai_suggestion_feedbacks(suggestion_context, suggestion_hash);
create index user_sessions_user_id_idx on user_sessions(user_id);
create index user_sessions_is_active_idx on user_sessions(is_active);
create index gin_projects_functional_blocks on projects using gin (functional_blocks);
create index gin_projects_schedule on projects using gin (schedule);

-- function to check projects limit before insert
create or replace function check_projects_limit()
returns trigger as $$
declare
  projects_count integer;
  max_projects integer;
begin
  select count(*) into projects_count 
  from projects 
  where user_id = new.user_id and deleted_at is null;
  
  select projects_limit into max_projects 
  from profiles 
  where id = new.user_id;
  
  if projects_count >= max_projects then
    raise exception 'Przekroczono limit projektów dla tego użytkownika';
  end if;
  
  return new;
end;
$$ language plpgsql;

-- function to update last login time
create or replace function update_last_login()
returns trigger as $$
begin
  update profiles
  set last_login_at = now()
  where id = new.user_id;
  return new;
end;
$$ language plpgsql;

-- create triggers
create trigger update_profiles_modtime
before update on profiles
for each row execute procedure update_modified_column();

create trigger update_projects_modtime
before update on projects
for each row execute procedure update_modified_column();

create trigger update_ai_suggestion_feedbacks_modtime
before update on ai_suggestion_feedbacks
for each row execute procedure update_modified_column();

create trigger check_projects_limit_trigger
before insert on projects
for each row execute procedure check_projects_limit();

create trigger update_last_login_trigger
after insert on user_sessions
for each row
when (new.is_active = true)
execute procedure update_last_login();

-- enable row level security on all tables
alter table profiles enable row level security;
alter table projects enable row level security;
alter table user_activities enable row level security;
alter table ai_suggestion_feedbacks enable row level security;
alter table user_sessions enable row level security;

-- profiles rls policies
-- anon users cannot access profiles
create policy "anon users cannot access profiles" 
  on profiles for select 
  to anon
  using (false);

-- authenticated users can only read their own profile
create policy "authenticated users can read own profile" 
  on profiles for select 
  to authenticated
  using (auth.uid() = id);

-- authenticated users can update their own profile
create policy "authenticated users can update own profile" 
  on profiles for update 
  to authenticated
  using (auth.uid() = id);

-- projects rls policies
-- anon users cannot access projects
create policy "anon users cannot access projects" 
  on projects for select 
  to anon
  using (false);

-- authenticated users can read only their non-deleted projects
create policy "authenticated users can read own projects" 
  on projects for select 
  to authenticated
  using (auth.uid() = user_id and deleted_at is null);

-- authenticated users can insert their own projects
create policy "authenticated users can insert own projects" 
  on projects for insert 
  to authenticated
  with check (auth.uid() = user_id);

-- authenticated users can update their own non-deleted projects
create policy "authenticated users can update own projects" 
  on projects for update 
  to authenticated
  using (auth.uid() = user_id and deleted_at is null);

-- user_activities rls policies
-- anon users cannot access user_activities
create policy "anon users cannot access user_activities" 
  on user_activities for select 
  to anon
  using (false);

-- authenticated users can read only their own activities
create policy "authenticated users can read own activities" 
  on user_activities for select 
  to authenticated
  using (auth.uid() = user_id);

-- authenticated users can insert their own activities
create policy "authenticated users can insert own activities" 
  on user_activities for insert 
  to authenticated
  with check (auth.uid() = user_id);

-- ai_suggestion_feedbacks rls policies
-- anon users cannot access ai_suggestion_feedbacks
create policy "anon users cannot access ai_suggestion_feedbacks" 
  on ai_suggestion_feedbacks for select 
  to anon
  using (false);

-- authenticated users can read only their own feedbacks
create policy "authenticated users can read own feedbacks" 
  on ai_suggestion_feedbacks for select 
  to authenticated
  using (auth.uid() = user_id);

-- authenticated users can insert their own feedbacks
create policy "authenticated users can create own feedbacks" 
  on ai_suggestion_feedbacks for insert 
  to authenticated
  with check (auth.uid() = user_id);

-- authenticated users can update their own feedbacks
create policy "authenticated users can update own feedbacks" 
  on ai_suggestion_feedbacks for update 
  to authenticated
  using (auth.uid() = user_id);

-- user_sessions rls policies
-- anon users cannot access user_sessions
create policy "anon users cannot access user_sessions" 
  on user_sessions for select 
  to anon
  using (false);

-- authenticated users can read only their own sessions
create policy "authenticated users can read own sessions" 
  on user_sessions for select 
  to authenticated
  using (auth.uid() = user_id);

-- authenticated users can insert their own sessions
create policy "authenticated users can insert own sessions" 
  on user_sessions for insert 
  to authenticated
  with check (auth.uid() = user_id);

-- authenticated users can update their own sessions
create policy "authenticated users can update own sessions" 
  on user_sessions for update 
  to authenticated
  using (auth.uid() = user_id);

-- comment on tables and columns for documentation
comment on table profiles is 'User profiles extending the auth.users functionality';
comment on table projects is 'User projects with JSON structures for assumptions, functional blocks and schedules';
comment on table user_activities is 'Tracking of user activities in the system';
comment on table ai_suggestion_feedbacks is 'User feedback on AI suggestions';
comment on table user_sessions is 'User session tracking';