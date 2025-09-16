import React, { useState } from "react";
import TaskFormDialog from "./TaskFormDialog";
import DeleteTaskConfirmationDialog from "./DeleteTaskConfirmationDialog";
import type { TaskFormValues } from "@/lib/schemas/task-schemas";
import type { TaskListItemDto } from "@/types";

interface TaskDialogsManagerProps {
  // Create task handlers
  onCreateTask: (values: TaskFormValues) => Promise<void>;
  isCreating?: boolean;

  // Edit task handlers
  onEditTask: (taskId: string, values: TaskFormValues) => Promise<void>;
  isEditing?: boolean;

  // Delete task handlers
  onDeleteTask: (taskId: string) => Promise<void>;
  isDeleting?: boolean;
}

export type TaskDialogType = "create" | "edit" | "delete" | null;

export interface TaskDialogsRef {
  openDialog: (type: TaskDialogType, task?: TaskListItemDto) => void;
  closeDialog: () => void;
}

/**
 * Component that manages all task-related dialogs
 */
const TaskDialogsManager = React.forwardRef<TaskDialogsRef, TaskDialogsManagerProps>(
  ({ onCreateTask, isCreating = false, onEditTask, isEditing = false, onDeleteTask, isDeleting = false }, ref) => {
    const [activeDialog, setActiveDialog] = useState<TaskDialogType>(null);
    const [selectedTask, setSelectedTask] = useState<TaskListItemDto | null>(null);

    // Expose methods via ref
    React.useImperativeHandle(ref, () => ({
      openDialog: (type, task) => {
        setActiveDialog(type);
        if (task) {
          setSelectedTask(task);
        }
      },
      closeDialog: () => {
        setActiveDialog(null);
        setSelectedTask(null);
      },
    }));

    const closeDialog = () => {
      setActiveDialog(null);
      setSelectedTask(null);
    };

    // Handle creating task
    const handleCreateTask = async (values: TaskFormValues) => {
      await onCreateTask(values);
      closeDialog();
    };

    // Handle editing task
    const handleEditTask = async (values: TaskFormValues) => {
      if (!selectedTask) return;
      await onEditTask(selectedTask.id, values);
      closeDialog();
    };

    // Handle deleting task
    const handleDeleteTask = async () => {
      if (!selectedTask) return;
      await onDeleteTask(selectedTask.id);
      closeDialog();
    };

    return (
      <>
        {/* Create Task Dialog */}
        <TaskFormDialog
          isOpen={activeDialog === "create"}
          onClose={closeDialog}
          onSubmit={handleCreateTask}
          title="Dodaj nowe zadanie"
          description="Wprowadź informacje o nowym zadaniu."
          isLoading={isCreating}
        />

        {/* Edit Task Dialog */}
        <TaskFormDialog
          isOpen={activeDialog === "edit" && !!selectedTask}
          onClose={closeDialog}
          onSubmit={handleEditTask}
          title="Edytuj zadanie"
          description="Wprowadź zmiany w zadaniu."
          initialValues={
            selectedTask
              ? {
                  name: selectedTask.name,
                  description: selectedTask.description,
                  priority: selectedTask.priority,
                  estimatedValue: selectedTask.estimatedValue,
                }
              : undefined
          }
          isLoading={isEditing}
        />

        {/* Delete Task Confirmation Dialog */}
        <DeleteTaskConfirmationDialog
          isOpen={activeDialog === "delete" && !!selectedTask}
          onClose={closeDialog}
          onConfirm={handleDeleteTask}
          taskName={selectedTask?.name || ""}
        />
      </>
    );
  }
);

TaskDialogsManager.displayName = "TaskDialogsManager";

export default TaskDialogsManager;
