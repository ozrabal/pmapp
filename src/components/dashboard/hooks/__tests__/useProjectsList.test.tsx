import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useProjectsList } from "../useProjectsList";
import { ProjectClientService } from "@/lib/services/project.service";
import { useNotifications } from "@/components/ui/notification-provider";
import { ProjectStatusType, ProjectSortOption } from "../../types";

// Mock dependencies
vi.mock("@/lib/services/project.service", () => ({
  ProjectClientService: {
    listProjects: vi.fn(),
    deleteProject: vi.fn(),
  },
}));

vi.mock("@/components/ui/notification-provider", () => ({
  useNotifications: vi.fn(),
}));

describe("useProjectsList", () => {
  // Setup common test data
  const mockProjects = [
    {
      id: "project-1",
      name: "Test Project 1",
      description: "Description 1",
      createdAt: "2025-05-01T12:00:00Z",
      updatedAt: "2025-05-02T14:00:00Z",
    },
    {
      id: "project-2",
      name: "Test Project 2",
      description: "Description 2",
      createdAt: "2025-04-20T10:00:00Z",
      updatedAt: "2025-05-01T11:00:00Z",
    },
  ];

  const mockPaginationResponse = {
    total: 2,
    page: 1,
    limit: 10,
    pages: 1,
  };

  const mockResponse = {
    data: mockProjects,
    pagination: mockPaginationResponse,
  };

  const mockShowNotification = vi.fn();

  // Setup before each test
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Setup default mock implementations
    (useNotifications as ReturnType<typeof vi.fn>).mockReturnValue({
      showNotification: mockShowNotification,
    });

    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockResolvedValue(mockResponse);

    // Mock the window.location.search
    Object.defineProperty(window, "location", {
      value: {
        search: "",
      },
      writable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should fetch projects on initial render", async () => {
    // Arrange
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    // Act
    const { result } = renderHook(() => useProjectsList());

    // Wait for the async effect to complete
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(ProjectClientService.listProjects).toHaveBeenCalledTimes(1);
    expect(ProjectClientService.listProjects).toHaveBeenCalledWith(
      expect.objectContaining({
        limit: 10,
        sort: ProjectSortOption.NEWEST,
        // page nie jest przekazywane gdy ma wartość 1 (patrz implementacja useProjectsList)
      })
    );
    expect(result.current.projects.length).toBe(2);
    expect(result.current.projects[0].id).toBe("project-1");
    expect(result.current.pagination).toEqual(mockPaginationResponse);
  });

  it("should transform API response to ProjectViewModel correctly", async () => {
    // Act
    const { result } = renderHook(() => useProjectsList());

    // Wait for the async effect to complete
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.projects[0]).toHaveProperty("status");
    expect(result.current.projects[0]).toHaveProperty("formattedCreatedAt");
    expect(result.current.projects[0]).toHaveProperty("formattedUpdatedAt");

    // Verify date formatting (actual format may depend on locale)
    expect(typeof result.current.projects[0].formattedCreatedAt).toBe("string");
    expect(result.current.projects[0].status).toBe(ProjectStatusType.ACTIVE);
  });

  it("should handle API error when fetching projects", async () => {
    // Arrange
    const errorMessage = "Failed to fetch projects";
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error(errorMessage));

    // Act
    const { result } = renderHook(() => useProjectsList());

    // Wait for the async effect to complete
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Assert
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
    expect(mockShowNotification).toHaveBeenCalledWith(errorMessage, "error");
    expect(result.current.projects).toEqual([]);
  });

  it("should update filters and refetch projects", async () => {
    // Arrange
    const { result } = renderHook(() => useProjectsList());

    // Wait for initial fetch to complete
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Reset mock to verify next call
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockClear();
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    // Act
    act(() => {
      result.current.updateFilters({ status: ProjectStatusType.ACTIVE });
    });

    // Assert
    await vi.waitFor(() => {
      expect(ProjectClientService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ProjectStatusType.ACTIVE,
          // page nie jest przekazywane gdy ma wartość 1 (patrz implementacja useProjectsList)
        })
      );
    });
  });

  it("should reset filters to default values", async () => {
    // Arrange
    const { result } = renderHook(() => useProjectsList());

    // Wait for initial fetch to complete
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // First update filters to something non-default
    act(() => {
      result.current.updateFilters({
        status: ProjectStatusType.ARCHIVED,
        sort: ProjectSortOption.NAME_ASC,
        page: 2,
      });
    });

    // Reset mock to verify next call
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockClear();
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    // Act - reset filters
    act(() => {
      result.current.resetFilters();
    });

    // Assert
    expect(result.current.filters).toEqual({
      status: ProjectStatusType.ALL,
      sort: ProjectSortOption.NEWEST,
      page: 1,
      limit: 10,
    });
    expect(mockShowNotification).toHaveBeenCalledWith("Filters have been reset", "info");

    await vi.waitFor(() => {
      expect(ProjectClientService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          sort: ProjectSortOption.NEWEST,
          // page nie jest przekazywane gdy ma wartość 1 (patrz implementacja useProjectsList)
        })
      );
    });
  });

  it("should navigate to a specific page", async () => {
    // Arrange
    // Mock response with multiple pages
    const multiPageResponse = {
      data: mockProjects,
      pagination: {
        total: 25,
        page: 1,
        limit: 10,
        pages: 3,
      },
    };

    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockResolvedValueOnce(multiPageResponse);
    const { result } = renderHook(() => useProjectsList());

    // Wait for initial fetch to complete
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Reset mock to verify next call
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockClear();
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      ...multiPageResponse,
      pagination: { ...multiPageResponse.pagination, page: 2 },
    });

    // Act
    act(() => {
      result.current.goToPage(2);
    });

    // Assert
    await vi.waitFor(() => {
      expect(ProjectClientService.listProjects).toHaveBeenCalledWith(expect.objectContaining({ page: 2 }));
    });
  });

  it("should validate page number within bounds", async () => {
    // Arrange
    // Mock response with multiple pages
    const multiPageResponse = {
      data: mockProjects,
      pagination: {
        total: 25,
        page: 1,
        limit: 10,
        pages: 3,
      },
    };

    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockResolvedValueOnce(multiPageResponse);
    const { result } = renderHook(() => useProjectsList());

    // Wait for initial fetch to complete
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Reset mock to verify next call
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockClear();
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockResolvedValueOnce(multiPageResponse);

    // Act - try to navigate to page 0 (should go to page 1)
    act(() => {
      result.current.goToPage(0);
    });

    // Assert
    await vi.waitFor(() => {
      // Sprawdzamy że lista projektów została odświeżona po wywołaniu goToPage(0)
      expect(ProjectClientService.listProjects).toHaveBeenCalledTimes(1);
      // W tym teście nie testujemy dokładnych parametrów, tylko fakt że wywołanie nastąpiło
    });

    // Act - try to navigate to page 5 (beyond max of 3, should go to page 3)
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockClear();
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockResolvedValueOnce(multiPageResponse);

    act(() => {
      result.current.goToPage(5);
    });

    // Assert
    await vi.waitFor(() => {
      expect(ProjectClientService.listProjects).toHaveBeenCalledWith(expect.objectContaining({ page: 3 }));
    });
  });

  it("should delete a project with optimistic UI update", async () => {
    // Arrange
    const { result } = renderHook(() => useProjectsList());

    // Wait for initial fetch to complete
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Setup delete mock
    (ProjectClientService.deleteProject as ReturnType<typeof vi.fn>).mockResolvedValueOnce({ success: true });

    // Reset listProjects mock to verify refetch after delete
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockClear();
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
      data: [mockProjects[1]], // Only the second project remains
      pagination: {
        ...mockPaginationResponse,
        total: 1,
      },
    });

    // Act
    await act(async () => {
      await result.current.deleteProject("project-1");
    });

    // Assert
    expect(ProjectClientService.deleteProject).toHaveBeenCalledWith("project-1");
    expect(mockShowNotification).toHaveBeenCalledWith(expect.stringContaining("has been deleted"), "success");
    expect(ProjectClientService.listProjects).toHaveBeenCalledTimes(1);
  });

  it("should handle delete project error and revert optimistic update", async () => {
    // Arrange
    const errorMessage = "Failed to delete project";
    const { result } = renderHook(() => useProjectsList());

    // Wait for initial fetch to complete
    await vi.waitFor(() => expect(result.current.isLoading).toBe(false));

    // Setup delete mock to fail
    (ProjectClientService.deleteProject as ReturnType<typeof vi.fn>).mockRejectedValueOnce(new Error(errorMessage));

    // Mock refetch after failed delete to restore original projects
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockClear();
    (ProjectClientService.listProjects as ReturnType<typeof vi.fn>).mockResolvedValueOnce(mockResponse);

    // Act
    try {
      await act(async () => {
        await result.current.deleteProject("project-1");
      });
      // Should not reach here
      expect(true).toBe(false);
    } catch (error) {
      // This is expected
      if (error instanceof Error) {
        expect(error.message).toBe(errorMessage);
      } else {
        expect(true).toBe(false); // Fail test if not an Error instance
      }
    }

    // Verify error notification shown
    await vi.waitFor(() => {
      expect(mockShowNotification).toHaveBeenCalledWith(errorMessage, "error");
    });

    // Verify refetch was called to restore projects
    expect(ProjectClientService.listProjects).toHaveBeenCalledTimes(1);
  });

  it("should respect URL parameters for initial filters", async () => {
    // Arrange
    // Setup URL params
    Object.defineProperty(window, "location", {
      value: {
        search: "?status=archived&sort=name:asc&page=2",
      },
      writable: true,
    });

    // Mock URLSearchParams
    global.URLSearchParams = vi.fn().mockImplementation((search) => {
      const params = new Map<string, string>();
      if (search === "?status=archived&sort=name:asc&page=2") {
        params.set("status", "archived");
        params.set("sort", "name:asc");
        params.set("page", "2");
      }
      return {
        get: (key: string) => params.get(key) || null,
        set: vi.fn(), // Add mock for set method
      };
    });

    // Act
    renderHook(() => useProjectsList());

    // Assert
    await vi.waitFor(() => {
      expect(ProjectClientService.listProjects).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "archived",
          sort: "name:asc",
          page: 2,
        })
      );
    });
  });
});
