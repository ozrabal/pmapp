import React, { useId } from "react";
import { useEditProject } from "./hooks/useEditProject";
import ProjectNameInput from "./ProjectNameInput";
import ProjectDescriptionTextarea from "./ProjectDescriptionTextarea";
import { Button } from "../ui/button";
import { Card } from "../ui/card";
import { Alert } from "../ui/alert";

interface EditProjectFormProps {
  projectId: string;
}

/**
 * Form component for editing project details
 *
 * Provides interface for updating project name and description
 * with real-time validation and error handling
 */
const EditProjectForm: React.FC<EditProjectFormProps> = ({ projectId }) => {
  // Generate unique IDs for accessibility
  const formId = useId();
  const nameId = `${formId}-project-name`;
  const descriptionId = `${formId}-project-description`;
  const errorId = `${formId}-error`;

  const {
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
  } = useEditProject(projectId);

  // Skeleton loader state while fetching project data
  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-4 animate-pulse" aria-busy="true" aria-label="Ładowanie danych projektu">
          <div className="flex justify-between items-center">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/3"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
          </div>
          <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="flex justify-between items-center mt-6">
            <div className="h-6 bg-slate-200 dark:bg-slate-700 rounded w-1/4"></div>
            <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-16"></div>
          </div>
          <div className="h-28 bg-slate-200 dark:bg-slate-700 rounded"></div>
          <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-1/2 mt-1"></div>
          <div className="flex justify-end space-x-3 mt-6">
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-24"></div>
            <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded w-32"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <form
        id={formId}
        className="space-y-6"
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit();
        }}
        aria-busy={isSaving}
        aria-describedby={errors.general ? errorId : undefined}
        noValidate
      >
        {errors.general && (
          <Alert variant="destructive" id={errorId} role="alert" aria-live="assertive">
            <div className="flex items-start">
              <svg
                className="h-4 w-4 mt-1 mr-2 flex-shrink-0"
                fill="none"
                strokeWidth="2"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
              <span>{errors.general}</span>
            </div>
          </Alert>
        )}

        <div className="space-y-6">
          <ProjectNameInput
            value={project.name || ""}
            onChange={handleNameChange}
            onBlur={validateName}
            error={errors.name || null}
            disabled={isSaving}
            id={nameId}
          />

          <ProjectDescriptionTextarea
            value={project.description || ""}
            onChange={handleDescriptionChange}
            onBlur={validateDescription}
            error={errors.description || null}
            disabled={isSaving}
            id={descriptionId}
            maxLength={2000}
          />
        </div>

        <div className="flex justify-end space-x-3 pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleCancel}
            disabled={isSaving}
            aria-label="Anuluj edycję i wróć do poprzedniej strony"
          >
            Anuluj
          </Button>
          <Button
            type="submit"
            disabled={isSaving || hasErrors}
            aria-busy={isSaving}
            aria-label={isSaving ? "Zapisywanie zmian w projekcie..." : "Zapisz zmiany w projekcie"}
            className="relative"
          >
            {isSaving && (
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
            )}
            {isSaving ? "Zapisywanie..." : "Zapisz zmiany"}
          </Button>
        </div>
      </form>
    </Card>
  );
};

export default EditProjectForm;
