import type { TaskPriorityEnum, TaskListItemDto } from "../../types";

/**
 * View model for task filtering
 */
export interface TaskFilterViewModel {
  priority: TaskPriorityEnum | "all";
}

/**
 * View model for task sorting
 */
export interface TaskSortViewModel {
  field: "name" | "priority" | "estimatedValue" | "created_at";
  direction: "asc" | "desc";
}

/**
 * View model for the task list
 */
export interface TaskListViewModel {
  tasks: TaskListItemDto[];
  filter: TaskFilterViewModel;
  sort: TaskSortViewModel;
  isLoading: boolean;
}

/**
 * Pagination view model for task lists
 */
export interface PaginationViewModel {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}
