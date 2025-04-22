-- Migration: Add status column to projects table
-- Description: Adds a status column to track project lifecycle (draft, in-progress, completed, on-hold)
-- Date: 2025-04-22
-- Author: Database Administrator

-- Add status column to projects table
-- This column will store the current state of each project with a default value of 'draft'
alter table projects 
    add column status varchar(50) not null default 'active';

-- Add an index to improve filtering and sorting by status
create index idx_projects_status on projects (status);

comment on column projects.status is 'Status projektu (np. ''active'', ''archived'', ''completed'')';

-- Update RLS policies to ensure they work with the new column
-- We don't need to modify the existing policies as they don't filter based on status,
-- but documenting this decision for future reference