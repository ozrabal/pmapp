import React from "react";
import { Skeleton } from "../../ui/skeleton";
import type { ProjectHeaderProps } from "../types";
import { useProjectDetails } from "../hooks";

export function ProjectHeader({ projectId }: ProjectHeaderProps) {
  const { isLoading, project } = useProjectDetails(projectId);
  return (
    <div className="space-y-2">
      <h1 className="text-3xl font-bold tracking-tight">
        {isLoading ? (
          <Skeleton className="h-9 w-64" />
        ) : project ? (
          project.name
        ) : (
          <span className="opacity-0">Loading...</span> // Hidden placeholder for consistent layout
        )}
      </h1>
    </div>
  );
}
