import React from "react";
import { Badge } from "@/components/ui/badge";
import type { TaskPriorityEnum } from "../../types";

interface TaskPriorityBadgeProps {
  priority: TaskPriorityEnum;
}

/**
 * Component that displays a task's priority as a badge with appropriate styling
 */
const TaskPriorityBadge: React.FC<TaskPriorityBadgeProps> = ({ priority }) => {
  // Define styling based on priority level
  const getPriorityStyle = (priority: TaskPriorityEnum) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      case "medium":
        return "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
      case "low":
        return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
      default:
        return "bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400";
    }
  };

  // Define human-readable label
  const getPriorityLabel = (priority: TaskPriorityEnum) => {
    switch (priority) {
      case "high":
        return "Wysoki";
      case "medium":
        return "Średni";
      case "low":
        return "Niski";
      default:
        return "Nieznany";
    }
  };

  return (
    <Badge variant="outline" className={`${getPriorityStyle(priority)} font-medium`}>
      {getPriorityLabel(priority)}
    </Badge>
  );
};

export default TaskPriorityBadge;
