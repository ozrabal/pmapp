# Product Requirements Document (PRD) - Plan My App

## 1. Product Overview

Plan My App is an AI-powered application designed to streamline the application project planning process by providing structure, guidance, and automation of planning elements. The system is primarily targeted at project managers and developers building applications independently who need a comprehensive project planning tool.

The MVP version of the application enables defining basic project assumptions, dividing into functional blocks, creating a simple schedule, and detailed task management within each functional block. A key element is AI-powered decision support, which analyzes project assumptions, suggests optimal solutions, helps with task estimation, and automatically generates detailed tasks based on functional block descriptions.

Main benefits for users:

- Simplification of the project planning process
- Reduction of time needed to prepare a plan
- Minimization of the risk of omitting key project elements
- Access to AI support in making project decisions
- Organized project planning structure
- Detailed task management within functional blocks
- Automatic estimation of time and effort for tasks
- Increased transparency and organization of team work

## 2. User Problem

Planning the application development process is a complex task that often poses difficulties for people without project management experience. Main problems that Plan My App solves:

- Lack of structure in project planning - users often don't know where to start and how to organize work
- Difficulties with dividing functionality into logical implementation blocks
- Problems with estimating the time needed to complete individual elements
- Uncertainty about the order of task execution and dependencies between them
- Lack of access to expert knowledge about project management
- Lack of a central place to create and organize detailed tasks that make up functional blocks
- Difficulties with estimating time and effort for individual tasks
- Problems maintaining transparency and control over work progress within the project

As a result of these problems, many projects are not completed on time and within budget, and some never come to fruition due to an overly chaotic approach to planning. Additionally, lack of detailed task management leads to errors, misunderstandings, and low team efficiency.

Plan My App addresses these challenges by providing structure, AI support and automation of the planning process, as well as detailed task management, allowing users to manage time and resources more effectively.

## 3. Functional Requirements

### 3.1 User Account System

- User registration and login
- User profile management
- Storage of personal data and project information in compliance with GDPR
- Viewing an authenticated account summary (email, identifier, last sign-in, active token) from the dashboard

### 3.2 Project Management

- Browsing the user's project list (implemented as a paginated, read-only view)
- Creating new projects *(planned enhancement)*
- Saving, reading, and editing basic project assumptions *(planned enhancement)*
- Deleting projects *(planned enhancement)*

### 3.3 Defining Project Assumptions

- Structured form for entering basic assumptions
- AI validation of entered data
- AI suggestions regarding project definition

### 3.4 Division into Functional Blocks

- AI suggesting division into functional blocks based on assumptions
- Initial predefined categories (login, registration, project editing, results export, etc.)
- Ability for users to customize and modify functional blocks

### 3.5 Schedule Creation

- AI generation of simple project schedule
- Defining key project milestones
- Determining dependencies between stages

### 3.6 AI Suggestion Evaluation

- "Helpful/Not helpful" rating system for AI suggestions
- Collecting user feedback to improve algorithms

### 3.7 Task Management within Functional Blocks

- Creating, editing, and deleting tasks within selected functional blocks
- Manual estimation of time or effort for tasks
- AI-assisted estimation of time or effort for tasks
- Browsing tasks within functional blocks
- Defining simple dependencies between tasks (successor/predecessor relationships)
- Automatic task generation by AI based on functional block descriptions
- AI validation of estimation realism, description completeness, and consistency with functional blocks
- Exporting tasks along with the project in JSON format
- Integration of tasks with the project schedule

### 3.8 Conversational Planning Sessions

- Automatic creation of a planning session when a user launches the AI assistant flow
- Persistence of conversation history, collected project data, and current step per session
- AI-guided progression through predefined planning steps with progress indicators for current/total steps
- Ability to submit additional messages that refine collected data and trigger validation of required fields
- Server-side generation of a project specification when the final step is reached
- Session retrieval and deletion endpoints for resuming or terminating an in-progress plan

