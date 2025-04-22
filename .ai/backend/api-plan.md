# REST API Plan for Plan My App

## 1. Resources

| Resource | Database Table | Description |
|----------|---------------|-------------|
| Users | profiles | User accounts and profiles |
| Projects | projects | App planning projects created by users |
| AI Feedbacks | ai_suggestion_feedbacks | User feedback on AI suggestions |
| User Activities | user_activities | Tracking of user actions in the app |
| User Sessions | user_sessions | User session information |

## 2. Endpoints

### 2.2 User Profile

#### Get Current User Profile
- **Method**: GET
- **Path**: `/api/users/profile`
- **Description**: Get current authenticated user's profile
- **Response**:
  ```json
  {
    "id": "uuid",
    "email": "string",
    "firstName": "string",
    "lastName": "string",
    "timezone": "string",
    "lastLoginAt": "string",
    "projectsLimit": "number",
    "createdAt": "string"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - Not authenticated

#### Update User Profile
- **Method**: PATCH
- **Path**: `/api/users/profile`
- **Description**: Update current user's profile
- **Request Body** (all fields optional):
  ```json
  {
    "firstName": "string",
    "lastName": "string",
    "timezone": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "firstName": "string",
    "lastName": "string",
    "timezone": "string",
    "updatedAt": "string"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Not authenticated

#### Delete User Account
- **Method**: DELETE
- **Path**: `/api/users/profile`
- **Description**: Soft delete user account
- **Request Body**:
  ```json
  {
    "password": "string"
  }
  ```
- **Response**:
  ```json
  {
    "message": "Account scheduled for deletion"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 400 Bad Request - Invalid password
  - 401 Unauthorized - Not authenticated

### 2.3 Projects

#### List Projects
- **Method**: GET
- **Path**: `/api/projects`
- **Description**: List all projects for current user
- **Query Parameters**:
  - `status` (optional): Filter by status
  - `page` (optional): Page number for pagination
  - `limit` (optional): Number of results per page
  - `sort` (optional): Sort field and direction
- **Response**:
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "description": "string",
        "createdAt": "string",
        "updatedAt": "string"
      }
    ],
    "pagination": {
      "total": "number",
      "page": "number",
      "limit": "number",
      "pages": "number"
    }
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - Not authenticated

#### Get Project
- **Method**: GET
- **Path**: `/api/projects/{id}`
- **Description**: Get a specific project by ID
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "assumptions": {},
    "functionalBlocks": {},
    "schedule": {},
    "createdAt": "string",
    "updatedAt": "string"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized to access this project
  - 404 Not Found - Project not found

#### Create Project
- **Method**: POST
- **Path**: `/api/projects`
- **Description**: Create a new project
- **Request Body**:
  ```json
  {
    "name": "string",
    "description": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "createdAt": "string"
  }
  ```
- **Success**: 201 Created
- **Errors**:
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Projects limit reached

#### Update Project
- **Method**: PATCH
- **Path**: `/api/projects/{id}`
- **Description**: Update a specific project
- **Request Body** (all fields optional):
  ```json
  {
    "name": "string",
    "description": "string",
    "assumptions": {},
    "functionalBlocks": {},
    "schedule": {}
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "name": "string",
    "description": "string",
    "assumptions": {},
    "functionalBlocks": {},
    "schedule": {},
    "updatedAt": "string"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized to update this project
  - 404 Not Found - Project not found

#### Delete Project
- **Method**: DELETE
- **Path**: `/api/projects/{id}`
- **Description**: Soft delete a project
- **Response**:
  ```json
  {
    "message": "Project deleted successfully"
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized to delete this project
  - 404 Not Found - Project not found

### 2.4 AI-Assisted Features

#### Validate Project Assumptions
- **Method**: POST
- **Path**: `/api/projects/{id}/assumptions/validate`
- **Description**: Validate project assumptions using AI
- **Response**:
  ```json
  {
    "isValid": "boolean",
    "feedback": [
      {
        "field": "string",
        "message": "string",
        "severity": "string"
      }
    ],
    "suggestions": [
      {
        "id": "string",
        "field": "string",
        "suggestion": "string",
        "reason": "string"
      }
    ]
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized to access this project
  - 404 Not Found - Project not found

#### Get Project Suggestions
- **Method**: POST
- **Path**: `/api/projects/{id}/suggestions`
- **Description**: Get AI suggestions for project definition
- **Request Body** (optional):
  ```json
  {
    "focus": "string"
  }
  ```
- **Response**:
  ```json
  {
    "suggestions": [
      {
        "id": "string",
        "type": "string",
        "content": "string",
        "reason": "string"
      }
    ]
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized to access this project
  - 404 Not Found - Project not found

#### Generate Functional Blocks
- **Method**: POST
- **Path**: `/api/projects/{id}/functional-blocks/generate`
- **Description**: Generate functional blocks using AI
- **Response**:
  ```json
  {
    "functionalBlocks": {
      "blocks": [
        {
          "id": "string",
          "name": "string",
          "description": "string",
          "category": "string",
          "dependencies": ["string"],
          "order": "number"
        }
      ]
    }
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized to access this project
  - 404 Not Found - Project not found

#### Export Functional Blocks
- **Method**: GET
- **Path**: `/api/projects/{id}/functional-blocks/export`
- **Query Parameters**:
  - `format`: Export format (json)
- **Description**: Export functional blocks in specified format
- **Response**: JSON
- **Success**: 200 OK
- **Errors**:
  - 400 Bad Request - Invalid format
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized to access this project
  - 404 Not Found - Project not found

#### Generate Schedule
- **Method**: POST
- **Path**: `/api/projects/{id}/schedule/generate`
- **Description**: Generate project schedule using AI
- **Response**:
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
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized to access this project
  - 404 Not Found - Project not found

#### Export Schedule
- **Method**: GET
- **Path**: `/api/projects/{id}/schedule/export`
- **Query Parameters**:
  - `format`: Export format (JSON)
- **Description**: Export schedule in specified format
- **Response**: JSON
- **Success**: 200 OK
- **Errors**:
  - 400 Bad Request - Invalid format
  - 401 Unauthorized - Not authenticated
  - 403 Forbidden - Not authorized to access this project
  - 404 Not Found - Project not found

### 2.5 AI Feedback

#### Submit AI Suggestion Feedback
- **Method**: POST
- **Path**: `/api/ai-feedbacks`
- **Description**: Submit feedback for an AI suggestion
- **Request Body**:
  ```json
  {
    "suggestionContext": "string",
    "suggestionHash": "string",
    "isHelpful": "boolean",
    "feedbackText": "string"
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "suggestionContext": "string",
    "isHelpful": "boolean",
    "createdAt": "string"
  }
  ```
- **Success**: 201 Created
- **Errors**:
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Not authenticated

### 2.6 User Activity

#### Record User Activity
- **Method**: POST
- **Path**: `/api/user-activities`
- **Description**: Manually record client-side activity
- **Request Body**:
  ```json
  {
    "activityType": "string",
    "durationSeconds": "number",
    "metadata": {}
  }
  ```
- **Response**:
  ```json
  {
    "id": "uuid",
    "activityType": "string",
    "createdAt": "string"
  }
  ```
- **Success**: 201 Created
- **Errors**:
  - 400 Bad Request - Invalid input
  - 401 Unauthorized - Not authenticated

#### Session Heartbeat
- **Method**: POST
- **Path**: `/api/user-sessions/heartbeat`
- **Description**: Update session status to keep it active
- **Response**:
  ```json
  {
    "sessionId": "uuid",
    "isActive": true
  }
  ```
- **Success**: 200 OK
- **Errors**:
  - 401 Unauthorized - Not authenticated

## 3. Authentication and Authorization

### 3.1 Authentication

The API will use Supabase Auth for authentication, which provides JWT (JSON Web Token) based authentication. Each API request must include a valid JWT token in the Authorization header:

```
Authorization: Bearer <jwt-token>
```

Authentication flow:
1. User registers or logs in via the auth endpoints
2. Client receives JWT token
3. Client includes token in subsequent API requests
4. Server validates token for each protected request

### 3.2 Authorization

Authorization will be implemented using Supabase Row Level Security (RLS) policies as defined in the database schema. Key authorization rules:

1. Users can only access their own profile data
2. Users can only access, modify, and delete their own projects
3. Users are limited to a maximum number of projects as defined in their profile
4. Soft-deleted resources are not accessible via regular endpoints

## 4. Validation and Business Logic

### 4.1 Input Validation

All API endpoints will use Zod schemas to validate request inputs before processing:

- Email validation: Format and uniqueness
- Password strength: Minimum 8 characters, including numbers and letters
- Character limits: As specified in database schema
- JSON structure validation: For complex objects like assumptions, functional_blocks, and schedule

### 4.2 Business Logic

Key business logic implemented in API endpoints:

1. **Project Limit Enforcement**:
   - Check user's current project count against their limit before creating new projects
   - Return appropriate error if limit is reached

2. **AI Integration Logic**:
   - Process AI responses for validations, suggestions, functional blocks, and schedule generation
   - Format AI outputs to match expected response structures
   - Handle AI service errors gracefully

3. **Export Functionality**:
   - Convert internal data structures to requested export formats
   - Generate appropriate content types and headers for file downloads

4. **Soft Delete Implementation**:
   - Set deleted_at timestamps instead of removing records
   - Filter out soft-deleted records in list queries
   - Schedule permanent deletion after retention period (30 days)

5. **User Activity Tracking**:
   - Automatically track user sessions using middleware
   - Calculate and store session durations on session end
   - Associate relevant activities with user sessions

### 4.3 Error Handling

Standardized error responses will be returned for all API endpoints:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": {} // Optional additional information
  }
}
```

Common error types:
- Validation errors (400)
- Authentication errors (401)
- Authorization errors (403)
- Resource not found errors (404)
- Rate limit errors (429)
- Server errors (500)