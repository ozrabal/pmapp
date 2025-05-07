-- Migration: 20250507000000_create_profile_trigger.sql
-- Description: Creates a trigger that automatically creates a user profile after signup

-- Create the function that will be triggered after user signup
CREATE OR REPLACE FUNCTION public.create_profile_after_signup()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    first_name,
    last_name,
    timezone,
    projects_limit,
    created_at,
    updated_at
  ) VALUES (
    NEW.id,
    'User',                -- Default value for first_name
    NULL,                  -- Default value for last_name (NULL)
    'UTC',                 -- Default timezone
    5,                     -- Default projects limit as specified in schema
    NOW(),
    NOW()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table to call the function after insert
CREATE TRIGGER create_profile_after_signup_trigger
AFTER INSERT ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.create_profile_after_signup();

-- Add comment to the function for better documentation
COMMENT ON FUNCTION public.create_profile_after_signup IS 'Automatically creates a user profile after registration in Supabase Auth';