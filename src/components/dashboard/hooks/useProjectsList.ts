import { useState, useEffect, useCallback } from "react";
import type { PaginationDto, ProjectSummaryDto } from "../../../types";
import type { ProjectViewModel, ProjectFiltersState, ProjectApiQueryParams } from "../types";
import { ProjectStatusType, ProjectSortOption } from "../types";
import { ProjectClientService } from "@/lib/services/project.service";
import { useNotifications } from "@/components/ui/notification-provider";

interface UseProjectsListResult {
  projects: ProjectViewModel[];
  isLoading: boolean;
  error: Error | null;
  filters: ProjectFiltersState;
  pagination: PaginationDto;
  fetchProjects: () => Promise<void>;
  updateFilters: (newFilters: Partial<ProjectFiltersState>) => void;
  resetFilters: () => void;
  goToPage: (page: number) => void;
  deleteProject: (id: string) => Promise<void>;
}

const defaultFilters: ProjectFiltersState = {
  status: ProjectStatusType.ALL,
  sort: ProjectSortOption.NEWEST,
  page: 1,
  limit: 10,
};

export function useProjectsList(): UseProjectsListResult {
  // State for projects
  const [projects, setProjects] = useState<ProjectViewModel[]>([]);

  // Loading state
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Error state
  const [error, setError] = useState<Error | null>(null);

  // Filters and pagination state
  const [filters, setFilters] = useState<ProjectFiltersState>(defaultFilters);

  // Pagination info
  const [pagination, setPagination] = useState<PaginationDto>({
    total: 0,
    page: 1,
    limit: 10,
    pages: 0,
  });

  // Get notifications context
  const { showNotification } = useNotifications();

  // Track if component is mounted (for avoiding state updates after unmount)
  const [isMounted, setIsMounted] = useState(true);

  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  // Function to convert ProjectSummaryDto to ProjectViewModel
  const mapProjectToViewModel = useCallback((project: ProjectSummaryDto): ProjectViewModel => {
    // In a real implementation, status might come from the API
    // Here we default to ACTIVE for all projects
    const status = ProjectStatusType.ACTIVE;

    // Format dates
    const createdDate = new Date(project.createdAt);
    const updatedDate = new Date(project.updatedAt);

    const formatter = new Intl.DateTimeFormat("pl", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });

    return {
      ...project,
      status,
      formattedCreatedAt: formatter.format(createdDate),
      formattedUpdatedAt: formatter.format(updatedDate),
    };
  }, []);

  // Function to fetch projects from API
  const fetchProjects = useCallback(async () => {
    if (!isMounted) return;

    setIsLoading(true);
    setError(null);

    try {
      const queryParams: ProjectApiQueryParams = {};

      if (filters.status !== ProjectStatusType.ALL) {
        queryParams.status = filters.status;
      }

      if (filters.page > 1) {
        queryParams.page = filters.page;
      }

      queryParams.limit = filters.limit;
      queryParams.sort = filters.sort;

      // Use the ProjectClientService to fetch projects
      const data = await ProjectClientService.listProjects(queryParams as Record<string, string | number>);
      // Update state with fetched data only if still mounted
      if (isMounted) {
        setProjects(data.data.map(mapProjectToViewModel));
        setPagination(data.pagination);
      }
    } catch (err) {
      if (isMounted) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred while fetching projects.";
        setError(err instanceof Error ? err : new Error(errorMessage));
        showNotification(errorMessage, "error");
      }
    } finally {
      if (isMounted) {
        setIsLoading(false);
      }
    }
  }, [filters, mapProjectToViewModel, isMounted, showNotification]);

  // Function to update filters with optimistic UI update for better UX
  const updateFilters = useCallback((newFilters: Partial<ProjectFiltersState>) => {
    setFilters((prev) => {
      // If changing any filter other than page, reset page to 1
      if (Object.keys(newFilters).some((key) => key !== "page")) {
        return { ...prev, ...newFilters, page: 1 };
      }
      return { ...prev, ...newFilters };
    });
  }, []);

  // Function to reset filters to defaults
  const resetFilters = useCallback(() => {
    setFilters(defaultFilters);
    showNotification("Filters have been reset", "info");
  }, [showNotification]);

  // Function to change page
  const goToPage = useCallback(
    (page: number) => {
      // Validate page number
      const validPage = Math.max(1, Math.min(page, pagination.pages));
      updateFilters({ page: validPage });
    },
    [pagination.pages, updateFilters]
  );

  // Function to delete a project with optimistic UI update
  const deleteProject = useCallback(
    async (id: string) => {
      try {
        // Optimistically remove the project from the list
        const projectToDelete = projects.find((p) => p.id === id);
        const projectIndex = projects.findIndex((p) => p.id === id);

        if (projectIndex !== -1) {
          // Create a copy of projects without the one being deleted
          const updatedProjects = [...projects];
          updatedProjects.splice(projectIndex, 1);
          setProjects(updatedProjects);
        }

        // Use the ProjectClientService to delete the project
        await ProjectClientService.deleteProject(id);

        // Show success notification
        showNotification(`Project "${projectToDelete?.name || ""}" has been deleted`, "success");

        // Success - fetch fresh data to update pagination and total counts
        await fetchProjects();
      } catch (err) {
        // Revert optimistic update and throw error to be handled by caller
        await fetchProjects();

        const errorMessage = err instanceof Error ? err.message : "Unknown error occurred while deleting the project.";

        showNotification(errorMessage, "error");
        throw err instanceof Error ? err : new Error(errorMessage);
      }
    },
    [projects, fetchProjects, showNotification]
  );

  // Effect to fetch projects when filters change
  useEffect(() => {
    fetchProjects();
  }, [filters, fetchProjects]);

  // Effect to sync filters with URL (would be implemented here in a real app)
  useEffect(() => {
    // Read initial filters from URL on first load
    const urlParams = new URLSearchParams(window.location.search);
    const initialFilters: Partial<ProjectFiltersState> = {};

    const status = urlParams.get("status");
    if (status && Object.values(ProjectStatusType).includes(status as ProjectStatusType)) {
      initialFilters.status = status as ProjectStatusType;
    }

    const sort = urlParams.get("sort");
    if (sort && Object.values(ProjectSortOption).includes(sort as ProjectSortOption)) {
      initialFilters.sort = sort as ProjectSortOption;
    }

    const page = urlParams.get("page");
    if (page && !isNaN(Number(page))) {
      initialFilters.page = Math.max(1, Number(page));
    }

    // Only update if we have any valid params
    if (Object.keys(initialFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...initialFilters }));
    }
  }, []);

  // Effect to update URL when filters change
  useEffect(() => {
    const urlParams = new URLSearchParams();

    if (filters.status !== ProjectStatusType.ALL) {
      urlParams.set("status", filters.status);
    }

    if (filters.sort !== ProjectSortOption.NEWEST) {
      urlParams.set("sort", filters.sort);
    }

    if (filters.page > 1) {
      urlParams.set("page", filters.page.toString());
    }

    const newUrl = urlParams.toString()
      ? `${window.location.pathname}?${urlParams.toString()}`
      : window.location.pathname;

    // Update URL without reload using history API
    window.history.replaceState({}, "", newUrl);
  }, [filters]);

  return {
    projects,
    isLoading,
    error,
    filters,
    pagination,
    fetchProjects,
    updateFilters,
    resetFilters,
    goToPage,
    deleteProject,
  };
}
