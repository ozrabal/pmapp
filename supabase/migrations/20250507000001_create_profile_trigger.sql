-- Migration: 20250507000001_create_profile_trigger.sql
-- Description: Creates a trigger that automatically creates a user profile after signup

-- Create the function that will be triggered after user signup


create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (
    id,
    first_name,
    last_name,
    timezone,
    projects_limit,
    created_at,
    updated_at)
  values (
    NEW.id,
    'User',                -- Default value for first_name
    NULL,                  -- Default value for last_name (NULL)
    'UTC',                 -- Default timezone
    5,                     -- Default projects limit as specified in schema
    NOW(),
    NOW()
  );
  return new;
end;
$$;

-- trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();