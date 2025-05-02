import { useState } from "react";
import type { ExportFormat, ProjectDto } from "../../../types";

export interface ProjectExportData {
  project: ProjectDto;
  metadata: {
    version: string;
    exportDate: string;
    format: ExportFormat;
  };
}

export interface UseExportProjectReturn {
  exportProject: (project: ProjectDto) => Promise<void>;
  selectedFormat: ExportFormat;
  setSelectedFormat: (format: ExportFormat) => void;
  isExporting: boolean;
  error: Error | null;
  availableFormats: ExportFormat[];
}

/**
 * Custom hook for managing project export functionality
 * @param projectId ID of the project to export
 * @returns Object with export functions and state
 */
export const useExportProject = (): UseExportProjectReturn => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>("json");
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);
  const availableFormats: ExportFormat[] = ["json"]; // In the future, more formats can be added

  /**
   * Exports a project to a file in the selected format
   * @param project ProjectDto to export
   */
  const exportProject = async (project: ProjectDto): Promise<void> => {
    // Handle errors at the beginning (guard clause pattern)
    if (!project) {
      setError(new Error("Brak danych projektu do eksportu"));
      return;
    }

    try {
      setIsExporting(true);
      setError(null);

      // Prepare export data
      const exportData: ProjectExportData = {
        project,
        metadata: {
          version: "1.0", // Export format version
          exportDate: new Date().toISOString(),
          format: selectedFormat,
        },
      };

      // Convert data to selected format
      const fileContent = JSON.stringify(exportData, null, 2);
      const blob = new Blob([fileContent], { type: "application/json" });
      const url = URL.createObjectURL(blob);

      // Create and simulate click on download link
      const link = document.createElement("a");
      link.href = url;
      link.download = `project-${project.name.toLowerCase().replace(/\s+/g, "-")}-${project.id.slice(0, 8)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Release URL after download
      setTimeout(() => URL.revokeObjectURL(url), 100);

      // Happy path completes last
      setIsExporting(false);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Nieznany błąd podczas eksportu projektu"));
      setIsExporting(false);
    }
  };

  return {
    exportProject,
    selectedFormat,
    setSelectedFormat,
    isExporting,
    error,
    availableFormats,
  };
};