### 3.9 Protected Routing and Session Handling

- Middleware refreshes Supabase sessions on every request and propagates the originating path
- Server-side guard verifies authentication before rendering protected routes
- Automatic redirection of unauthenticated users to the login screen with return-path context
- Client-side logout clears the Supabase session and redirects to `/auth/login`

## 4. Product Boundaries

### 4.1 What is NOT in Scope for MVP

- Determining resources needed for project implementation
- Estimating project budget
- Creating detailed project schedule with exact dates
- Detailed estimation of execution time for individual functional blocks
- Sharing projects with other users
- Creating organizations and assigning projects to organizations
- Decision support regarding technology selection
- Integration with project management tools and calendars (planned for the future)
- Advanced task management features, such as different task statuses (beyond "to do")
- Assigning tasks to team members
- Tracking task completion progress
- Reporting and analytics regarding tasks
- Copying tasks between functional blocks
- Importing tasks from external sources
- Advanced dependencies between tasks beyond simple successor/predecessor relationships
- Integration with external project management systems

### 4.2 Technical Constraints

- AI resource availability affecting the speed and quality of generated suggestions
- Defined development time affecting MVP release schedule
- GDPR compliance requirements for storing personal data
- Limitations in task estimation units (set globally through configuration)
- Need for performance optimization with no limits on the number of tasks in a project

## 5. User Stories

### Registration and Login

#### US-001: New User Registration

- As a potential user, I want to create a new account so I can use the application's features
- Acceptance criteria:
  1. User can create an account by providing email, password, and name
  2. System verifies email address correctness and uniqueness
  3. System requires a password of appropriate strength (min. 8 characters, containing numbers and letters)
  4. After registration, user receives an email with an activation link
  5. Account is activated after clicking the activation link
  6. User profile is automatically created after registration with default values (name: 'User', timezone: 'UTC', project limit: 5)

#### US-002: System Login

- As a registered user, I want to log into the application to access my projects
- Acceptance criteria:
  1. User can log in by providing email and password
  2. System verifies login credentials correctness
  3. In case of incorrect credentials, system displays an appropriate message
  4. After successful login, user is redirected to the project list view

#### US-003: Password Recovery

- As a registered user, I want to reset my forgotten password to regain access to my account
- Acceptance criteria:
  1. User can initiate the password recovery process by providing email address
  2. System sends an email with a password reset link
  3. After clicking the link, user can set a new password
  4. System requires that the new password meets security criteria
  5. After changing the password, user is informed of successful reset

### Project Management

#### US-004: Creating a New Project

- As a logged-in user, I want to walk through a guided AI chat that captures everything needed to spin up a new project
- Acceptance criteria:
  1. Selecting “Create project” from the list view launches the `CreateProjectChat` flow which immediately calls `POST /planning/start` to open a planning session and show the assistant’s introductory message plus progress (current step/total).
  2. The client keeps the returned `sessionId` and sends every user reply through `POST /planning/message`, appending the assistant’s response—progress updates, required next actions, and collected data—to the visible conversation.
  3. The server validates each step against `STEP_PROMPTS`/`requiredFields`, persists messages and partial project data in the chat session, and only advances to the next step when validation succeeds.
  4. When the final step is reached the API generates a full project specification, marks the session `COMPLETED`, and returns the structured data so the UI can surface the finished spec and add the project to the user’s list.
  5. The flow is available only to authenticated users (US-002); attempting to reuse a completed session or an unknown `sessionId` results in an error response.

#### US-005: Browsing Project List

- As a logged-in user, I want to see a list of my projects to manage them
- Acceptance criteria:
  1. After login, user sees a list of their projects
  2. List contains basic project information (name, creation date, status)
  3. Projects are sorted from newest to oldest
  4. User can filter projects by status
  5. Functionality is not available without logging into the system (US-002)

#### US-006: Editing a Project

