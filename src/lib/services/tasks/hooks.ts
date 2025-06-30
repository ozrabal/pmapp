import { useCallback, useEffect, useState } from "react";
import type { PaginationDto, TaskDetailDto, TaskListItemDto, TaskPriorityEnum } from "@/types";
import { fetchTasksForBlock, createTask, updateTask, deleteTask, generateTasksWithAI } from "./api";
import type { TaskFilterViewModel, TaskSortViewModel } from "@/components/tasks/types";

/**
 * Hook for fetching and managing tasks for a functional block
 */
export function useTasksForFunctionalBlock(
  projectId: string,
  blockId: string,
  options: {
    initialFilter?: TaskFilterViewModel;
    initialSort?: TaskSortViewModel;
    initialPage?: number;
    pageSize?: number;
  } = {}
) {
  const [tasks, setTasks] = useState<TaskListItemDto[]>([]);

  const [filter, setFilter] = useState<TaskFilterViewModel>(options.initialFilter || { priority: "all" });

  const [sort, setSort] = useState<TaskSortViewModel>(
    options.initialSort || { field: "created_at", direction: "desc" }
  );

  const [pagination, setPagination] = useState<PaginationDto>({
    total: 0,
    page: options.initialPage || 1,
    limit: options.pageSize || 10,
    pages: 0,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch tasks based on current filter, sort, and pagination
  const loadTasks = useCallback(async () => {
    if (!projectId || !blockId) return;

    setIsLoading(true);
    setError(null);

    try {
      const queryOptions = {
        page: pagination.page,
        limit: pagination.limit,
        priority: filter.priority !== "all" ? (filter.priority as TaskPriorityEnum) : undefined,
        sort: `${sort.field}:${sort.direction}`,
      };

      const response = await fetchTasksForBlock(projectId, blockId, queryOptions);

      setTasks(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch tasks");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, blockId, filter.priority, sort.field, sort.direction, pagination.page, pagination.limit]);

  // Load tasks when dependencies change
  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  // Update filter
  const updateFilter = useCallback((newFilter: Partial<TaskFilterViewModel>) => {
    setFilter((prev) => {
      const updated = { ...prev, ...newFilter };
      // Reset to page 1 when filter changes
      setPagination((prev) => ({ ...prev, page: 1 }));
      return updated;
    });
  }, []);

  // Update sort
  const updateSort = useCallback((newSort: Partial<TaskSortViewModel>) => {
    setSort((prev) => ({ ...prev, ...newSort }));
    // Reset to page 1 when sort changes
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Toggle sort direction
  const toggleSortDirection = useCallback(() => {
    setSort((prev) => ({
      ...prev,
      direction: prev.direction === "asc" ? "desc" : "asc",
    }));
    // Reset to page 1 when sort direction changes
    setPagination((prev) => ({ ...prev, page: 1 }));
  }, []);

  // Change page
  const changePage = useCallback((page: number) => {
    setPagination((prev) => ({ ...prev, page }));
  }, []);

  // Add new task
  const addTask = useCallback(
    async (taskData: {
      name: string;
      description?: string | null;
      priority: TaskPriorityEnum;
      estimatedValue?: number | null;
    }) => {
      setIsLoading(true);
      setError(null);

      try {
        await createTask(projectId, blockId, taskData);
        // Reload tasks to include the new task
        await loadTasks();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create task");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, blockId, loadTasks]
  );

  // Update existing task
  const updateTaskItem = useCallback(
    async (
      taskId: string,
      taskData: {
        name?: string;
        description?: string | null;
        priority?: TaskPriorityEnum;
        estimatedValue?: number | null;
      }
    ) => {
      setIsLoading(true);
      setError(null);

      try {
        await updateTask(taskId, taskData);
        // Reload tasks to include the updates
        await loadTasks();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update task");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [loadTasks]
  );

  // Delete task
  const removeTask = useCallback(
    async (taskId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        await deleteTask(taskId);
        // Reload tasks after deletion
        await loadTasks();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete task");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [loadTasks]
  );

  // Generate tasks using AI
  const generateTasks = useCallback(
    async (options?: { count?: number; focus?: string }) => {
      setIsLoading(true);
      setError(null);

      try {
        await generateTasksWithAI(projectId, blockId, options);
        // Reload tasks to include AI-generated ones
        await loadTasks();
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to generate tasks with AI");
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [projectId, blockId, loadTasks]
  );

  // Calculate total estimation
  const totalEstimation = tasks.reduce((sum, task) => {
    if (task.estimatedValue === null) return sum;
    return sum + task.estimatedValue;
  }, 0);

  return {
    tasks,
    pagination,
    isLoading,
    error,
    filter,
    sort,
    totalEstimation,
    updateFilter,
    updateSort,
    toggleSortDirection,
    changePage,
    loadTasks,
    addTask,
    updateTask: updateTaskItem,
    removeTask,
    generateTasks,
  };
}

/**
 * Hook for managing expanded state of functional blocks
 */
export function useExpandedBlocks(initialState: Record<string, boolean> = {}) {
  const [expandedBlockIds, setExpandedBlockIds] = useState<Record<string, boolean>>(initialState);

  const toggleBlockExpanded = useCallback((blockId: string) => {
    setExpandedBlockIds((prev) => ({
      ...prev,
      [blockId]: !prev[blockId],
    }));
  }, []);

  return { expandedBlockIds, toggleBlockExpanded };
}

/**
 * Hook for managing a single task's data
 */
export function useTask(taskId: string | null) {
  const [task, setTask] = useState<TaskDetailDto | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTask = useCallback(async () => {
    if (!taskId) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/tasks/${taskId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch task: ${response.status}`);
      }

      const data = await response.json();
      setTask(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch task");
    } finally {
      setIsLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchTask();
    } else {
      setTask(null);
    }
  }, [taskId, fetchTask]);

  return {
    task,
    isLoading,
    error,
    refetch: fetchTask,
  };
}
