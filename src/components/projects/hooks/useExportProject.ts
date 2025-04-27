import { useState, useCallback } from 'react';
import type { ExportFormat } from '../../../types';

/**
 * Hook to handle project export functionality
 * @param projectId - The ID of the project to export
 */
export function useExportProject(projectId: string) {
  const [isExporting, setIsExporting] = useState<boolean>(false);
  const [exportError, setExportError] = useState<Error | null>(null);
  
  const exportProject = useCallback(async (format: ExportFormat) => {
    if (!projectId) return;
    
    setIsExporting(true);
    setExportError(null);
    
    try {
      // Call export API endpoint
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
      console.error('Error exporting project:', err);
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