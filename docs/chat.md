## US-004 Implementation Plan

- **Entry Trigger**
  - Add a primary “Create project” action in the projects list view that navigates to a `/projects/new` route rendering `CreateProjectChat`, gated by Supabase auth so anonymous users never see the flow.

- **Planning Session Lifecycle**
  - Ensure `useStartPlanning` fires only once per visit by stabilizing the `userId` dependency and show a loading/intro state until the assistant’s first message arrives.
  - Extend `CreateProjectChat` to disable submissions while mutations are in flight and to surface per-message progress plus the returned `nextActions`.

- **Backend Guardrails**
  - Update `POST /planning/start` to derive `userId` solely from `jwtPayload.sub` and remove the body parameter to avoid spoofing.
  - In `POST /planning/message`, verify the session belongs to the authenticated user, fix the conditional that compares against `CompletionStatus.INTRODUCTION`, and standardize error responses for unauthorized or completed sessions.

- **Step Validation & Progression**
  - Finalize `validateStepData` usage so each `PlanningStep` enforces `STEP_PROMPTS.requiredFields`, returning a structured list of missing/incomplete fields in the `ChatResponse` for the UI to render.
  - Keep the assistant’s follow-up prompts aligned with those validation results to clearly guide the user through each step.

- **Final Specification & Project Persistence**
  - On reaching `PlanningStep.COMPLETION`, generate the project specification, persist it via Drizzle ORM, attach the new project ID to the response, and show a “View project” CTA in the UI along with the generated summary.
  - Optimistically update the project list cache so the newly created project appears immediately after completion.

- **Error & Session Handling**
  - Handle “session not found” or “already completed” errors in the UI with a reset option that calls `POST /planning/start` again.
  - Surface API validation errors as inline alerts to keep users in the chat context.

- **Testing & Validation**
  - Add unit tests for planning utilities covering validation, `getNextStep`, and specification assembly.
  - Create integration tests for the `start` and `message` routes to confirm project creation at completion, plus an end-to-end UI test that walks through the conversation and ensures the project appears on the list.
