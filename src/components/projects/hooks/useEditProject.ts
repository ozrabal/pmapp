import { useState, useEffect, useCallback, useMemo } from "react";
import type { ProjectDto, UpdateProjectRequestDto, ErrorResponseDto } from "@/types";

interface EditProjectErrors {
  name?: string;
  description?: string;
  general?: string;
}

/**
 * Custom hook for managing project description editing functionality
 * Handles fetching project data, form state, validation, and API interactions
 * Specialized for the project descriptions tab
 */
export const useEditProject = (projectId: string) => {
  // State management
  const [project, setProject] = useState<Partial<ProjectDto>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<EditProjectErrors>({});

  // Memoize API URL to prevent unnecessary re-renders
  const apiUrl = useMemo(() => `/api/projects/${projectId}`, [projectId]);

  // Handle API errors with appropriate user-friendly messages
  const handleApiError = useCallback(async (response: Response) => {
    // Early return for success cases
    if (response.ok) return;

    if (response.status === 404) {
      setErrors({
        general: "Projekt o podanym identyfikatorze nie istnieje.",
      });
      return;
    }

    if (response.status === 403) {
      setErrors({
        general: "Nie masz uprawnień do edycji tego projektu.",
      });
      return;
    }

    if (response.status === 401) {
      setErrors({
        general: "Sesja wygasła. Zaloguj się ponownie.",
      });
      return;
    }

    try {
      const errorData: ErrorResponseDto = await response.json();
      setErrors({
        general: errorData.error.message || "Wystąpił nieoczekiwany błąd.",
      });
    } catch {
      setErrors({
        general: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie.",
      });
    }
  }, []);

  // Fetch project data from API
  const fetchProject = useCallback(async () => {
    setIsLoading(true);

    try {
      const response = await fetch(apiUrl);

      if (!response.ok) {
        await handleApiError(response);
        return;
      }

      const data: ProjectDto = await response.json();
      setProject(data);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setErrors({
        general: "Wystąpił błąd podczas pobierania danych projektu. Spróbuj ponownie.",
      });
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, handleApiError]);

  // Validation functions
  const validateName = useCallback(() => {
    if (!project.name || project.name.trim() === "") {
      setErrors((prev) => ({ ...prev, name: "Nazwa projektu jest wymagana." }));
      return false;
    }

    if (project.name.length > 200) {
      setErrors((prev) => ({ ...prev, name: "Nazwa projektu nie może przekraczać 200 znaków." }));
      return false;
    }

    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { name, ...rest } = prev;
      return rest;
    });
    return true;
  }, [project.name]);

  const validateDescription = useCallback(() => {
    if (project.description && project.description.length > 2000) {
      setErrors((prev) => ({
        ...prev,
        description: "Opis projektu nie może przekraczać 2000 znaków.",
      }));
      return false;
    }

    setErrors((prev) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { description, ...rest } = prev;
      return rest;
    });
    return true;
  }, [project.description]);

  // Form field change handlers
  const handleNameChange = useCallback((name: string) => {
    setProject((prev) => ({ ...prev, name }));

    // Real-time validation
    if (!name || name.trim() === "") {
      setErrors((prev) => ({ ...prev, name: "Nazwa projektu jest wymagana." }));
    } else if (name.length > 200) {
      setErrors((prev) => ({ ...prev, name: "Nazwa projektu nie może przekraczać 200 znaków." }));
    } else {
      setErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { name, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  const handleDescriptionChange = useCallback((description: string) => {
    setProject((prev) => ({ ...prev, description: description || null }));

    // Real-time validation
    if (description && description.length > 2000) {
      setErrors((prev) => ({
        ...prev,
        description: "Opis projektu nie może przekraczać 2000 znaków.",
      }));
    } else {
      setErrors((prev) => {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { description, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  // Validate all form fields before submission
  const validateForm = useCallback(() => {
    const newErrors: EditProjectErrors = {};

    // Validate name
    if (!project.name || project.name.trim() === "") {
      newErrors.name = "Nazwa projektu jest wymagana.";
    } else if (project.name.length > 200) {
      newErrors.name = "Nazwa projektu nie może przekraczać 200 znaków.";
    }

    // Validate description
    if (project.description && project.description.length > 2000) {
      newErrors.description = "Opis projektu nie może przekraczać 2000 znaków.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [project.name, project.description]);

  // Form submission handler
  const handleSubmit = useCallback(async () => {
    // Validate form before submission
    if (!validateForm()) return;

    setIsSaving(true);

    try {
      const updateData: UpdateProjectRequestDto = {
        name: project.name,
        description: project.description,
      };

      const response = await fetch(apiUrl, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        await handleApiError(response);
        return;
      }

      // After successful update, redirect back to the project details page
      window.location.href = `/projects/${projectId}`;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      setErrors({
        general: "Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie.",
      });
    } finally {
      setIsSaving(false);
    }
  }, [project.name, project.description, validateForm, apiUrl, handleApiError, projectId]);

  // Cancel edit handler
  const handleCancel = useCallback(() => {
    // Navigate back to project details page
    window.location.href = `/projects/${projectId}`;
  }, [projectId]);

  // Fetch project data on component mount
  useEffect(() => {
    fetchProject();
  }, [fetchProject]);

  // Determine whether there are any validation errors
  const hasErrors = useMemo(() => Object.keys(errors).length > 0, [errors]);

  return {
    project,
    isLoading,
    isSaving,
    errors,
    hasErrors,
    handleNameChange,
    handleDescriptionChange,
    validateName,
    validateDescription,
    handleSubmit,
    handleCancel,
  };
};

export default useEditProject;
