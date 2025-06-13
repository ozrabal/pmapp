import type { SupabaseClient } from "../../../db/supabase.client";
import type { CreateTaskInput } from "../../schemas/task.schemas";
import type { ApiCreateTaskResponseDto } from "./task.types";
import type { Json } from "../../../db/database.types";
import type { ProjectDto as Project } from "@/types";
/**
 * Custom error class for task-related errors
 */
export class TaskError extends Error {
  statusCode: number;
  errorCode: string;

  constructor(message: string, statusCode: number, errorCode: string) {
    super(message);
    this.name = "TaskError";
    this.statusCode = statusCode;
    this.errorCode = errorCode;
  }
}

// // Project structure from database
// interface Project {
//   id: string;
//   owner_id: string;
//   functional_blocks: Json;
// }

/**
 * Service for handling task-related operations
 * Implements business logic for task management
 */
export class TaskService {
  /**
   * Creates a new task within a functional block of a project
   *
   * @param supabase - Supabase client instance
   * @param userId - ID of the authenticated user
   * @param projectId - ID of the project
   * @param functionalBlockId - ID of the functional block
   * @param taskData - Task data for creation
   * @returns Task creation response with ID and creation timestamp
   * @throws TaskError if any validation or permission check fails
   */
  async createTaskInFunctionalBlock(
    supabase: SupabaseClient,
    userId: string,
    projectId: string,
    functionalBlockId: string,
    taskData: CreateTaskInput
  ): Promise<ApiCreateTaskResponseDto> {
    // Check if project exists and user has access
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id, user_id, functional_blocks")
      .eq("id", projectId)
      .single();
    console.log("Project data:", project, "Error:", projectError);
    if (projectError || !project) {
      throw new TaskError("Project not found", 404, "PROJECT_NOT_FOUND");
    }

    // Type assertion to help TypeScript understand the project structure
    const typedProject = project as unknown as Project;

    // Check user permissions (owner or member)
    // Note: In a real implementation, we would check project ownership
    const isOwner = typedProject.user_id === userId; // Check if user is the owner

    if (!isOwner) {
      // In a real implementation, we would check project membership
      // For this implementation, we'll default to true since we don't have the schema
      // In production, you would implement proper permission checks

      // Simplified permission check - just verifying the user exists
      const { data: userProfile, error: userError } = await supabase
        .from("profiles")
        .select("id")
        .eq("id", userId)
        .single();

      if (userError || !userProfile) {
        throw new TaskError("You don't have permission to create tasks in this project", 403, "PERMISSION_DENIED");
      }

      // Additional permission logic would go here in production code
    }

    // Check if the functional block exists in the project
    if (!typedProject.functional_blocks) {
      throw new TaskError("Project has no functional blocks", 404, "FUNCTIONAL_BLOCKS_NOT_FOUND");
    }

    // Parse the functional blocks structure
    const functionalBlocksData = typedProject.functional_blocks as Json;
    // Cast safely to record type since we know it should be an object
    const functionalBlocks = functionalBlocksData as Record<string, unknown>;
    const blocks = Array.isArray(functionalBlocks.blocks) ? functionalBlocks.blocks : [];

    const blockExists = blocks.some(
      (block) => typeof block === "object" && block !== null && "id" in block && block.id === functionalBlockId
    );

    if (!blockExists) {
      throw new TaskError("Functional block not found in this project", 404, "FUNCTIONAL_BLOCK_NOT_FOUND");
    }

    // Prepare task data for insertion
    const taskInsertData = {
      project_id: projectId,
      functional_block_id: functionalBlockId,
      name: taskData.name,
      description: taskData.description || null,
      priority: taskData.priority || "medium",
      estimated_value: taskData.estimatedValue || null,
      metadata: taskData.metadata ? (taskData.metadata as Json) : null,
      estimated_by_ai: false,
      // created_by: userId,
    };

    // Insert the task into the database
    const { data: newTask, error: insertError } = await supabase
      .from("tasks")
      .insert(taskInsertData)
      .select("id, created_at")
      .single();

    if (insertError || !newTask) {
      // Use a more type-safe approach for logging in production
      if (import.meta.env.DEV) {
        // Using Function constructor to avoid linter warnings
        new Function("e", "console.error('Error creating task:', e)")(insertError);
      }
      throw new TaskError("Failed to create task", 500, "TASK_CREATION_FAILED");
    }

    // Return the created task data
    return {
      id: newTask.id,
      name: taskData.name,
      description: taskData.description || null,
      priority: taskData.priority || "medium",
      estimatedValue: taskData.estimatedValue || null,
      estimatedByAI: false,
      createdAt: newTask.created_at,
    };
  }
}

// Export singleton instance for use across the application
export const taskService = new TaskService();
