import React from "react";
import type { ProjectDto } from "@/types";
import { ScheduleProvider, useSchedule } from "./ScheduleContext";
import ScheduleActionsPanel from "./ScheduleActionsPanel";
import EmptyScheduleState from "./EmptyScheduleState";
import ScheduleContent from "./ScheduleContent";
import LoadingSpinner from "./LoadingSpinner";
import ScheduleStageFormModal from "./ScheduleStageFormModal";
import type { ScheduleStageViewModel } from "./types";

interface ScheduleContainerProps {
  projectId: string;
  project: ProjectDto;
}

// Internal component that uses the schedule context
const ScheduleContainerContent: React.FC = () => {
  const {
    schedule,
    isLoading,
    isGenerating,
    error,
    editingStage,
    isModalOpen,
    generateSchedule,
    addStage,
    updateStage,
    deleteStage,
    reorderStages,
    setEditingStage,
    setIsModalOpen,
  } = useSchedule();

  // Handle form submission for adding/editing stages
  const handleSubmitStageForm = async (stageData: Partial<ScheduleStageViewModel>) => {
    try {
      if (editingStage) {
        // Update existing stage
        await updateStage(editingStage.id, stageData);
      } else {
        // Add new stage
        await addStage({
          name: stageData.name || "",
          description: stageData.description || "",
          dependencies: stageData.dependencies || [],
          relatedBlocks: [],
          order: schedule?.stages.length ? schedule.stages.length : 0,
        });
      }
      setIsModalOpen(false);
      setEditingStage(null);
    } catch (err) {
      console.error("Error saving stage:", err);
      throw err; // Let the modal component handle the error
    }
  };

  // Handle opening the form modal for adding a new stage
  const handleAddStage = () => {
    setEditingStage(null);
    setIsModalOpen(true);
  };

  // Handle opening the form modal for editing an existing stage
  const handleEditStage = (stage: ScheduleStageViewModel) => {
    setEditingStage(stage);
    setIsModalOpen(true);
  };

  // Get available stages for dependencies (excluding the current stage being edited)
  const getAvailableDependencies = () => {
    if (!schedule) return [];

    return editingStage ? schedule.stages.filter((stage) => stage.id !== editingStage.id) : schedule.stages;
  };

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <h2 className="text-lg font-medium text-red-800">Error loading schedule</h2>
        <p className="mt-1 text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Actions Panel */}
      <ScheduleActionsPanel
        isScheduleEmpty={!schedule || schedule.stages.length === 0}
        isGenerating={isGenerating}
        onGenerateSchedule={generateSchedule}
      />

      {/* Content area - Empty state or schedule content */}
      {!schedule || schedule.stages.length === 0 ? (
        <EmptyScheduleState onGenerateSchedule={generateSchedule} />
      ) : (
        <ScheduleContent
          schedule={schedule}
          onAddStage={handleAddStage}
          onEditStage={handleEditStage}
          onDeleteStage={deleteStage}
          onReorderStages={reorderStages}
        />
      )}

      {/* Modal for adding/editing stages */}
      <ScheduleStageFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        stage={editingStage || undefined}
        availableDependencies={getAvailableDependencies()}
        onSubmit={handleSubmitStageForm}
      />
    </div>
  );
};

// Main container component that provides the context
const ScheduleContainer: React.FC<ScheduleContainerProps> = ({ projectId, project }) => {
  return (
    <ScheduleProvider projectId={projectId} project={project}>
      <ScheduleContainerContent />
    </ScheduleProvider>
  );
};

export default ScheduleContainer;
