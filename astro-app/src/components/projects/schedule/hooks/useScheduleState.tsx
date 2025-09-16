import { useState, useEffect, useCallback } from "react";
import type { ProjectDto, GenerateScheduleResponseDto } from "@/types";
import type { ProjectScheduleViewModel, ScheduleStageViewModel } from "../types";

// Helper function to map DTO to view model
const mapToViewModel = (scheduleData: ProjectScheduleViewModel): ProjectScheduleViewModel => {
  if (!scheduleData || !scheduleData.stages) {
    return { stages: [] };
  }

  return {
    stages: scheduleData.stages.map((stage: ScheduleStageViewModel) => ({
      ...stage,
      isExpanded: false,
    })),
    isGeneratedByAI: scheduleData.isGeneratedByAI || false,
    lastUpdated: scheduleData.lastUpdated || new Date().toISOString(),
  };
};

// Helper function to map view model back to DTO for API
const mapToDto = (schedule: ProjectScheduleViewModel): ProjectDto["schedule"] => {
  return {
    stages: schedule.stages.map((stage) => ({
      id: stage.id,
      name: stage.name,
      description: stage.description,
      dependencies: stage.dependencies,
      relatedBlocks: stage.relatedBlocks,
      order: stage.order,
    })),
    isGeneratedByAI: schedule.isGeneratedByAI,
    lastUpdated: new Date().toISOString(),
  };
};

export const useScheduleState = (projectId: string) => {
  // Schedule state
  const [schedule, setSchedule] = useState<ProjectScheduleViewModel>({
    stages: [],
    isGeneratedByAI: false,
    lastUpdated: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [editingStage, setEditingStage] = useState<ScheduleStageViewModel | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Function to fetch project schedule
  const fetchProjectSchedule = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        throw new Error(`Error fetching project: ${response.status}`);
      }

      const projectData: ProjectDto = await response.json();

      if (projectData.schedule) {
        setSchedule(mapToViewModel(projectData.schedule as unknown as ProjectScheduleViewModel));
      } else {
        setSchedule({
          stages: [],
          isGeneratedByAI: false,
          lastUpdated: new Date().toISOString(),
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error while fetching schedule");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Function to generate schedule using AI
  const generateSchedule = async () => {
    try {
      setIsGenerating(true);
      setError(null);

      const response = await fetch(`/api/projects/${projectId}/schedule/generate`, {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Error generating schedule: ${response.status}`);
      }

      const result: GenerateScheduleResponseDto = await response.json();

      // Convert response to view model
      const newSchedule: ProjectScheduleViewModel = {
        stages: result.schedule.stages.map((stage) => ({
          ...stage,
          isExpanded: false,
        })),
        isGeneratedByAI: true,
        lastUpdated: new Date().toISOString(),
      };

      setSchedule(newSchedule);

      // Update project on the server
      await updateScheduleOnServer(newSchedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error while generating schedule");
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper function to update schedule on the server
  const updateScheduleOnServer = async (updatedSchedule: ProjectScheduleViewModel) => {
    try {
      const response = await fetch(`/api/projects/${projectId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          schedule: mapToDto(updatedSchedule),
        }),
      });

      if (!response.ok) {
        throw new Error(`Error updating schedule: ${response.status}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error while updating schedule");
      throw err;
    }
  };

  // Function to update the entire schedule
  const updateSchedule = async (updatedSchedule: ProjectScheduleViewModel) => {
    try {
      setSchedule(updatedSchedule);
      await updateScheduleOnServer(updatedSchedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating schedule");
    }
  };

  // Function to add a new stage
  const addStage = async (stageData: Omit<ScheduleStageViewModel, "id">) => {
    if (!schedule) return;

    try {
      // Generate a unique ID for the new stage
      const newId = `stage_${Date.now()}`;

      const newStage: ScheduleStageViewModel = {
        id: newId,
        ...stageData,
      };

      const updatedSchedule = {
        ...schedule,
        stages: [...schedule.stages, newStage],
        lastUpdated: new Date().toISOString(),
      };

      setSchedule(updatedSchedule);
      await updateScheduleOnServer(updatedSchedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error adding stage");
      throw err;
    }
  };

  // Function to update an existing stage
  const updateStage = async (stageId: string, updates: Partial<ScheduleStageViewModel>) => {
    if (!schedule) return;

    try {
      const updatedStages = schedule.stages.map((stage) => (stage.id === stageId ? { ...stage, ...updates } : stage));

      const updatedSchedule = {
        ...schedule,
        stages: updatedStages,
        lastUpdated: new Date().toISOString(),
      };

      setSchedule(updatedSchedule);
      await updateScheduleOnServer(updatedSchedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error updating stage");
      throw err;
    }
  };

  // Function to delete a stage
  const deleteStage = async (stageId: string) => {
    if (!schedule) return;

    try {
      // Remove the stage
      const updatedStages = schedule.stages.filter((stage) => stage.id !== stageId);

      // Remove any dependencies on the deleted stage
      const stagesWithUpdatedDeps = updatedStages.map((stage) => ({
        ...stage,
        dependencies: stage.dependencies.filter((depId) => depId !== stageId),
      }));

      // Update order to ensure consecutive values
      const reorderedStages = stagesWithUpdatedDeps.map((stage, index) => ({
        ...stage,
        order: index,
      }));

      const updatedSchedule = {
        ...schedule,
        stages: reorderedStages,
        lastUpdated: new Date().toISOString(),
      };

      setSchedule(updatedSchedule);
      await updateScheduleOnServer(updatedSchedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error deleting stage");
      throw err;
    }
  };

  // Function to reorder stages via drag and drop
  const reorderStages = async (sourceId: string, destinationId: string) => {
    if (!schedule) return;

    try {
      const sourceIndex = schedule.stages.findIndex((stage) => stage.id === sourceId);
      const destinationIndex = schedule.stages.findIndex((stage) => stage.id === destinationId);

      if (sourceIndex === -1 || destinationIndex === -1) return;

      // Create a copy of stages
      const stagesCopy = [...schedule.stages];

      // Remove the source item
      const [movedStage] = stagesCopy.splice(sourceIndex, 1);

      // Insert at the destination
      stagesCopy.splice(destinationIndex, 0, movedStage);

      // Update order values
      const reorderedStages = stagesCopy.map((stage, index) => ({
        ...stage,
        order: index,
      }));

      const updatedSchedule = {
        ...schedule,
        stages: reorderedStages,
        lastUpdated: new Date().toISOString(),
      };

      setSchedule(updatedSchedule);
      await updateScheduleOnServer(updatedSchedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error reordering stages");
      throw err;
    }
  };

  // Initialize
  useEffect(() => {
    fetchProjectSchedule();
  }, [fetchProjectSchedule]);

  return {
    schedule,
    isLoading,
    isGenerating,
    error,
    editingStage,
    isModalOpen,
    fetchProjectSchedule,
    generateSchedule,
    updateSchedule,
    addStage,
    updateStage,
    deleteStage,
    reorderStages,
    setEditingStage,
    setIsModalOpen,
  };
};
