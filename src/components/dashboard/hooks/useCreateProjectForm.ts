import { useState, useCallback } from "react";
import type { CreateProjectRequestDto, ErrorResponseDto } from "../../../types";
import { useNavigate } from "@/lib/router";

// Form model types
interface CreateProjectFormModel {
  name: string;
  description: string;
  nameError: string | null;
  descriptionError: string | null;
  isSubmitting: boolean;
  serverError: string | null;
  isDirty: boolean;
}

interface CreateProjectFormActions {
  setName: (value: string) => void;
  setDescription: (value: string) => void;
  validateName: () => boolean;
  validateDescription: () => boolean;
  submit: () => Promise<void>;
  cancel: () => void;
  reset: () => void;
}

interface UseCreateProjectFormResult {
  formState: CreateProjectFormModel;
  actions: CreateProjectFormActions;
  isValid: boolean;
}

// Constants
const MAX_NAME_LENGTH = 200;
const MAX_DESCRIPTION_LENGTH = 1000;

/**
 * Custom hook for managing the create project form state and actions
 */
export function useCreateProjectForm(): UseCreateProjectFormResult {
  // Navigation helper
  const navigate = useNavigate();

  // Initialize form state
  const [formState, setFormState] = useState<CreateProjectFormModel>({
    name: "",
    description: "",
    nameError: null,
    descriptionError: null,
    isSubmitting: false,
    serverError: null,
    isDirty: false,
  });

  // Name validation
  const validateName = useCallback(() => {
    let error: string | null = null;

    if (!formState.name.trim()) {
      error = "Project name is required";
    } else if (formState.name.length > MAX_NAME_LENGTH) {
      error = `Project name cannot exceed ${MAX_NAME_LENGTH} characters`;
    }

    setFormState((prev) => ({ ...prev, nameError: error }));
    return !error;
  }, [formState.name]);

  // Description validation
  const validateDescription = useCallback(() => {
    let error: string | null = null;

    if (formState.description && formState.description.length > MAX_DESCRIPTION_LENGTH) {
      error = `Project description cannot exceed ${MAX_DESCRIPTION_LENGTH} characters`;
    }

    setFormState((prev) => ({ ...prev, descriptionError: error }));
    return !error;
  }, [formState.description]);

  // Form validation
  const validateForm = useCallback(() => {
    const nameValid = validateName();
    const descriptionValid = validateDescription();
    return nameValid && descriptionValid;
  }, [validateName, validateDescription]);

  // Form submission handler
  const submit = useCallback(async () => {
    if (!validateForm()) return;

    setFormState((prev) => ({ ...prev, isSubmitting: true, serverError: null }));

    try {
      // API call to create project
      const response = await fetch("/api/projects", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formState.name.trim(),
          description: formState.description.trim() || null,
        } as CreateProjectRequestDto),
      });

      // Handle different error responses
      if (!response.ok) {
        const errorData: ErrorResponseDto = await response.json().catch(() => ({
          error: {
            code: "unknown_error",
            message: "An unknown error occurred while processing the response",
          },
        }));

        if (response.status === 401) {
          // User not authenticated - redirect to login
          navigate("/login?redirect=/projects/new");
          return;
        }

        if (response.status === 403) {
          // Project limit exceeded
          setFormState((prev) => ({
            ...prev,
            serverError: "Project limit reached. Delete unused projects to add a new one.",
            isSubmitting: false,
          }));
          return;
        }

        if (response.status === 400) {
          // Validation errors
          if (errorData.error.details) {
            const details = errorData.error.details as Record<string, string>;

            // Map server validation errors to form fields
            setFormState((prev) => ({
              ...prev,
              nameError: details.name || prev.nameError,
              descriptionError: details.description || prev.descriptionError,
              serverError: errorData.error.message || "Please correct the form errors",
              isSubmitting: false,
            }));
            return;
          }
        }

        // Generic error message for other cases
        setFormState((prev) => ({
          ...prev,
          serverError: errorData.error.message || "An error occurred while creating the project",
          isSubmitting: false,
        }));
        return;
      }

      // Success - parse response and handle redirect
      try {
        // Optional: Show success notification
        document.dispatchEvent(
          new CustomEvent("toast", {
            detail: {
              message: "Project created successfully",
              type: "success",
            },
          })
        );

        // Redirect to dashboard
        navigate("/dashboard");
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
      } catch (parseError) {
        setFormState((prev) => ({
          ...prev,
          serverError: "Failed to process server response",
          isSubmitting: false,
        }));
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      // Network or unexpected error
      setFormState((prev) => ({
        ...prev,
        serverError: "Could not connect to the server. Please check your internet connection.",
        isSubmitting: false,
      }));
    }
  }, [formState.name, formState.description, validateForm, navigate]);

  // Cancel form handler with confirmation for dirty form
  const cancel = useCallback(() => {
    // Confirm if form has changes
    if (formState.isDirty && (formState.name.trim() !== "" || formState.description.trim() !== "")) {
      if (window.confirm("Are you sure you want to cancel? Your changes will be lost.")) {
        navigate("/dashboard");
      }
    } else {
      navigate("/dashboard");
    }
  }, [formState.isDirty, formState.name, formState.description, navigate]);

  // Reset form handler
  const reset = useCallback(() => {
    setFormState({
      name: "",
      description: "",
      nameError: null,
      descriptionError: null,
      isSubmitting: false,
      serverError: null,
      isDirty: false,
    });
  }, []);

  // Field setters with validation
  const setName = useCallback((value: string) => {
    setFormState((prev) => ({
      ...prev,
      name: value,
      isDirty: true,
      // Clear error when user types if value is now valid
      nameError:
        prev.nameError && value.trim() ? (value.length <= MAX_NAME_LENGTH ? null : prev.nameError) : prev.nameError,
    }));
  }, []);

  const setDescription = useCallback((value: string) => {
    setFormState((prev) => ({
      ...prev,
      description: value,
      isDirty: true,
      // Clear error when user types if value is now valid
      descriptionError: prev.descriptionError
        ? value.length <= MAX_DESCRIPTION_LENGTH
          ? null
          : prev.descriptionError
        : prev.descriptionError,
    }));
  }, []);

  // Return form state, actions and validity status
  return {
    formState,
    actions: {
      setName,
      setDescription,
      validateName,
      validateDescription,
      submit,
      cancel,
      reset,
    },
    isValid: !formState.nameError && !formState.descriptionError && formState.name.trim() !== "",
  };
}

export type { CreateProjectFormModel, CreateProjectFormActions };
