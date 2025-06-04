/*
 * Migration: complete_schema_tasks_and_dependencies
 * 
 * Purpose: Complete the database schema by adding missing tables, columns, and types for tasks management
 * Affected tables: profiles, projects, tasks (new), task_dependencies (new)
 * 
 * This migration adds:
 * - task_priority_enum type
 * - estimation_unit_enum type
 * - Missing columns to existing tables (estimation_unit, default_estimation_unit)
 * - tasks table with AI estimation features
 * - task_dependencies table for task relationships
 * - Complete set of indexes for performance optimization
 * - RLS policies for all new tables and columns
 * 
 * Special considerations:
 * - All new tables have RLS enabled by default
 * - Task dependencies prevent circular references through application logic
 * - AI estimation features include confidence scoring and feedback tracking
 */

-- create task priority enum type
create type task_priority_enum as enum ('low', 'medium', 'high');

-- create estimation unit enum type
create type estimation_unit_enum as enum ('hours', 'storypoints');

-- create task dependency type enum type
create type task_dependency_type_enum as enum ('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish');

-- add missing columns to profiles table
-- default_estimation_unit: preferred estimation unit for the user
alter table profiles 
    add column default_estimation_unit estimation_unit_enum not null default 'hours';

-- add missing columns to projects table  
-- estimation_unit: estimation unit used for tasks in this specific project
alter table projects 
    add column estimation_unit estimation_unit_enum not null default 'hours';

-- create the tasks table
-- this table stores individual tasks that belong to functional blocks within projects
create table tasks (
    id uuid primary key default uuid_generate_v4(),
    project_id uuid not null references projects(id) on delete cascade,
    functional_block_id varchar(100) not null,
    name varchar(200) not null,
    description text,
    priority task_priority_enum not null default 'medium',
    estimated_value decimal(10,2),
    estimated_by_ai boolean not null default false,
    ai_confidence_score decimal(3,2),
    ai_suggestion_context varchar(100),
    ai_suggestion_hash varchar(64),
    metadata jsonb,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now(),
    deleted_at timestamp with time zone
);

-- create the task_dependencies table
-- this table manages predecessor/successor relationships between tasks
create table task_dependencies (
    id uuid primary key default uuid_generate_v4(),
    predecessor_task_id uuid not null references tasks(id) on delete cascade,
    successor_task_id uuid not null references tasks(id) on delete cascade,
    dependency_type task_dependency_type_enum not null default 'finish_to_start',
    created_at timestamp with time zone not null default now(),
    
    -- ensure no task can depend on itself and prevent duplicate dependencies
    constraint task_dependencies_no_self_reference 
        check (predecessor_task_id != successor_task_id),
    constraint task_dependencies_unique 
        unique (predecessor_task_id, successor_task_id)
);

-- create indexes for performance optimization
-- profiles table indexes
create index idx_profiles_default_estimation_unit on profiles (default_estimation_unit);

-- projects table indexes  
create index idx_projects_estimation_unit on projects (estimation_unit);

-- tasks table indexes
create index idx_tasks_project_id on tasks (project_id);
create index idx_tasks_functional_block_id on tasks (functional_block_id);
create index idx_tasks_project_functional_block on tasks (project_id, functional_block_id);
create index idx_tasks_priority on tasks (priority);
create index idx_tasks_estimated_by_ai on tasks (estimated_by_ai);
create index idx_tasks_deleted_at on tasks (deleted_at);
create index gin_tasks_metadata on tasks using gin (metadata);

-- task_dependencies table indexes
create index idx_task_dependencies_predecessor on task_dependencies (predecessor_task_id);
create index idx_task_dependencies_successor on task_dependencies (successor_task_id);

-- create trigger for tasks updated_at timestamp
create trigger update_tasks_modtime
    before update on tasks
    for each row execute procedure update_modified_column();

-- enable row level security on new tables
alter table tasks enable row level security;
alter table task_dependencies enable row level security;

-- rls policies for tasks table
-- anon users cannot access tasks
create policy "anon users cannot access tasks"
    on tasks for select
    to anon
    using (false);

