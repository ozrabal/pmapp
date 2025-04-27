import { useState, useCallback } from 'react';
import type { ExportFormat } from '../types';

/**
 * Hook for handling project export functionality
 * @param projectId The UUID of the project to export
 * @returns Object containing export methods and state
 */
export function useExportProject(projectId: string) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<Error | null>(null);
  
  const exportProject = useCallback(async (format: ExportFormat) => {
    setIsExporting(true);
    setExportError(null);
    
    try {
      // API call for exporting project data
      const response = await fetch(`/api/projects/${projectId}/export?format=${format}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error during export');
      }
      
      // Download the exported file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `project-${projectId}.${format}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setExportError(err instanceof Error ? err : new Error('Unknown export error'));
    } finally {
      setIsExporting(false);
    }
  }, [projectId]);
  
  return {
    exportProject,
    isExporting,
    exportError
  };
}