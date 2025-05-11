import React, { useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FormatSelector } from "./FormatSelector";
import { useExportProject } from "./hooks/useExportProject";
import type { ProjectDto } from "../../types";

export interface ExportProjectDialogProps {
  project: ProjectDto;
  isOpen: boolean;
  onClose: () => void;
}

/**
 * Dialog component for exporting a project
 */
export const ExportProjectDialog: React.FC<ExportProjectDialogProps> = ({ project, isOpen, onClose }) => {
  const { exportProject, selectedFormat, setSelectedFormat, isExporting, error, availableFormats } = useExportProject();

  // Reset state when dialog opens or project changes
  useEffect(() => {
    if (isOpen && project) {
      setSelectedFormat("json");
    }
  }, [isOpen, project, setSelectedFormat]);

  const handleExport = async () => {
    if (!project) return;

    try {
      await exportProject(project);
      onClose(); // Close dialog on successful export
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // Error is handled within the useExportProject hook
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Export Project</DialogTitle>
          <DialogDescription>
            Export project data &quot;{project?.name}&quot; to a file in the selected format.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <FormatSelector
            value={selectedFormat}
            onChange={setSelectedFormat}
            availableFormats={availableFormats}
            disabled={isExporting}
          />

          {error && (
            <div className="mt-2 text-sm text-red-500" role="alert">
              <p>An error occurred: {error.message}</p>
            </div>
          )}
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-between">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || !selectedFormat} className="mt-2 sm:mt-0">
            {isExporting ? "Exporting..." : "Export"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
