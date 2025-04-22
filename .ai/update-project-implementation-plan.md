# API Endpoint Implementation Plan: Update Project

## 1. Endpoint Overview
This PATCH endpoint will allow users to update specific properties of their projects. Updates can include modifying the project name, description, assumptions, functional blocks, or schedule. Only project owners will be authorized to update their projects.

## 2. Request Details
- **HTTP Method:** PATCH
- **URL Structure:** `/api/projects/{id}`
- **Parameters:**
  - **Required:** `id` (UUID) in the URL path
  - **Optional:** None
- **Request Body:**
  ```typescript
  {
    name?: string;
    description?: string | null;
    assumptions?: Json | null;
    functionalBlocks?: Json | null;
    schedule?: Json | null;
  }
  ```

## 3. Required Types
The following types are already defined in the project:
- `UpdateProjectRequestDto`: Request body type
- `UpdateProjectResponseDto`: Response body type
- `ErrorResponseDto`: Error response structure

For validation, a new Zod schema will be created for the update request body.

## 4. Response Details
- **Success Response (200 OK):**
  ```typescript
  {
    id: string;
    name: string;
    description: string | null;
    assumptions: Json | null;
    functionalBlocks: Json | null;
    schedule: Json | null;
    updatedAt: string;
  }
  ```
- **Error Responses:**
  - 400 Bad Request: Invalid input (malformed ID, validation errors in update data)
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User not authorized to update this project
  - 404 Not Found: Project not found
  - 500 Internal Server Error: Server-side error

## 5. Data Flow
1. Extract project ID from URL path parameters
2. Validate the ID format using the existing `projectIdSchema`
3. Extract and validate the request body using a new Zod schema
4. Get the authenticated user ID from context
5. Call the existing `ProjectService.updateProject()` method
6. Return the updated project data or an appropriate error response

## 6. Security Considerations
- **Authentication:** Use Supabase authentication to ensure only logged-in users can update projects
- **Authorization:** Verify that the authenticated user is the project owner before allowing updates
- **Input Validation:** Use Zod to validate all input data before processing
- **Error Handling:** Provide appropriate error messages without exposing sensitive information
- **Database Security:** Rely on Supabase's Row Level Security (RLS) as an additional security layer

## 7. Error Handling
- Validate project ID format
- Validate update data against schema requirements
- Handle database-specific errors (project not found, permission errors)
- Return appropriate HTTP status codes and error messages
- Log errors for debugging but don't expose implementation details to clients

## 8. Performance Considerations
- Use optimistic concurrency control to prevent conflicting updates
- Ensure that only changed fields are updated in the database
- Validate input data before performing database operations
- Use appropriate indexes in the database (already in place)

## 9. Implementation Steps

### 9.1. Create a validation schema for project updates
Add an update validation schema in `src/lib/schemas/project.schema.ts`:
```typescript
/**
 * Validation schema for project updates
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Project name is required" })
    .max(200, { message: "Project name must be 200 characters or less" })
    .optional(),
  
  description: z
    .string()
    .trim()
    .max(2000, { message: "Description must be 2000 characters or less" })
    .nullable()
    .optional(),
  
  assumptions: z.any().optional(),
  functionalBlocks: z.any().optional(),
  schedule: z.any().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;
```

