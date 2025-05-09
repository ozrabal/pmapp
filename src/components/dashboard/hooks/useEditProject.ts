import { useState, useEffect, useCallback, useMemo } from 'react';
import type { ProjectDto, UpdateProjectRequestDto, ErrorResponseDto } from '@/types';

interface ProjectEditViewModel {
  id: string;
  name: string;
  description: string | null;
  isLoading: boolean;
  isSaving: boolean;
  hasErrors: boolean;
  formErrors: {
    name?: string;
    description?: string;
    general?: string;
  };
}

/**
 * Custom hook for managing project editing functionality
 * Handles fetching project data, form state, validation, and API interactions
 */
export const useEditProject = (projectId: string) => {
  const [project, setProject] = useState<Partial<ProjectDto>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [errors, setErrors] = useState<ProjectEditViewModel['formErrors']>({});

  // Memoize API URL to prevent unnecessary re-renders
  const apiUrl = useMemo(() => `/api/projects/${projectId}`, [projectId]);

  // Handle API errors with appropriate user-friendly messages
  const handleApiError = useCallback(async (response: Response) => {
    // Early return for success cases
    if (response.ok) return;
    
    if (response.status === 404) {
      setErrors({ 
        general: "Projekt o podanym identyfikatorze nie istnieje." 
      });
      return;
    } 
    
    if (response.status === 403) {
      setErrors({ 
        general: "Nie masz uprawnień do edycji tego projektu." 
      });
      return;
    } 
    
    if (response.status === 401) {
      setErrors({ 
        general: "Sesja wygasła. Zaloguj się ponownie." 
      });
      // Could implement redirect to login page here
      return;
    }
    
    try {
      const errorData: ErrorResponseDto = await response.json();
      setErrors({ 
        general: errorData.error.message || "Wystąpił nieoczekiwany błąd." 
      });
    } catch {
      setErrors({ 
        general: "Wystąpił nieoczekiwany błąd. Spróbuj ponownie." 
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
    } catch (error) {
      setErrors({ 
        general: "Wystąpił błąd podczas pobierania danych projektu. Spróbuj ponownie." 
      });
      console.error("Error fetching project:", error);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, handleApiError]);

  // Validate the entire form before submission
  const validateForm = useCallback(() => {
    const newErrors: ProjectEditViewModel['formErrors'] = {};
    
    // Validate name
    if (!project.name || project.name.trim() === '') {
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

  // Individual field validation functions
  const validateName = useCallback(() => {
    if (!project.name || project.name.trim() === '') {
      setErrors(prev => ({ ...prev, name: "Nazwa projektu jest wymagana." }));
      return false;
    } 
    
    if (project.name.length > 200) {
      setErrors(prev => ({ ...prev, name: "Nazwa projektu nie może przekraczać 200 znaków." }));
      return false;
    } 
    
    setErrors(prev => {
      const { name, ...rest } = prev;
      return rest;
    });
    return true;
  }, [project.name]);

  const validateDescription = useCallback(() => {
    if (project.description && project.description.length > 2000) {
      setErrors(prev => ({ 
        ...prev, 
        description: "Opis projektu nie może przekraczać 2000 znaków." 
      }));
      return false;
    } 
    
    setErrors(prev => {
      const { description, ...rest } = prev;
      return rest;
    });
    return true;
  }, [project.description]);

  // Handle form field changes
  const handleNameChange = useCallback((name: string) => {
    setProject(prev => ({ ...prev, name }));
    
    // Real-time validation
    if (!name || name.trim() === '') {
      setErrors(prev => ({ ...prev, name: "Nazwa projektu jest wymagana." }));
    } else if (name.length > 200) {
      setErrors(prev => ({ ...prev, name: "Nazwa projektu nie może przekraczać 200 znaków." }));
    } else {
      setErrors(prev => {
        const { name, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  const handleDescriptionChange = useCallback((description: string) => {
    setProject(prev => ({ ...prev, description: description || null }));
    
    // Real-time validation
    if (description && description.length > 2000) {
      setErrors(prev => ({ 
        ...prev, 
        description: "Opis projektu nie może przekraczać 2000 znaków." 
      }));
    } else {
      setErrors(prev => {
        const { description, ...rest } = prev;
        return rest;
      });
    }
  }, []);

  // Form submission handler
  const handleSubmit = useCallback(async () => {
    // Validate form before submission
    if (!validateForm()) return;
    
    setIsSaving(true);
    
    try {
      const updateData: UpdateProjectRequestDto = {
        name: project.name,
        description: project.description
      };
      
      const response = await fetch(apiUrl, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
      });
      
      if (!response.ok) {
        await handleApiError(response);
        return;
      }
      
      // Redirect to projects list after successful update
      window.location.href = '/dashboard';
    } catch (error) {
      setErrors({ 
        general: "Wystąpił błąd podczas zapisywania zmian. Spróbuj ponownie." 
      });
      console.error("Error updating project:", error);
    } finally {
      setIsSaving(false);
    }
  }, [project.name, project.description, validateForm, apiUrl, handleApiError]);

  // Cancel edit handler
  const handleCancel = useCallback(() => {
    // Navigate back to previous page
    window.history.back();
  }, []);

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
    handleCancel
  };
};