import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import { type ProjectScheduleViewModel, type ScheduleStageViewModel } from "./types";
import ScheduleStagesList from "./ScheduleStagesList";

interface ScheduleContentProps {
  schedule: ProjectScheduleViewModel;
  onAddStage: () => void;
  onEditStage: (stage: ScheduleStageViewModel) => void;
  onDeleteStage: (stageId: string) => Promise<void>;
  onReorderStages: (sourceId: string, destinationId: string) => Promise<void>;
}

const ScheduleContent: React.FC<ScheduleContentProps> = ({
  schedule,
  onAddStage,
  onEditStage,
  onDeleteStage,
  onReorderStages,
}) => {
  // Function to create lookup map of stage dependencies
  const getDependenciesMap = (): Record<string, ScheduleStageViewModel[]> => {
    const dependencies: Record<string, ScheduleStageViewModel[]> = {};

    schedule.stages.forEach((stage) => {
      stage.dependencies.forEach((dependencyId) => {
        if (!dependencies[dependencyId]) {
          dependencies[dependencyId] = [];
        }
        dependencies[dependencyId].push(stage);
      });
    });

    return dependencies;
  };

  // Get a map of stage dependencies - which stages depend on each stage
  const dependenciesMap = getDependenciesMap();

  return (
    <div className="space-y-6">
      {/* Schedule stages list */}
      <ScheduleStagesList
        stages={schedule.stages}
        dependencies={dependenciesMap}
        onEditStage={onEditStage}
        onDeleteStage={onDeleteStage}
        onReorderStages={onReorderStages}
      />

      {/* Add new stage button */}
      <div className="flex justify-center pt-4">
        <Button variant="outline" onClick={onAddStage} className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Add new stage
        </Button>
      </div>
    </div>
  );
};

export default ScheduleContent;
