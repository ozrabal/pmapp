# API Endpoint Implementation Plan: Generate Project Schedule

## 1. Overview of the Endpoint

This endpoint will leverage AI to generate a project schedule based on the project's existing data (name, description, assumptions, and functional blocks). It will handle authentication, validate the project ownership, generate the schedule using the AI service, and update the project in the database with the generated schedule.

## 2. Request Details

- **HTTP Method**: POST
- **URL Structure**: `/api/projects/{id}/schedule/generate`
- **Parameters**:
  - Required: `id` (project ID as UUID in URL path)
  - Optional: None
- **Request Body**: None required

## 3. Required Types


The following types from the existing types.ts file will be used:
- `ScheduleStageDto` - Structure for each schedule stage
- `GenerateScheduleResponseDto` - Response format for generated schedule
- `ProjectDto` - For retrieving project data
- `UpdateProjectResponseDto` - For updating project with new schedule

A new schema should be created for AI schedule generation:
```typescript
// Schedule generation schema
export const scheduleGenerationSchema = z.object({
  stages: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      description: z.string(),
      dependencies: z.array(z.string()),
      relatedBlocks: z.array(z.string()),
      order: z.number(),
    })
  ),
});

export type ProjectSchedule = z.infer<typeof scheduleGenerationSchema>;
```

## 4. Response Details

- **Success Response**:
  - Status: 200 OK
  - Body: `GenerateScheduleResponseDto` with schedule data
    ```json
    {
      "schedule": {
        "stages": [
          {
            "id": "string",
            "name": "string",
            "description": "string",
            "dependencies": ["string"],
            "relatedBlocks": ["string"],
            "order": "number"
          }
        ]
      }
    }
    ```

- **Error Responses**:
  - 401 Unauthorized: User not authenticated
  - 403 Forbidden: User not authorized to access this project
  - 404 Not Found: Project not found
  - 500 Internal Server Error: AI service failure

## 5. Data Flow

1. Receive POST request to `/api/projects/{id}/schedule/generate`
2. Validate the project ID format using existing `projectIdSchema`
3. Verify user authentication using Supabase from context.locals
4. Get user ID from the authenticated session
5. Retrieve project data from the database (check ownership)
6. Call AI service to generate schedule based on project data
7. Update project in database with generated schedule
8. Return generated schedule to client

## 6. Security Considerations

- **Authentication**: Ensure user is authenticated using Supabase session
- **Authorization**: Verify that the authenticated user is the project owner
- **Input Validation**: Validate project ID format with Zod
- **Rate Limiting**: Consider implementing rate limiting for AI-intensive operations
- **Error Handling**: Clean error messages without leaking sensitive information

## 7. Error Handling

- **Invalid Project ID Format**: Return 400 Bad Request
- **Authentication Failure**: Return 401 Unauthorized
- **Authorization Failure**: Return 403 Forbidden
- **Project Not Found**: Return 404 Not Found 
- **AI Service Errors**: Return 500 Internal Server Error with appropriate message
- **Database Errors**: Return 500 Internal Server Error with generic message

## 8. Performance Considerations

- **AI Processing Time**: Generating schedules with AI may take time, consider:
  - Setting appropriate timeout values
  - Adding a background processing queue for large projects
  - Implementing a progress indicator or webhook for client notification
- **Response Size**: Limit the complexity of generated schedules for performance
- **Caching**: Consider caching generated schedules to avoid redundant AI calls

## 9. Implementation Steps

1. **Create AI Service Extension**:
   - Add `generateSchedule` method to the existing `AiService` class
   - Define system prompts for schedule generation
   - Format project context for schedule generation

2. **Create Schedule Schema**:
   - Add schedule schema to `src/lib/schemas/project.schema.ts` or create a new file
   - Define the structure and validation rules for the schedule

3. **Update Project Service**:
   - Add `generateProjectSchedule` method to handle the business logic
   - Integrate with AI service for schedule generation
   - Update project in database with generated schedule

4. **Create API Endpoint**:
   - Create file at `src/pages/api/projects/[id]/schedule/generate.ts`
   - Implement POST handler with authentication and error handling
   - Connect to project service to process the request

5. **Update Client Service**:
   - Add `generateProjectSchedule` method to `ProjectClientService`
   - Handle API communication and error states

6. **Add Error Handling**:
   - Integrate with existing error service
   - Define specific error types for schedule generation

7. **Test Implementation**:
   - Create unit tests for service methods
   - Create integration tests for the API endpoint
   - Manually test with real project data