- As a logged-in user, I want to edit an existing project to update its details
- Acceptance criteria:
  1. From the project list, user can select a project to edit
  2. System displays a form with current project data
  3. User can modify all project fields
  4. After saving changes, system updates project data
  5. Functionality is not available without logging into the system (US-002)

#### US-007: Deleting a Project

- As a logged-in user, I want to delete a project I no longer need
- Acceptance criteria:
  1. From the project list, user can select the option to delete a project
  2. System asks for deletion confirmation
  3. After confirmation, project is permanently deleted from the system
  4. User receives confirmation of project deletion
  5. Functionality is not available without logging into the system (US-002)

#### US-008: Viewing Project Details

- As a logged-in user, I want to view my project's details to see all its elements
- Acceptance criteria:
  1. From the project list, user can select a project to view
  2. System displays detailed project information (project name, description, assumptions, functional blocks, schedule)
  3. User can switch between different project sections
  4. User can return to the project list at any time
  5. Functionality is not available without logging into the system (US-002)

#### US-009: Exporting a Project

- As a logged-in user, I want to export a project to a file so I can use it outside the application
- Acceptance criteria:
  1. From the project details view, user can select the export option
  2. System allows selection of export format (JSON)
  3. After selecting the format, system generates a file with project data
  4. User can download the generated file
  5. Exported file contains all information available in the application
  6. Functionality is not available without logging into the system (US-002)

### Defining Project Assumptions

#### US-010: Entering Basic Project Assumptions

- As a logged-in user, I want to enter basic assumptions for my project to define its scope
- Acceptance criteria:
  1. User has access to a structured form with fields defining project assumptions
  2. Form contains fields: project goal, main functionalities, technology
  3. System saves entered data in real-time
  4. User can edit assumptions at any time
  5. Functionality is not available without logging into the system (US-002)

#### US-011: Receiving AI Validation of Assumptions

- As a logged-in user, I want to receive information from AI about the correctness of my assumptions to ensure they are complete and consistent
- Acceptance criteria:
  1. System analyzes entered assumptions using AI
  2. AI checks completeness, consistency, and realism of assumptions
  3. User receives information about found problems or missing elements
  4. System suggests potential corrections or additions
  5. Each suggestion refers to a specific form field
  6. User can accept or reject AI suggestions
  7. After acceptance, system automatically moves user focus to the appropriate form field
  8. User sees suggestions next to the appropriate form fields
  9. User can make corrections to assumptions based on AI suggestions
  10. System saves changes in real-time
  11. User can at any time request AI to revalidate assumptions
  12. Functionality is not available without logging into the system (US-002)

#### US-012: Getting Suggestions for Project Definition

- As a logged-in user, I want to receive suggestions from AI regarding my project to improve its definition
- Acceptance criteria:
  1. AI analyzes entered data and project context
  2. System presents suggestions for improving project definition
  3. User can accept or reject individual suggestions
  4. After acceptance, suggestions are automatically implemented in the project definition
  5. Functionality is not available without logging into the system (US-002)

### Division into Functional Blocks

#### US-013: AI Generation of Functional Blocks

- As a logged-in user, I want AI to propose a division of my project into functional blocks to structure the development process
- Acceptance criteria:
  1. AI analyzes project assumptions and generates a proposal for division into functional blocks
  2. Generated blocks are categorized by functionality type
  3. Each block contains a brief description of work scope
  4. System presents generated blocks in a clear graphical form
  5. Functionality is not available without logging into the system (US-002)

#### US-014: Modifying Functional Blocks

- As a logged-in user, I want to modify proposed functional blocks to adapt them to my needs
- Acceptance criteria:
  1. User can edit the name, description, and scope of each block
  2. User can add new functional blocks
  3. User can delete unnecessary blocks
  4. User can change the order of blocks
  5. System saves all changes in real-time
  6. Functionality is not available without logging into the system (US-002)

