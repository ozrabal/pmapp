import type { ListTasksForBlockResponseDto, TaskDetailDto, TaskPriorityEnum } from "@/types";

/**
 * Fetches tasks for a specific functional block
 */
export async function fetchTasksForBlock(
  projectId: string,
  blockId: string,
  options: {
    page?: number;
    limit?: number;
    priority?: TaskPriorityEnum;
    sort?: string;
  } = {}
): Promise<ListTasksForBlockResponseDto> {
  try {
    const queryParams = new URLSearchParams();

    if (options.page !== undefined) {
      queryParams.append("page", options.page.toString());
    }

    if (options.limit !== undefined) {
      queryParams.append("limit", options.limit.toString());
    }

    if (options.priority !== undefined) {
      queryParams.append("priority", options.priority);
    }

    if (options.sort !== undefined) {
      queryParams.append("sort", options.sort);
    }

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";
    const response = await fetch(`/api/projects/${projectId}/functional-blocks/${blockId}/tasks${queryString}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Task Service] Error fetching tasks:", error);
    throw error;
  }
}

/**
 * Fetches a single task by ID
 */
export async function fetchTaskById(taskId: string): Promise<TaskDetailDto> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Task Service] Error fetching task:", error);
    throw error;
  }
}

/**
 * Creates a new task
 */
export async function createTask(
  projectId: string,
  blockId: string,
  taskData: {
    name: string;
    description?: string | null;
    priority: TaskPriorityEnum;
    estimatedValue?: number | null;
  }
): Promise<TaskDetailDto> {
  try {
    const response = await fetch(`/api/projects/${projectId}/functional-blocks/${blockId}/tasks`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Task Service] Error creating task:", error);
    throw error;
  }
}

/**
 * Updates an existing task
 */
export async function updateTask(
  taskId: string,
  taskData: {
    name?: string;
    description?: string | null;
    priority?: TaskPriorityEnum;
    estimatedValue?: number | null;
  }
): Promise<TaskDetailDto> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(taskData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Task Service] Error updating task:", error);
    throw error;
  }
}

/**
 * Deletes a task
 */
export async function deleteTask(taskId: string): Promise<{ success: boolean }> {
  try {
    const response = await fetch(`/api/tasks/${taskId}`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    return { success: true };
  } catch (error) {
    console.error("[Task Service] Error deleting task:", error);
    throw error;
  }
}

/**
 * Generates tasks using AI for a functional block
 */
export async function generateTasksWithAI(
  projectId: string,
  blockId: string,
  options?: {
    count?: number;
    focus?: string;
  }
): Promise<ListTasksForBlockResponseDto> {
  try {
    const response = await fetch(`/api/projects/${projectId}/functional-blocks/${blockId}/tasks/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(options || {}),
    });

    if (!response.ok) {
      const errorData = await response.json();

      if (errorData.code === "refresh_token_already_used") {
        // Log the error for debugging purposes
        console.error("[Task Service] Refresh token already used. Prompting reauthentication.");
        throw new Error("Session expired. Please log in again.");
      }

      console.error("[Task Service] Error generating tasks with AI:", errorData.error?.message || errorData); // Log the error for debugging purposes
      throw new Error(errorData.error?.message || `HTTP error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("[Task Service] Error generating tasks with AI:", error);
    throw error;
  }
}
