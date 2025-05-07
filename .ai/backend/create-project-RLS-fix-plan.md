# Project API Implementation Plan: Row-Level Security Fix

## Problem Overview

The project creation API is currently failing with the following error:
```
Error creating project: Error: Failed to create project: new row violates row-level security policy for table "projects"
```

This error occurs because the Supabase client lacks the proper authentication context when inserting data into a table with Row-Level Security (RLS) policies enabled.

## Root Cause

In Supabase, Row-Level Security policies restrict operations on tables based on the authenticated user. When creating a new project, the current implementation doesn't properly handle the RLS context, resulting in permission being denied by the database.

Specifically, the `projects` table likely has an RLS policy that only allows users to insert rows where their user ID matches the `user_id` column. When the API attempts to create a project, it must either:

1. Have an active authenticated session with Supabase that matches the user_id being set, or
2. Explicitly set the user_id when the operation is performed without an authenticated session context

## Implementation Solution

### 1. Modify the `createProject` method in `project.service.ts`

The solution involves enhancing the `createProject` method to properly handle RLS by:

1. **Checking for an active session**:
   - Query the Supabase auth session before attempting to create a project
   - Determine if we're operating within an authenticated context

2. **When a session is present**:
   - Verify the authenticated user ID matches the one we're trying to create the project for
   - Let RLS handle setting the user_id automatically (don't set it explicitly)

3. **When no session is present**:
   - Explicitly set the user_id when inserting the record
   - This allows the service to work even when called from contexts without authentication

### 2. Implement user verification

Add validation to ensure the authenticated user can only create projects for themselves:

```typescript
if (sessionData.session.user.id !== userId) {
  throw new Error("User ID mismatch: Cannot create project for another user");
}
```

### 3. Handle error logging and user feedback

Improve error handling to provide meaningful feedback:

```typescript
if (error) {
  console.error("Project creation error:", error);
  throw new Error(`Failed to create project: ${error.message}`);
}
```

## Testing Plan

1. **Test with authenticated context**:
   - Login and create a project through the frontend
   - Verify the project is created successfully
   - Check that the user_id is set correctly

2. **Test with service_role access**:
   - Use server-side logic to create a project without an authenticated session
   - Verify the project is created successfully
   - Check that the user_id is set correctly

3. **Test security boundaries**:
   - Attempt to create a project for another user
   - Verify that the operation fails with appropriate error message

## Additional Considerations

### RLS Policy Review

It's important to review the existing RLS policies on the `projects` table to ensure they're properly configured:

```sql
-- Example of a proper RLS policy for inserts
CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);
```

### Service Role Usage

When operating in server contexts (like scheduled jobs or migrations), consider using a service role client that can bypass RLS:

```typescript
const supabaseAdmin = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: { persistSession: false }
  }
);
```

## Rollout Plan

1. Implement the changes to the `createProject` method
2. Add comprehensive tests
3. Deploy to a staging environment
4. Verify functionality with real user sessions
5. Monitor for errors during initial release
6. Document the approach for handling RLS in other service methods

This implementation ensures proper handling of Supabase's Row-Level Security while maintaining flexibility to perform operations in both authenticated and service contexts.