#### US-015: Exporting Division into Functional Blocks

- As a logged-in user, I want to export the division into functional blocks to use it outside the application
- Acceptance criteria:
  1. User can select export format (PDF, CSV, JSON)
  2. System generates a file in the selected format containing all functional blocks and their descriptions
  3. User can download the generated file
  4. Exported file contains all information available in the application
  5. Functionality is not available without logging into the system (US-002)

### Schedule Creation

#### US-016: AI Generation of Simple Schedule

- As a logged-in user, I want AI to generate a simple project schedule to better plan the work
- Acceptance criteria:
  1. AI analyzes defined functional blocks and generates a project schedule
  2. Schedule contains key project implementation milestones
  3. System determines dependencies between individual stages
  4. Schedule is presented in the form of a Gantt chart or similar
  5. Functionality is not available without logging into the system (US-002)

#### US-017: Modifying Project Schedule

- As a logged-in user, I want to modify the generated schedule to adapt it to real capabilities
- Acceptance criteria:
  1. User can edit stage names and their descriptions
  2. User can modify the order and dependencies between stages
  3. User can add new stages or delete existing ones
  4. System saves all changes in real-time
  5. Functionality is not available without logging into the system (US-002)

#### US-018: Exporting Project Schedule

- As a logged-in user, I want to export the project schedule to use it outside the application
- Acceptance criteria:
  1. User can select export format (PDF, CSV, iCal)
  2. System generates a file in the selected format containing all schedule information
  3. User can download the generated file
  4. Exported file preserves the structure and dependencies between stages
  5. Functionality is not available without logging into the system (US-002)

### Task Management

#### US-019: Creating Tasks within a Functional Block

- As a logged-in user, I want to create tasks within a selected functional block to plan work in detail
- Acceptance criteria:
  1. From the functional block view, user can select the option to create a new task
  2. System presents a form with fields: name, description, priority (Low/Medium/High)
  3. After filling in the required fields, task is saved in the system
  4. New task appears on the task list within the given functional block
  5. System automatically assigns the task to the appropriate functional block
  6. Functionality is not available without logging into the system (US-002)

#### US-020: Manual Task Estimation

- As a logged-in user, I want to manually estimate time or effort for a task to better plan the schedule
- Acceptance criteria:
  1. When creating or editing a task, user can enter an estimation
  2. System allows selection of estimation units (hours or story points)
  3. Estimation units are set globally in the application configuration
  4. Estimation is saved with the task
  5. System validates entered estimation values (only positive numbers)
  6. Functionality is not available without logging into the system (US-002)

#### US-021: AI-Assisted Task Estimation

- As a logged-in user, I want to receive time or effort estimation for a task from AI to get an objective assessment
- Acceptance criteria:
  1. When creating or editing a task, user can ask AI for estimation
  2. AI analyzes task description, functional block context, and entire project
  3. System presents suggested estimation with justification
  4. User can accept, reject, or modify AI suggestion
  5. AI checks estimation realism and warns against unrealistic values
  6. System saves information about estimation origin (manual/AI)
  7. Functionality is not available without logging into the system (US-002)

#### US-022: Browsing Tasks within a Functional Block

- As a logged-in user, I want to browse all tasks within a functional block to control work progress
- Acceptance criteria:
  1. From the functional block view, user sees a list of all tasks
  2. List contains basic task information (name, priority, estimation)
  3. Tasks are sorted by priority and creation order
  4. User can filter tasks by priority
  5. System displays total estimation of all tasks in the block
  6. Functionality is not available without logging into the system (US-002)

#### US-023: Editing and Deleting Tasks

- As a logged-in user, I want to edit and delete tasks to keep plans up to date
- Acceptance criteria:
  1. From the task list, user can select a task to edit
  2. System displays a form with current task data
  3. User can modify all task fields
  4. User can delete a task with appropriate confirmation
  5. System warns before deleting tasks with dependencies and suggests solutions
  6. After saving changes, system updates task data
  7. Functionality is not available without logging into the system (US-002)

