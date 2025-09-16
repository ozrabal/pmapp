import React from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

import TaskListItem from "./TaskListItem";
import type { TaskListItemDto } from "../../types";
import type { PaginationViewModel } from "./types";

interface TaskListProps {
  tasks: TaskListItemDto[];
  estimationUnit?: string;
  pagination?: PaginationViewModel;
  isLoading?: boolean;
  onTaskClick?: (taskId: string) => void; // Added optional onTaskClick property
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

/**
 * Component that displays a list of tasks with pagination
 */
const TaskList: React.FC<TaskListProps> = ({
  tasks,
  estimationUnit = "hours",
  pagination,
  isLoading = false,
  onTaskClick,
  onEditTask,
  onDeleteTask,
}) => {
  if (isLoading) {
    return (
      <div className="py-8 text-center text-slate-500">
        <div className="animate-pulse">Ładowanie zadań...</div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="py-8 text-center text-slate-500">
        <p>Brak zadań do wyświetlenia</p>
      </div>
    );
  }

  return (
    <div>
      <div data-testid="task-list">
        {tasks.map((task) => (
          <TaskListItem
            key={task.id}
            task={task}
            estimationUnit={estimationUnit}
            onEditTask={onEditTask}
            onDeleteTask={onDeleteTask}
            onTaskClick={onTaskClick} // Pass onTaskClick to TaskListItem
          />
        ))}
      </div>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-4">
          <Button
            variant="outline"
            size="sm"
            disabled={pagination.currentPage <= 1}
            onClick={() => pagination.onPageChange(pagination.currentPage - 1)}
            aria-label="Poprzednia strona"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="text-sm">
            Strona <span className="font-medium">{pagination.currentPage}</span> z{" "}
            <span className="font-medium">{pagination.totalPages}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => pagination.onPageChange(pagination.currentPage + 1)}
            aria-label="Następna strona"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
};

export default TaskList;
