import { useRef, useState } from "react";
import { useProjectsList } from "./hooks/useProjectsList";
import { useDeleteProject } from "./hooks/useDeleteProject";
import { ProjectsFilters } from "./ProjectsFilters";
import { ProjectsList } from "./ProjectsList";
import { ProjectsLoadingSkeleton } from "./ProjectsLoadingSkeleton";
import { ProjectsPagination } from "./ProjectsPagination";
import { DeleteProjectModal } from "./DeleteProjectModal";
import { ProjectSortOption, ProjectStatusType, type ProjectViewModel } from "./types";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { NotificationProvider } from "@/components/ui/notification-provider";
import { useProjects } from "../hooks/useProjects";
import { useQueryParams } from "../hooks/useQueryParams";
import { useProjectsFilters } from "./hooks/useProjectsFilters";

export function ProjectsListContainer() {
  return (
    <NotificationProvider>
      <ProjectsListContainerContent />
    </NotificationProvider>
  );
}

const limit = 5;

function ProjectsListContainerContent() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { setSearchParams, searchParams } = useQueryParams();

  const { deleteProject } = useProjectsList();

  const { filters, updateFilters, resetFilters } = useProjectsFilters({
    status: ProjectStatusType.ACTIVE,
    sort: ProjectSortOption.NAME_ASC,
    page: "1",
  });

  const [page, setPage] = useState(parseInt(searchParams.get("page") || "1", 10) || 1);

  const setCurrentPage = (page: number) => {
    setPage(page);
    setSearchParams("page", page.toString());
  };

  const { data, error, isLoading } = useProjects({ filters, page, limit });

  const { data: projects = [], pagination } = data || {};

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

  // Focus the container after modal closes using callbacks
  const focusContainer = () => {
    if (containerRef.current) {
      setTimeout(() => {
        containerRef.current?.focus();
      }, 50);
    }
  };

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
  console.log("FILTERS", filters);
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

      {!isLoading && projects.length > 0 && (
        <ProjectsPagination pagination={pagination} onPageChange={setCurrentPage} />
      )}

      {/* Delete confirmation modal */}
      <DeleteProjectModal
        isOpen={isOpen}
        project={projectToDelete}
        isDeleting={isDeleting}
        error={deleteError}
        onConfirm={() => {
          confirmDelete();
          focusContainer();
        }}
        onCancel={() => {
          cancelDelete();
          focusContainer();
        }}
      />
    </div>
  );
}
