import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ExportProjectDialog } from "./ExportProjectDialog";
import type { ProjectDto } from "../../types";

export interface ExportButtonProps {
  projectId: string;
  projectData?: ProjectDto;
}

/**
 * Button component that opens the export dialog
 */
export const ExportButton: React.FC<ExportButtonProps> = ({ projectId, projectData }) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
  const [project, setProject] = useState<ProjectDto | undefined>(projectData);
  const [isLoading, setIsLoading] = useState<boolean>(!projectData);
  const [error, setError] = useState<Error | null>(null);

  // Fetch project data if not provided and dialog is opened
  useEffect(() => {
    if (!projectData && isDialogOpen) {
      setIsLoading(true);
      fetch(`/api/projects/${projectId}`)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
          }
          return response.json();
        })
        .then((data) => {
          setProject(data);
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err : new Error("Nieznany błąd"));
          setIsLoading(false);
        });
    }
  }, [projectId, projectData, isDialogOpen]);

  const handleButtonClick = () => {
    setIsDialogOpen(true);
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleButtonClick}
        className="flex items-center gap-1"
        aria-label="Eksportuj projekt"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="size-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <span>Eksportuj</span>
      </Button>

      {isDialogOpen &&
        (project ? (
          <ExportProjectDialog project={project} isOpen={isDialogOpen} onClose={handleDialogClose} />
        ) : (
          <ExportProjectDialog
            project={{
              id: projectId,
              name: "Projekt",
              description: null,
              assumptions: null,
              functionalBlocks: null,
              schedule: null,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            }}
            isOpen={isDialogOpen && isLoading}
            onClose={handleDialogClose}
          />
        ))}

      {error && isDialogOpen && (
        <div className="text-sm text-red-500 mt-2" role="alert">
          <p>Nie można załadować danych projektu: {error.message}</p>
        </div>
      )}
    </>
  );
};
