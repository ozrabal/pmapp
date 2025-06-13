import type { Json } from "./db/database.types";

// Common Types

export interface PaginationDto {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

export interface ErrorResponseDto {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
}

// Enums based on database types

export type TaskPriorityEnum = "low" | "medium" | "high";
export type EstimationUnitEnum = "hours" | "storypoints";
export type TaskDependencyTypeEnum = "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish";

// User Profile DTOs

export interface UserProfileDto {
  id: string;
  email: string; // Note: Added from auth context, not in profiles table
  firstName: string;
  lastName: string | null;
  timezone: string;
  lastLoginAt: string | null;
  projectsLimit: number;
  createdAt: string;
}

export interface UpdateUserProfileRequestDto {
  firstName?: string;
  lastName?: string | null;
  timezone?: string;
}

export interface UpdateUserProfileResponseDto {
  id: string;
  firstName: string;
  lastName: string | null;
  timezone: string;
  updatedAt: string;
}

export interface DeleteUserAccountRequestDto {
  password: string;
}

export interface DeleteUserAccountResponseDto {
  message: string;
}

// Project DTOs

export interface ProjectSummaryDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListProjectsResponseDto {
  data: ProjectSummaryDto[];
  pagination: PaginationDto;
}

export interface ProjectDto {
  id: string;
  name: string;
  description: string | null;
  assumptions: Json | null;
  functional_blocks: Json | null;
  schedule: Json | null;
  createdAt: string;
  updatedAt: string;
  user_id: string;
}

export interface CreateProjectRequestDto {
  name: string;
  description?: string | null;
}

export interface CreateProjectResponseDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
}

export interface UpdateProjectRequestDto {
  name?: string;
  description?: string | null;
  assumptions?: Json | null;
  functionalBlocks?: Json | null;
  schedule?: Json | null;
}

export interface UpdateProjectResponseDto {
  id: string;
  name: string;
  description: string | null;
  assumptions: Json | null;
  functionalBlocks: Json | null;
  schedule: Json | null;
  updatedAt: string;
}

export interface DeleteProjectResponseDto {
  message: string;
}

// Task Management DTOs

export interface TaskDto {
  id: string;
  functionalBlockId: string;
  name: string;
  description: string | null;
  priority: TaskPriorityEnum;
  estimatedEffort: number | null;
  estimationUnit: EstimationUnitEnum | null;
  actualEffort: number | null;
  status: string;
  assignedTo: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTaskRequestDto {
  name: string;
  description?: string | null;
  priority?: TaskPriorityEnum;
  estimatedEffort?: number | null;
  estimationUnit?: EstimationUnitEnum | null;
  assignedTo?: string | null;
}

export interface CreateTaskResponseDto {
  id: string;
  functionalBlockId: string;
  name: string;
  description: string | null;
  priority: TaskPriorityEnum;
  createdAt: string;
}

export interface UpdateTaskRequestDto {
  name?: string;
  description?: string | null;
  priority?: TaskPriorityEnum;
  estimatedEffort?: number | null;
  estimationUnit?: EstimationUnitEnum | null;
  actualEffort?: number | null;
  status?: string;
  assignedTo?: string | null;
}

export interface UpdateTaskResponseDto {
  id: string;
  name: string;
  description: string | null;
  priority: TaskPriorityEnum;
  estimatedEffort: number | null;
  estimationUnit: EstimationUnitEnum | null;
  actualEffort: number | null;
  status: string;
  assignedTo: string | null;
  updatedAt: string;
}

export interface DeleteTaskResponseDto {
  message: string;
}

export interface ListTasksResponseDto {
  data: TaskDto[];
  pagination: PaginationDto;
}

export interface GenerateTasksResponseDto {
  tasks: TaskDto[];
}

export interface EstimateTaskResponseDto {
  taskId: string;
  estimatedEffort: number;
  estimationUnit: EstimationUnitEnum;
  confidence: number;
  reasoning: string;
}

export interface ValidateTaskResponseDto {
  isValid: boolean;
  feedback: FeedbackItemDto[];
  suggestions: SuggestionDto[];
}

// Task Dependencies DTOs

export interface TaskDependencyDto {
  id: string;
  dependentTaskId: string;
  prerequisiteTaskId: string;
  dependencyType: TaskDependencyTypeEnum;
  createdAt: string;
}

export interface CreateTaskDependencyRequestDto {
  prerequisiteTaskId: string;
  dependencyType?: TaskDependencyTypeEnum;
}

export interface CreateTaskDependencyResponseDto {
  id: string;
  dependentTaskId: string;
  prerequisiteTaskId: string;
  dependencyType: TaskDependencyTypeEnum;
  createdAt: string;
}

export interface DeleteTaskDependencyResponseDto {
  message: string;
}

export interface ListTaskDependenciesResponseDto {
  data: TaskDependencyDto[];
}

// AI-Assisted Feature DTOs

export interface FeedbackItemDto {
  field: string;
  message: string;
  severity: string;
}

export interface SuggestionDto {
  id: string;
  field?: string;
  type?: string;
  content?: string;
  suggestion?: string;
  reason: string;
}

export interface ValidateProjectAssumptionsResponseDto {
  isValid: boolean;
  feedback: FeedbackItemDto[];
  suggestions: SuggestionDto[];
}

export interface GetProjectSuggestionsRequestDto {
  focus?: string;
}

export interface GetProjectSuggestionsResponseDto {
  suggestions: SuggestionDto[];
}

export interface FunctionalBlockDto {
  id: string;
  name: string;
  description: string;
  category: string;
  dependencies: string[];
  order: number;
}

export interface GenerateFunctionalBlocksResponseDto {
  functionalBlocks: {
    blocks: FunctionalBlockDto[];
  };
}

export interface ScheduleStageDto {
  id: string;
  name: string;
  description: string;
  dependencies: string[];
  relatedBlocks: string[];
  order: number;
}

export interface GenerateScheduleResponseDto {
  schedule: {
    stages: ScheduleStageDto[];
  };
}

// AI Feedback DTOs

export interface SubmitAIFeedbackRequestDto {
  suggestionContext: string;
  suggestionHash: string;
  isHelpful: boolean;
  feedbackText?: string | null;
}

export interface SubmitAIFeedbackResponseDto {
  id: string;
  suggestionContext: string;
  isHelpful: boolean;
  createdAt: string;
}

// User Activity DTOs

export interface RecordUserActivityRequestDto {
  activityType: string;
  durationSeconds?: number | null;
  metadata?: Record<string, unknown> | null;
}

export interface RecordUserActivityResponseDto {
  id: string;
  activityType: string;
  createdAt: string;
}

export interface SessionHeartbeatResponseDto {
  sessionId: string;
  isActive: boolean;
}

// Export Formats

export type ExportFormat = "json";

// AI Service Types

export interface AiCompletionOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  model?: string;
}

export interface ToolCompletionOptions extends AiCompletionOptions {
  tool_choice?: string | object;
}

export interface AiTool {
  type: "function";
  function: {
    name: string;
    description: string;
    parameters: Record<string, unknown>;
  };
}

export interface ToolCompletionResult {
  message: string;
  toolCalls: {
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }[];
}

export interface MessageRequest {
  role: "system" | "user" | "assistant" | "function";
  content: string;
  name?: string;
}