### 9.2. Add PATCH handler to the projects/[id].ts file
Add the PATCH HTTP method handler to the existing file:
```typescript
/**
 * PATCH handler for updating a project by ID
 *
 * @param context - The Astro API context containing request data and locals
 * @returns Response with updated project data or error
 */
export async function PATCH(context: APIContext): Promise<Response> {
  // Get Supabase client from locals
  const { locals } = context;
  const { supabase } = locals;

  try {
    // Get project ID from path parameters
    const { id } = context.params;
    
    // Validate project ID format
    const validationResult = projectIdSchema.safeParse(id);
    if (!validationResult.success) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "invalid_parameter",
          message: "Invalid project ID format",
          details: validationResult.error.format(),
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Parse and validate the request body
    const requestBody = await context.request.json();
    const updateValidation = updateProjectSchema.safeParse(requestBody);
    
    if (!updateValidation.success) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "invalid_input",
          message: "Invalid update data",
          details: updateValidation.error.format(),
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Create the project service
    const projectService = new ProjectService(supabase);
    
    try {
      // Update the project (using DEFAULT_USER_ID for now)
      // TODO: Replace with actual user ID from authentication when implemented
      const updatedProject = await projectService.updateProject(
        DEFAULT_USER_ID, 
        validationResult.data, 
        updateValidation.data
      );
      
      // Return updated project data
      return new Response(JSON.stringify(updatedProject), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // Check error type and return appropriate response
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          const errorResponse: ErrorResponseDto = {
            error: {
              code: "not_found",
              message: "Project not found",
            },
          };
          
          return new Response(JSON.stringify(errorResponse), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
        
        if (error.message.includes("unauthorized") || error.message.includes("permission")) {
          const errorResponse: ErrorResponseDto = {
            error: {
              code: "forbidden",
              message: "You don't have permission to update this project",
            },
          };
          
          return new Response(JSON.stringify(errorResponse), {
            status: 403,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
      }
      
      // Re-throw other errors to be caught by the outer catch block
      throw error;
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error updating project:", error);

    // Return 500 Internal Server Error
    const errorResponse: ErrorResponseDto = {
      error: {
        code: "server_error",
        message: "An error occurred while updating the project",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
```

### 9.3. Ensure ProjectService.updateProject() is correctly implemented
The existing project service should already have an updateProject method. If not, implement it according to this signature:

```typescript
/**
 * Update an existing project
 *
 * @param userId - The ID of the user updating the project
 * @param projectId - The ID of the project to update
 * @param updates - The project update data
 * @returns A promise that resolves to an UpdateProjectResponseDto
 */
async updateProject(
  userId: string,
  projectId: string,
  updates: UpdateProjectRequestDto
): Promise<UpdateProjectResponseDto> {
  // Verify project exists and belongs to the user
  const { data: existingProject, error: findError } = await this.supabase
    .from("projects")
    .select("*")
    .eq("id", projectId)
    .eq("user_id", userId)
    .is("deleted_at", null)
    .single();

  if (findError || !existingProject) {
    if (findError?.code === "PGRST116") {
      throw new Error(`Project with id ${projectId} not found`);
    }
    throw new Error(`Failed to verify project: ${findError?.message || "Unknown error"}`);
  }

  // Prepare update object with snake_case keys for database
  const updateData: Record<string, unknown> = {};
  
  if (updates.name !== undefined) {
    updateData.name = updates.name;
  }
  
  if (updates.description !== undefined) {
    updateData.description = updates.description;
  }
  
  if (updates.assumptions !== undefined) {
    updateData.assumptions = updates.assumptions;
  }
  
  if (updates.functionalBlocks !== undefined) {
    updateData.functional_blocks = updates.functionalBlocks;
  }
  
  if (updates.schedule !== undefined) {
    updateData.schedule = updates.schedule;
  }

  // Only update if there are changes
  if (Object.keys(updateData).length === 0) {
    // If nothing to update, return current project data
    return {
      id: existingProject.id,
      name: existingProject.name,
      description: existingProject.description,
      assumptions: existingProject.assumptions,
      functionalBlocks: existingProject.functional_blocks,
      schedule: existingProject.schedule,
      updatedAt: existingProject.updated_at,
    };
  }

  // Update the project
  const { data: updatedProject, error: updateError } = await this.supabase
    .from("projects")
    .update(updateData)
    .eq("id", projectId)
    .eq("user_id", userId)
    .select()
    .single();

  if (updateError) {
    throw new Error(`Failed to update project: ${updateError.message}`);
  }

  return {
    id: updatedProject.id,
    name: updatedProject.name,
    description: updatedProject.description,
    assumptions: updatedProject.assumptions,
    functionalBlocks: updatedProject.functional_blocks,
    schedule: updatedProject.schedule,
    updatedAt: updatedProject.updated_at,
  };
}
```

### 9.4. Test the API Endpoint
1. Test with invalid project ID (should return 400)
2. Test with invalid update data (should return 400)
3. Test with non-existent project ID (should return 404)
4. Test with unauthorized user (should return 403)
5. Test with valid data (should return 200 with updated project)

### 9.5. Future Improvements
1. Replace `DEFAULT_USER_ID` with actual user ID from auth context
2. Add more specific validation for complex JSON structures (assumptions, functionalBlocks, schedule)
3. Implement optimistic concurrency control to prevent race conditions
4. Add CORS headers if the API will be accessed from different origins