import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { ArrowDown, ArrowUp, Filter, Plus, Sparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";

import type { TaskFilterViewModel, TaskSortViewModel } from "./types";
import type { TaskPriorityEnum } from "../../types";

interface TaskListHeaderProps {
  taskCount: number;
  totalEstimation?: number | null;
  estimationUnit?: string;
  filter: TaskFilterViewModel;
  sort: TaskSortViewModel;
  onFilterChange: (filter: TaskFilterViewModel) => void;
  onSortChange: (sort: TaskSortViewModel) => void;
  onToggleSortDirection?: () => void; // Optional prop for toggling sort direction
  onAddTask: () => void;
  onGenerateTasksWithAI: () => void;
}

/**
 * Component displaying the header for the task list with filtering, sorting and actions
 */
const TaskListHeader: React.FC<TaskListHeaderProps> = ({
  taskCount,
  totalEstimation = null,
  estimationUnit = "hours",
  filter,
  sort,
  onFilterChange,
  onSortChange,
  onToggleSortDirection,
  onAddTask,
  onGenerateTasksWithAI,
}) => {
  // Handle priority filter change
  const handlePriorityChange = (value: string) => {
    onFilterChange({
      ...filter,
      priority: value as TaskPriorityEnum | "all",
    });
  };

  // Handle sort field change
  const handleSortFieldChange = (value: string) => {
    onSortChange({
      ...sort,
      field: value as TaskSortViewModel["field"],
    });
  };

  // Toggle sort direction - use provided function or fallback
  const handleToggleSortDirection = () => {
    if (onToggleSortDirection) {
      onToggleSortDirection();
    } else {
      onSortChange({
        ...sort,
        direction: sort.direction === "asc" ? "desc" : "asc",
      });
    }
  };

  // Format the total estimation display
  const formattedEstimation =
    totalEstimation !== null ? `${totalEstimation} ${estimationUnit === "hours" ? "godz." : "pkt"}` : "Brak estymacji";

  return (
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4">
      <div className="flex items-center gap-2">
        <Badge variant="secondary" className="py-1 px-2">
          {taskCount} {taskCount === 1 ? "zadanie" : taskCount < 5 ? "zadania" : "zadań"}
        </Badge>
        {totalEstimation !== null && (
          <Badge variant="outline" className="py-1 px-2">
            Łącznie: {formattedEstimation}
          </Badge>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {/* Priority Filter */}
        <div className="flex items-center gap-1.5 mr-1">
          <Filter className="h-4 w-4 text-slate-500" />
          <Select value={filter.priority} onValueChange={handlePriorityChange}>
            <SelectTrigger className="h-9 w-[120px]">
              <SelectValue placeholder="Priorytet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Wszystkie</SelectItem>
              <SelectItem value="low">Niski</SelectItem>
              <SelectItem value="medium">Średni</SelectItem>
              <SelectItem value="high">Wysoki</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Sort Field */}
        <Select value={sort.field} onValueChange={handleSortFieldChange}>
          <SelectTrigger className="h-9 w-[140px]">
            <SelectValue placeholder="Sortuj po" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="name">Nazwa</SelectItem>
            <SelectItem value="priority">Priorytet</SelectItem>
            <SelectItem value="estimatedValue">Estymacja</SelectItem>
            <SelectItem value="createdAt">Data utworzenia</SelectItem>
          </SelectContent>
        </Select>

        {/* Sort Direction */}
        <Button
          variant="outline"
          size="icon"
          className="h-9 w-9"
          onClick={handleToggleSortDirection}
          aria-label={sort.direction === "asc" ? "Sortuj rosnąco" : "Sortuj malejąco"}
        >
          {sort.direction === "asc" ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
        </Button>

        {/* Add Task Button */}
        <Button variant="outline" size="sm" className="ml-2" onClick={onAddTask} aria-label="Dodaj zadanie">
          <Plus className="h-4 w-4 mr-1" /> Dodaj
        </Button>

        {/* Generate with AI Button */}
        <Button
          variant="secondary"
          size="sm"
          onClick={onGenerateTasksWithAI}
          aria-label="Generuj zadania z AI"
          className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/70"
        >
          <Sparkles className="h-4 w-4 mr-1" /> Generuj z AI
        </Button>
      </div>
    </div>
  );
};

export default TaskListHeader;
