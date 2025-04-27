import { useState, useEffect, useCallback } from 'react';
import type { ProjectDto } from '../../../../types';

/**
 * Hook for fetching and managing project details
 * @param projectId The UUID of the project to fetch
 * @returns Object containing project data, loading state, error state, and refetch function
 */
export function useProjectDetails(projectId: string) {
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProject = useCallback(async () => {
    if (!projectId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/projects/${projectId}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'An error occurred while fetching the project');
      }
      
      const data = await response.json();
      setProject(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Fetch data on component mount
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  return {
    project,
    isLoading,
    error,
    fetchProject
  };
}