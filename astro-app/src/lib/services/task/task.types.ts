import type { TaskPriorityEnum } from "../../../types";

/**
 * API types for creating tasks
 * These types are specific to API requests and responses
 */

// API request type for creating a new task
export interface ApiCreateTaskRequestDto {
  name: string;
  description?: string | null;
  priority?: TaskPriorityEnum;
  estimatedValue?: number | null;
  metadata?: Record<string, unknown> | null;
}

// API response type for task creation
export interface ApiCreateTaskResponseDto {
  id: string;
  name: string;
  description: string | null;
  priority: TaskPriorityEnum;
  estimatedValue: number | null;
  estimatedByAI: boolean;
  createdAt: string;
}
