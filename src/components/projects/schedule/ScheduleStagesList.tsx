import React from "react";
import { type ScheduleStageViewModel } from "./types";
import ScheduleStageItem from "./ScheduleStageItem";
import { useDrag } from "./hooks/useDrag";

interface ScheduleStagesListProps {
  stages: ScheduleStageViewModel[];
  dependencies: Record<string, ScheduleStageViewModel[]>;
  onEditStage: (stage: ScheduleStageViewModel) => void;
  onDeleteStage: (stageId: string) => Promise<void>;
  onReorderStages: (sourceId: string, destinationId: string) => Promise<void>;
}

const ScheduleStagesList: React.FC<ScheduleStagesListProps> = ({
  stages,
  dependencies,
  onEditStage,
  onDeleteStage,
  onReorderStages,
}) => {
  // Sort stages by their order property
  const sortedStages = [...stages].sort((a, b) => a.order - b.order);

  // Use custom drag hook for drag and drop functionality
  const { draggedItemId, getDragProps } = useDrag(sortedStages, "id", {
    onOrderChange: async (reorderedItems) => {
      // Find the dragged item and its new target position
      const sourceIndex = sortedStages.findIndex((s) => s.id === draggedItemId);
      const targetIndex = reorderedItems.findIndex((s) => s.id === draggedItemId);

      if (sourceIndex !== targetIndex && sourceIndex !== -1 && targetIndex !== -1) {
        // Get the actual IDs for the API call
        const sourceId = sortedStages[sourceIndex].id;
        const destinationId = sortedStages[targetIndex === 0 ? 0 : targetIndex - 1].id;

        // Call the parent handler with source and destination IDs
        await onReorderStages(sourceId, destinationId);
      }
    },
  });

  return (
    <div className="space-y-3" role="list" aria-label="Etapy harmonogramu projektu">
      {sortedStages.map((stage) => {
        // Find actual dependency objects for this stage
        const stageDependencies = stage.dependencies
          .map((depId) => stages.find((s) => s.id === depId))
          .filter(Boolean) as ScheduleStageViewModel[];

        // Find stages that depend on this stage
        const dependentStages = dependencies[stage.id] || [];

        return (
          <div
            key={stage.id}
            className={`
              transition-colors duration-200 
              ${draggedItemId && draggedItemId !== stage.id ? "border-2 border-dashed border-primary/30 rounded-lg" : ""}
            `}
            role="listitem"
            {...getDragProps(stage.id)}
          >
            <ScheduleStageItem
              stage={stage}
              dependencies={stageDependencies}
              dependentStages={dependentStages}
              onEdit={() => onEditStage(stage)}
              onDelete={() => onDeleteStage(stage.id)}
            />
          </div>
        );
      })}

      {sortedStages.length === 0 && (
        <div className="text-center py-6 text-gray-500 rounded-lg border border-dashed p-8">
          Brak zdefiniowanych etapów. Dodaj pierwszy etap projektu.
        </div>
      )}
    </div>
  );
};

export default ScheduleStagesList;