-- authenticated users can read tasks from their own projects only
create policy "authenticated users can read own project tasks"
    on tasks for select
    to authenticated
    using (
        auth.uid() = (select user_id from projects where id = project_id)
        and deleted_at is null
    );

-- authenticated users can insert tasks into their own projects only
create policy "authenticated users can create tasks in own projects"
    on tasks for insert
    to authenticated
    with check (
        auth.uid() = (select user_id from projects where id = project_id)
    );

-- authenticated users can update tasks in their own projects only
create policy "authenticated users can update own project tasks"
    on tasks for update
    to authenticated
    using (
        auth.uid() = (select user_id from projects where id = project_id)
        and deleted_at is null
    );

-- rls policies for task_dependencies table
-- anon users cannot access task dependencies
create policy "anon users cannot access task dependencies"
    on task_dependencies for select
    to anon
    using (false);

-- authenticated users can read task dependencies from their own projects only
create policy "authenticated users can read own project task dependencies"
    on task_dependencies for select
    to authenticated
    using (
        auth.uid() = (
            select p.user_id 
            from projects p 
            join tasks t on p.id = t.project_id 
            where t.id = predecessor_task_id
        )
        and auth.uid() = (
            select p.user_id 
            from projects p 
            join tasks t on p.id = t.project_id 
            where t.id = successor_task_id
        )
    );

-- authenticated users can insert task dependencies for tasks in their own projects only
create policy "authenticated users can create task dependencies in own projects"
    on task_dependencies for insert
    to authenticated
    with check (
        auth.uid() = (
            select p.user_id 
            from projects p 
            join tasks t on p.id = t.project_id 
            where t.id = predecessor_task_id
        )
        and auth.uid() = (
            select p.user_id 
            from projects p 
            join tasks t on p.id = t.project_id 
            where t.id = successor_task_id
        )
    );

-- authenticated users can update task dependencies for tasks in their own projects only
create policy "authenticated users can update task dependencies in own projects"
    on task_dependencies for update
    to authenticated
    using (
        auth.uid() = (
            select p.user_id 
            from projects p 
            join tasks t on p.id = t.project_id 
            where t.id = predecessor_task_id
        )
        and auth.uid() = (
            select p.user_id 
            from projects p 
            join tasks t on p.id = t.project_id 
            where t.id = successor_task_id
        )
    );

-- authenticated users can delete task dependencies for tasks in their own projects only
create policy "authenticated users can delete task dependencies in own projects"
    on task_dependencies for delete
    to authenticated
    using (
        auth.uid() = (
            select p.user_id 
            from projects p 
            join tasks t on p.id = t.project_id 
            where t.id = predecessor_task_id
        )
        and auth.uid() = (
            select p.user_id 
            from projects p 
            join tasks t on p.id = t.project_id 
            where t.id = successor_task_id
        )
    );

-- add comments for documentation
comment on type task_priority_enum is 'Enumeration for task priority levels: low, medium, high';
comment on type estimation_unit_enum is 'Enumeration for estimation units: hours, storypoints';
comment on type task_dependency_type_enum is 'Enumeration for task dependency types: finish_to_start, start_to_start, finish_to_finish, start_to_finish';
comment on table tasks is 'Individual tasks that belong to functional blocks within projects';
comment on column tasks.functional_block_id is 'Reference to functional block ID stored in projects.functional_blocks JSONB';
comment on column tasks.estimated_by_ai is 'Indicates whether the task estimation was performed by AI';
comment on column tasks.ai_confidence_score is 'AI confidence level in the estimation (0.00-1.00)';
comment on column tasks.ai_suggestion_context is 'Context identifier for AI suggestion feedback tracking';
comment on column tasks.ai_suggestion_hash is 'Hash identifier for specific AI suggestion feedback tracking';
comment on table task_dependencies is 'Manages predecessor/successor relationships between tasks';
comment on column task_dependencies.dependency_type is 'Type of dependency relationship (e.g., finish_to_start)';
comment on column profiles.default_estimation_unit is 'User preferred estimation unit (hours/storypoints)';
comment on column projects.estimation_unit is 'Estimation unit used for tasks in this project (hours/storypoints)';
