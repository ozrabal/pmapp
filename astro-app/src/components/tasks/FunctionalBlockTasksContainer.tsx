import React, { useCallback, useRef } from "react";
import { ChevronDown, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTasksForFunctionalBlock } from "@/lib/services/tasks";

import TaskListHeader from "./TaskListHeader";
import TaskList from "./TaskList";
import EmptyTasksState from "./EmptyTasksState";
import { TaskDialogsManager, type TaskDialogsRef } from "./dialogs";
import type { TaskFormValues } from "@/lib/schemas/task-schemas";
import type { PaginationViewModel } from "./types";

interface FunctionalBlockTasksContainerProps {
  projectId: string;
  functionalBlockId: string;
  functionalBlockName: string;
  onToggleExpanded: (blockId: string) => void;
  isExpanded?: boolean;
  estimationUnit?: string;
}

/**
 * Container component for managing tasks within a functional block
 */
const FunctionalBlockTasksContainer: React.FC<FunctionalBlockTasksContainerProps> = ({
  projectId,
  functionalBlockId,
  functionalBlockName,
  onToggleExpanded,
  isExpanded = false,
  estimationUnit = "hours",
}) => {
  const dialogsRef = useRef<TaskDialogsRef>(null);

  // Use our custom hook for tasks management
  const {
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
    addTask,
    updateTask,
    removeTask,
    generateTasks,
  } = useTasksForFunctionalBlock(projectId, functionalBlockId, {
    initialFilter: { priority: "all" },
    initialSort: { field: "created_at", direction: "desc" },
    initialPage: 1,
    pageSize: 10,
  });

  // Callback to handle expanding/collapsing the task list
  const handleToggleExpanded = useCallback(() => {
    onToggleExpanded(functionalBlockId);
  }, [onToggleExpanded, functionalBlockId]);

  // Handler for opening the create task dialog
  const handleAddTask = useCallback(() => {
    dialogsRef.current?.openDialog("create");
  }, []);

  // Handler for opening the edit task dialog
  const handleEditTask = useCallback(
    (taskId: string) => {
      const taskToEdit = tasks.find((task) => task.id === taskId);
      if (taskToEdit) {
        dialogsRef.current?.openDialog("edit", taskToEdit);
      }
    },
    [tasks]
  );

  // Handler for opening the delete task dialog
  const handleDeleteTask = useCallback(
    (taskId: string) => {
      const taskToDelete = tasks.find((task) => task.id === taskId);
      if (taskToDelete) {
        dialogsRef.current?.openDialog("delete", taskToDelete);
      }
    },
    [tasks]
  );

  // Handler for task creation
  const handleCreateTask = useCallback(
    async (values: TaskFormValues) => {
      try {
        await addTask(values);
        toast.success("Zadanie utworzone", {
          description: "Zadanie zostało pomyślnie utworzone",
        });
      } catch (error) {
        toast.error("Błąd podczas tworzenia zadania", {
          description: error instanceof Error ? error.message : "Wystąpił nieznany błąd",
        });
      }
    },
    [addTask]
  );

  // Handler for task update
  const handleUpdateTask = useCallback(
    async (taskId: string, values: TaskFormValues) => {
      try {
        await updateTask(taskId, values);
        toast.success("Zadanie zaktualizowane", {
          description: "Zadanie zostało pomyślnie zaktualizowane",
        });
      } catch (error) {
        toast.error("Błąd podczas aktualizacji zadania", {
          description: error instanceof Error ? error.message : "Wystąpił nieznany błąd",
        });
      }
    },
    [updateTask]
  );

  // Handler for task deletion
  const handleDeleteTaskConfirmed = useCallback(
    async (taskId: string) => {
      try {
        await removeTask(taskId);
        toast.success("Zadanie usunięte", {
          description: "Zadanie zostało pomyślnie usunięte",
        });
      } catch (error) {
        toast.error("Błąd podczas usuwania zadania", {
          description: error instanceof Error ? error.message : "Wystąpił nieznany błąd",
        });
      }
    },
    [removeTask]
  );

  // Handler for task generation with AI
  const handleGenerateTasksWithAI = useCallback(async () => {
    try {
      await generateTasks();
      toast.success("Zadania wygenerowane", {
        description: "Zadania zostały pomyślnie wygenerowane przez AI",
      });
    } catch (error) {
      toast.error("Błąd podczas generowania zadań", {
        description: error instanceof Error ? error.message : "Wystąpił nieznany błąd",
      });
    }
  }, [generateTasks]);

  // Set up the pagination view model for TaskList
  const paginationViewModel: PaginationViewModel = {
    currentPage: pagination.page,
    totalPages: pagination.pages,
    totalItems: pagination.total,
    pageSize: pagination.limit,
    onPageChange: changePage,
  };

  return (
    <div className="mb-6">
      {/* Header with toggle button */}
      <div className="flex items-center space-x-2 mb-2">
        <Button variant="ghost" size="icon" onClick={handleToggleExpanded} className="h-6 w-6">
          {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
        </Button>
        <h3 className="text-lg font-medium">{functionalBlockName}</h3>
      </div>

      {/* Task content - only shown when expanded */}
      {isExpanded && (
        <div className="pl-8 mt-2">
          {/* Task list header with controls */}
          <TaskListHeader
            taskCount={pagination.total}
            totalEstimation={totalEstimation}
            filter={filter}
            onFilterChange={updateFilter}
            sort={sort}
            onSortChange={updateSort}
            onToggleSortDirection={toggleSortDirection}
            onAddTask={handleAddTask}
            onGenerateTasksWithAI={handleGenerateTasksWithAI}
            estimationUnit={estimationUnit}
          />

          {/* Error message */}
          {error && <div className="bg-destructive/10 text-destructive p-4 rounded-md mt-2">{error}</div>}

          {/* Task list or empty state */}
          {isLoading ? (
            <div className="flex justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : pagination.total > 0 ? (
            <TaskList
              tasks={tasks}
              pagination={paginationViewModel}
              onTaskClick={handleEditTask}
              onEditTask={handleEditTask}
              onDeleteTask={handleDeleteTask}
              estimationUnit={estimationUnit}
            />
          ) : (
            <EmptyTasksState onAddTask={handleAddTask} onGenerateTasksWithAI={handleGenerateTasksWithAI} />
          )}
        </div>
      )}

      {/* Dialogs manager */}
      <TaskDialogsManager
        ref={dialogsRef}
        onCreateTask={handleCreateTask}
        onEditTask={handleUpdateTask}
        onDeleteTask={handleDeleteTaskConfirmed}
      />
    </div>
  );
};

export default FunctionalBlockTasksContainer;
