-- Migration: 20250507000002_drop_profile_trigger.sql
-- Description: Reverts changes made by 20250507000001_create_profile_trigger.sql by dropping the trigger and function

-- Drop the trigger first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Then drop the function
DROP FUNCTION IF EXISTS public.handle_new_user();