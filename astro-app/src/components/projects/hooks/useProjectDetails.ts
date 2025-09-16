import { useState, useCallback, useEffect } from "react";
import type { ProjectDto } from "../../../types";
import {
  createApiError,
  parseApiErrorResponse,
  handleNetworkError,
  handleDataValidationError,
  isSessionExpiredError,
  getUserFriendlyErrorMessage,
  type ApiError,
} from "../../../lib/services/error.service";

/**
 * Hook to fetch and manage project details data with enhanced error handling
 * @param projectId - The ID of the project to fetch
 */
export function useProjectDetails(projectId: string) {
  const [project, setProject] = useState<ProjectDto | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<ApiError | null>(null);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const fetchProject = useCallback(async () => {
    if (!projectId) {
      setError(createApiError("Project ID is required", 400, "missing_parameter"));
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Fetch project details from API
      const response = await fetch(`/api/projects/${projectId}`);

      if (!response.ok) {
        // Handle HTTP errors
        const apiError = await parseApiErrorResponse(response);

        // Handle session expiration
        if (isSessionExpiredError(apiError)) {
          const returnPath = encodeURIComponent(window.location.pathname);
          window.location.href = `/login?redirectTo=${returnPath}`;
        }

        throw apiError;
      }

      const data = await response.json();

      // Additional validation for expected project structure
      if (!data || typeof data !== "object") {
        throw handleDataValidationError("project", new Error("Invalid project data format"));
      }

      setProject(data);
    } catch (err) {
      // Handle different types of errors
      const apiError = err instanceof Error && "isApiError" in err ? (err as ApiError) : handleNetworkError(err);

      setError(apiError);
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Validate project data structure
  const validateProjectData = useCallback(() => {
    if (!project) return;

    setIsValidating(true);

    try {
      // Validate assumptions structure
      if (project.assumptions && typeof project.assumptions !== "object") {
        throw handleDataValidationError("assumptions", new Error("Invalid assumptions format"));
      }

      // Validate functional blocks structure
      if (project.functionalBlocks) {
        const blocks = project.functionalBlocks as unknown;
        if (
          typeof blocks !== "object" ||
          blocks === null ||
          !("blocks" in blocks) ||
          !Array.isArray((blocks as Record<string, unknown>).blocks)
        ) {
          throw handleDataValidationError("functionalBlocks", new Error("Invalid functional blocks format"));
        }
      }

      // Validate schedule structure
      if (project.schedule) {
        const schedule = project.schedule as unknown;
        if (
          typeof schedule !== "object" ||
          schedule === null ||
          !("stages" in schedule) ||
          !Array.isArray((schedule as Record<string, unknown>).stages)
        ) {
          throw handleDataValidationError("schedule", new Error("Invalid schedule format"));
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      // We don't set the error state here as it's not a fatal error
      // Just log for debugging purposes
    } finally {
      setIsValidating(false);
    }
  }, [project]);

  // Fetch data on component mount and when projectId changes
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Validate data after fetch
  useEffect(() => {
    if (project && !isLoading) {
      validateProjectData();
    }
  }, [project, isLoading, validateProjectData]);

  // Get user-friendly error message
  const errorMessage = error ? getUserFriendlyErrorMessage(error) : null;

  return {
    project,
    isLoading,
    isValidating,
    error,
    errorMessage,
    fetchProject,
  };
}