#### US-024: Defining Dependencies Between Tasks

- As a logged-in user, I want to define simple dependencies between tasks to maintain logical execution order
- Acceptance criteria:
  1. When editing a task, user can select preceding tasks
  2. System allows defining successor/predecessor relationships
  3. System checks and warns against creating circular dependencies
  4. Dependencies are visualized in the user interface
  5. System automatically considers dependencies when generating the schedule
  6. Functionality is not available without logging into the system (US-002)

#### US-025: Automatic Task Generation by AI

- As a logged-in user, I want to automatically generate tasks based on functional block description to speed up the planning process
- Acceptance criteria:
  1. From the functional block view, user can select the automatic task generation option
  2. AI analyzes functional block description and entire project context
  3. System presents a list of proposed tasks with descriptions and estimations
  4. User can select which tasks they want to create
  5. User can modify proposed tasks before creation
  6. System creates selected tasks within the given functional block
  7. Functionality is not available without logging into the system (US-002)

#### US-026: AI Task Validation

- As a logged-in user, I want to receive task validation from AI to ensure their completeness and consistency
- Acceptance criteria:
  1. User can ask AI to validate tasks within a functional block
  2. AI checks description completeness, estimation realism, and consistency with functional block
  3. System presents a report with found problems and correction suggestions
  4. User receives specific guidance for each problem
  5. User can accept suggestions and automatically apply corrections
  6. System can assess whether tasks in the block cover all planned functionalities
  7. Functionality is not available without logging into the system (US-002)

#### US-027: Exporting Project with Tasks

- As a logged-in user, I want to export a project along with tasks to use the data outside the application
- Acceptance criteria:
  1. From the project details view, user can select the export option with tasks
  2. System allows selection of export format (JSON)
  3. Exported file contains all information about project, functional blocks, and tasks
  4. File contains dependencies between tasks and estimation information
  5. User can download the generated file
  6. System preserves hierarchical structure project → blocks → tasks
  7. Functionality is not available without logging into the system (US-002)

### AI Suggestion Evaluation

#### US-028: Rating AI Suggestion Usefulness

- As a logged-in user, I want to rate the usefulness of AI suggestions to help improve the algorithms
- Acceptance criteria:
  1. Each AI suggestion has "helpful" and "not helpful" buttons available
  2. After rating, system saves user feedback
  3. User receives a thank you message for providing feedback
  4. System uses collected data to improve AI algorithms
  5. Functionality is not available without logging into the system (US-002)

#### US-029: Reporting Inadequate AI Suggestions

- As a logged-in user, I want to report inadequate or incorrect AI suggestions to improve system quality
- Acceptance criteria:
  1. User can report an incorrect AI suggestion
  2. System allows adding a comment explaining the problem
  3. Reports are stored in the system for analysis
  4. User receives confirmation of report acceptance
  5. Functionality is not available without logging into the system (US-002)

### Account Management

#### US-030: Editing User Profile

- As a logged-in user, I want to edit my profile to update my personal information
- Acceptance criteria:
  1. User has access to the profile editing page
  2. User can change first name, last name, avatar, and other personal data
  3. User can change password (with confirmation of old password)
  4. System saves changes and updates profile data
  5. Functionality is not available without logging into the system (US-002)

#### US-031: Deleting Account

- As a logged-in user, I want to delete my account if I no longer wish to use the application
- Acceptance criteria:
  1. User can initiate the account deletion process from profile settings
  2. System requires password confirmation and account deletion intent
  3. System informs about consequences of account deletion (loss of all projects)
  4. After confirmation, account is permanently deleted along with all user data
  5. Data is deleted in compliance with GDPR requirements
  6. Functionality is not available without logging into the system (US-002)

### Dashboard and Access Control

#### US-032: Viewing Account Summary

