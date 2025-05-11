import React from "react";
import { Card, CardContent } from "../../ui/card";
import { Alert, AlertDescription } from "../../ui/alert";
import { LoadingSkeleton } from "../LoadingSkeleton";
import type { ProjectSchedulePanelProps } from "../types";

export const ProjectSchedulePanel: React.FC<ProjectSchedulePanelProps> = ({
  schedule,
  isLoading = false,
  className,
}) => {
  if (isLoading) {
    return <LoadingSkeleton type="schedule" className={className} />;
  }

  if (!schedule) {
    return (
      <Alert variant="warning" className={className}>
        <AlertDescription>Unable to display project schedule due to missing data.</AlertDescription>
      </Alert>
    );
  }

  if (!schedule.stages || !Array.isArray(schedule.stages) || schedule.stages.length === 0) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center text-muted-foreground">
          <p>No schedule has been defined for this project yet.</p>
        </CardContent>
      </Card>
    );
  }

  try {
    // Sort stages by order with validation
    const sortedStages = [...schedule.stages]
      .filter((stage) => typeof stage === "object" && stage !== null)
      .sort((a, b) => {
        if (typeof a.order !== "number" || typeof b.order !== "number") {
          // If order is not a number, maintain original array order
          return 0;
        }
        return a.order - b.order;
      });

    if (sortedStages.length === 0) {
      throw new Error("No valid stages found in schedule data");
    }

    return (
      <div className={className}>
        <div className="space-y-6">
          <h3 className="text-lg font-medium">Project Timeline</h3>
          <div className="relative">
            {/* Timeline connector */}
            <div className="absolute top-0 bottom-0 left-7 w-0.5 bg-gray-200 dark:bg-gray-700" aria-hidden="true" />

            {/* Timeline items */}
            <div className="space-y-8">
              {sortedStages.map((stage, index) => (
                <div key={stage.id || index} className="relative pl-14">
                  {/* Stage number indicator */}
                  <div className="absolute left-0 w-14 flex items-center justify-center">
                    <div className="rounded-full h-10 w-10 flex items-center justify-center bg-primary text-primary-foreground font-medium z-10">
                      {index + 1}
                    </div>
                  </div>

                  <Card className="overflow-hidden">
                    <CardContent className="p-4">
                      <h4 className="font-medium text-md mb-1">{stage.name || "Unnamed Stage"}</h4>
                      <p className="text-sm text-muted-foreground mb-3">
                        {stage.description || "No description provided"}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {stage.dependencies && Array.isArray(stage.dependencies) && stage.dependencies.length > 0 && (
                          <div className="text-xs">
                            <span className="font-medium">Dependencies: </span>
                            <span className="text-muted-foreground">{stage.dependencies.join(", ")}</span>
                          </div>
                        )}

                        {stage.relatedBlocks &&
                          Array.isArray(stage.relatedBlocks) &&
                          stage.relatedBlocks.length > 0 && (
                            <div className="text-xs">
                              <span className="font-medium">Related functional blocks: </span>
                              <span className="text-muted-foreground">{stage.relatedBlocks.join(", ")}</span>
                            </div>
                          )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return (
      <Alert variant="warning" className={className}>
        <AlertDescription>Unable to display project schedule due to invalid data format.</AlertDescription>
      </Alert>
    );
  }
};
