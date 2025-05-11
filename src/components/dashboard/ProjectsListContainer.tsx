import { useEffect, useRef } from "react";
import { useProjectsList } from "./hooks/useProjectsList";
import { useDeleteProject } from "./hooks/useDeleteProject";
import { ProjectsFilters } from "./ProjectsFilters";
import { ProjectsList } from "./ProjectsList";
import { ProjectsLoadingSkeleton } from "./ProjectsLoadingSkeleton";
import { ProjectsPagination } from "./ProjectsPagination";
import { DeleteProjectModal } from "./DeleteProjectModal";
import type { ProjectViewModel } from "./types";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NotificationProvider } from "@/components/ui/notification-provider";

export function ProjectsListContainer() {
  return (
    <NotificationProvider>
      <ProjectsListContainerContent />
    </NotificationProvider>
  );
}

function ProjectsListContainerContent() {
  // Reference to the container for focus management
  const containerRef = useRef<HTMLDivElement>(null);

  // Use custom hooks for state management
  const { projects, isLoading, error, filters, pagination, updateFilters, resetFilters, goToPage, deleteProject } =
    useProjectsList();

  // Hook for delete project modal management
  const {
    isOpen,
    projectToDelete,
    isDeleting,
    error: deleteError,
    openModal,
    confirmDelete,
    cancelDelete,
  } = useDeleteProject(deleteProject);
  // Handle delete button click on project card
  const handleDeleteClick = (project: ProjectViewModel) => {
    openModal(project);
  };

  // Memoize the projects count for performance
  // const projectsCount = useMemo(() => pagination.total, [pagination.total]);

  // Focus the container when the delete modal closes
  useEffect(() => {
    if (!isOpen && containerRef.current) {
      // Small delay to ensure the modal transition is complete
      setTimeout(() => {
        containerRef.current?.focus();
      }, 50);
    }
  }, [isOpen]);

  // Show error state if there's an error loading projects
  if (error && !isLoading) {
    return (
      <div className="w-full space-y-4" ref={containerRef} tabIndex={-1}>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error.message || "An error occurred while loading projects."}</AlertDescription>
        </Alert>
        <Button onClick={() => updateFilters({})} variant="outline">
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full" aria-busy={isLoading} ref={containerRef} tabIndex={-1}>
      {/* Filters section */}
      <ProjectsFilters filters={filters} onUpdateFilters={updateFilters} onResetFilters={resetFilters} />

      {/* Loading skeleton or projects list */}
      {isLoading ? (
        <ProjectsLoadingSkeleton count={3} />
      ) : (
        <ProjectsList projects={projects} onDelete={handleDeleteClick} />
      )}

      {/* Pagination - only show if we have projects and not loading */}
      {!isLoading && projects.length > 0 && <ProjectsPagination pagination={pagination} onPageChange={goToPage} />}

      {/* Delete confirmation modal */}
      <DeleteProjectModal
        isOpen={isOpen}
        project={projectToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </div>
  );
}