- As a logged-in user, I want to see my session details so that I can confirm which account is active
- Acceptance criteria:
  1. Dashboard displays the authenticated user's email, unique identifier, and last sign-in timestamp
  2. A redacted or clearly labeled access token is shown for debugging purposes
  3. Loading and error states are presented while user information is being fetched
  4. View is only available to authenticated users (US-002)

#### US-033: Redirecting Unauthenticated Visitors

- As an unauthenticated visitor, I want to be guided to the login page so that access to protected content remains secure
- Acceptance criteria:
  1. Middleware persists the originally requested path in a header or query parameter
  2. Protected routes invoke a server-side guard that checks the Supabase session
  3. If no authenticated session exists, the user is redirected to `/auth/login` with the original path as a `source` parameter
  4. After successful login, the user is returned to the requested destination

### Planning Sessions

#### US-034: Starting a Planning Session

- As a logged-in user, I want to launch an AI-guided planning session to structure my project
- Acceptance criteria:
  1. Selecting “Create Project” initiates a new planning session and returns a session identifier
  2. The assistant sends the introduction prompt automatically
  3. Session metadata stores the current planning step, progress, and collected data
  4. Functionality is not available without logging into the system (US-002)

#### US-035: Continuing a Planning Conversation

- As a logged-in user, I want to send additional messages within an existing planning session to refine my project brief
- Acceptance criteria:
  1. Each message is appended to the session history along with an AI response
  2. Required fields for the active step are validated, and missing data is highlighted in the assistant reply
  3. Progress indicators update to reflect the number of completed steps
  4. Collected data is merged and persisted after each interaction

#### US-036: Completing a Planning Session

- As a logged-in user, I want to receive a project specification once the planning steps are complete
- Acceptance criteria:
  1. When all required fields are provided, the assistant advances to the completion step
  2. A project specification is generated on the server and returned in the assistant’s response
  3. Completion status is saved so closed sessions cannot accept additional messages
  4. Users may fetch or delete their finished sessions via session endpoints

## 6. Success Metrics

### 6.1 Adoption and Engagement Metrics

- Number of new registrations (goal: 10% monthly growth)
- Percentage of users actively using the application (goal: 40% in the first month)
- Average time spent in the application (goal: minimum 15 minutes per session)
- Number of projects created per user (goal: minimum 2 projects)

### 6.2 AI Quality Metrics

- Percentage of AI suggestions rated as "helpful" (goal: above 70%)
- Number of modifications made by users to AI suggestions (goal: below 30%)
- Percentage of users using AI suggestions (goal: above 80%)

### 6.3 Efficiency Metrics

- Average time needed to define project assumptions (goal: below 30 minutes)
- Average time needed to divide project into functional blocks (goal: below 20 minutes)
- Average time needed to create a schedule (goal: below 15 minutes)

### 6.4 Satisfaction Metrics

- Overall application rating by users (goal: minimum 4.5/5)
- Percentage of users recommending the application (NPS) (goal: above 40)
- Percentage of users reporting problems or bugs (goal: below 5%)

### 6.5 Key MVP Performance Indicators

- Number of users who successfully created a complete project with all elements: assumptions, functional blocks, schedule (goal: minimum 60% of users)
- Percentage of users returning to the application one week after registration (goal: minimum 30%)
- Percentage of projects with created tasks (goal: minimum 60% of all projects)
- Average number of tasks per functional block (planning detail indicator)
- Number of projects exported to external formats (goal: minimum 20% of all projects)

### 6.6 Task Management Metrics

- Percentage of users utilizing task management features (goal: above 70%)
- Average number of tasks created by AI per functional block (AI efficiency indicator)
- Percentage of tasks with time estimation (goal: above 80%)
- Percentage of estimations performed by AI vs manually (AI adoption indicator)
- Average time to create a task (goal: below 3 minutes)
- Percentage of tasks with defined dependencies (planning advancement indicator)
