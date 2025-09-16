import React, { memo } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { pl } from "date-fns/locale";

import TaskPriorityBadge from "./TaskPriorityBadge";
import TaskEstimationDisplay from "./TaskEstimationDisplay";
import type { TaskListItemDto } from "../../types";

interface TaskListItemProps {
  task: TaskListItemDto;
  estimationUnit?: string;
  onTaskClick?: (taskId: string) => void; // Added optional click handler
  onEditTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

/**
 * Component that displays a single task item in the task list
 */
const TaskListItem: React.FC<TaskListItemProps> = ({
  task,
  estimationUnit = "hours",
  onTaskClick,
  onEditTask,
  onDeleteTask,
}) => {
  // Format the relative time (e.g., "2 days ago")
  const formattedTime = formatDistanceToNow(new Date(task.updatedAt), {
    addSuffix: true,
    locale: pl,
  });

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEditTask(task.id);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteTask(task.id);
  };

  const handleCardClick = () => {
    if (onTaskClick) {
      onTaskClick(task.id);
    }
  };

  return (
    <Card
      className="mb-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-pointer"
      onClick={handleCardClick}
    >
      <CardContent className="p-4 flex justify-between items-start">
        <div className="space-y-1.5 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-base leading-none">{task.name}</h3>
            <TaskPriorityBadge priority={task.priority} />
          </div>

          {task.description && (
            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
            <TaskEstimationDisplay
              estimatedValue={task.estimatedValue}
              estimatedByAI={task.estimatedByAI}
              aiConfidenceScore={task.aiConfidenceScore}
              unit={estimationUnit}
            />
            <span aria-label="Ostatnia aktualizacja" title={`Ostatnia aktualizacja: ${formattedTime}`}>
              {formattedTime}
            </span>
          </div>
        </div>

        <div className="flex gap-1" data-testid={`task-actions-${task.id}`}>
          <Button variant="ghost" size="icon" onClick={handleEdit} aria-label="Edytuj zadanie">
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            aria-label="Usuń zadanie"
            className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Use memo to prevent unnecessary re-renders if the task data hasn't changed
export default memo(TaskListItem);
