import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach, type Mock } from "vitest";
import { useDeleteProject } from "../useDeleteProject";
import { ProjectClientService } from "@/lib/services/project.service";
import { useNotifications } from "@/components/ui/notification-provider";
import { ProjectStatusType } from "../../types";
import type { ProjectViewModel } from "../../types";

// Mock dependencies
vi.mock("@/lib/services/project.service", () => ({
  ProjectClientService: {
    deleteProject: vi.fn(),
  },
}));

vi.mock("@/components/ui/notification-provider", () => ({
  useNotifications: vi.fn(),
}));

describe("useDeleteProject", () => {
  // Sample test data
  const mockProject: ProjectViewModel = {
    id: "project-1",
    name: "Test Project",
    description: "Test description",
    status: ProjectStatusType.ACTIVE,
    createdAt: "2025-05-01T10:00:00Z",
    updatedAt: "2025-05-01T10:00:00Z",
    formattedCreatedAt: "1 maj 2025",
    formattedUpdatedAt: "1 maj 2025",
  };

  const mockShowNotification = vi.fn();
  const mockOnDelete = vi.fn();

  // Setup before each test
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Setup useNotifications mock
    (useNotifications as Mock).mockReturnValue({
      showNotification: mockShowNotification,
    });

    // Reset timers
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("should initialize with closed modal state", () => {
    // Act
    const { result } = renderHook(() => useDeleteProject(mockOnDelete));

    // Assert
    expect(result.current.isOpen).toBe(false);
    expect(result.current.projectToDelete).toBeNull();
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("should open modal with selected project", () => {
    // Arrange
    const { result } = renderHook(() => useDeleteProject(mockOnDelete));

    // Act
    act(() => {
      result.current.openModal(mockProject);
    });

    // Assert
    expect(result.current.isOpen).toBe(true);
    expect(result.current.projectToDelete).toEqual(mockProject);
    expect(result.current.error).toBeNull();
  });

  it("should close modal and clear project after delay", () => {
    // Arrange
    const { result } = renderHook(() => useDeleteProject(mockOnDelete));

    // Open the modal
    act(() => {
      result.current.openModal(mockProject);
    });

    // Act - Close the modal
    act(() => {
      result.current.closeModal();
    });

    // Assert - Modal closes immediately
    expect(result.current.isOpen).toBe(false);
    // Project is still in state
    expect(result.current.projectToDelete).toEqual(mockProject);

    // Fast-forward time to clear project
    act(() => {
      vi.advanceTimersByTime(300);
    });

    // Assert - Project is cleared after delay
    expect(result.current.projectToDelete).toBeNull();
  });

  it("should not close modal while deletion is in progress", () => {
    // Arrange
    const { result } = renderHook(() => useDeleteProject(mockOnDelete));

    // Open the modal
    act(() => {
      result.current.openModal(mockProject);
    });

    // Set isDeleting to true
    act(() => {
      result.current.confirmDelete();
    });

    // Act - Try to close the modal
    act(() => {
      result.current.closeModal();
    });

    // Assert - Modal should still be open
    expect(result.current.isOpen).toBe(true);
  });

  it("should use the provided delete handler when available", async () => {
    // Arrange
    const mockOnDelete = vi.fn().mockResolvedValue(undefined);
    const { result } = renderHook(() => useDeleteProject(mockOnDelete));

    // Open the modal with a project
    act(() => {
      result.current.openModal(mockProject);
    });

    // Act - Confirm deletion
    await act(async () => {
      await result.current.confirmDelete();
    });

    // Assert
    expect(mockOnDelete).toHaveBeenCalledWith(mockProject.id);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isDeleting).toBe(false);

    // Default service should not be called
    expect(ProjectClientService.deleteProject).not.toHaveBeenCalled();
  });

  it("should use the default service when no handler is provided", async () => {
    // Arrange
    (ProjectClientService.deleteProject as Mock).mockResolvedValue({ success: true });
    const { result } = renderHook(() => useDeleteProject()); // No handler provided

    // Open the modal with a project
    act(() => {
      result.current.openModal(mockProject);
    });

    // Act - Confirm deletion
    await act(async () => {
      await result.current.confirmDelete();
    });

    // Assert
    expect(ProjectClientService.deleteProject).toHaveBeenCalledWith(mockProject.id);
    expect(result.current.isOpen).toBe(false);
    expect(result.current.isDeleting).toBe(false);
  });

  it("should handle delete error correctly", async () => {
    // Arrange
    const errorMessage = "Failed to delete project";
    mockOnDelete.mockRejectedValueOnce(new Error(errorMessage));
    const { result } = renderHook(() => useDeleteProject(mockOnDelete));

    // Open the modal with a project
    act(() => {
      result.current.openModal(mockProject);
    });

    // Act - Confirm deletion which will fail
    await act(async () => {
      await result.current.confirmDelete();
    });

    // Assert
    expect(mockOnDelete).toHaveBeenCalledWith(mockProject.id);
    expect(result.current.isOpen).toBe(true); // Modal stays open on error
    expect(result.current.isDeleting).toBe(false);
    expect(result.current.error).toBeInstanceOf(Error);
    expect(result.current.error?.message).toBe(errorMessage);
    expect(mockShowNotification).toHaveBeenCalledWith(errorMessage, "error");
  });

  it("should do nothing on confirmDelete if no project is selected", async () => {
    // Arrange
    const { result } = renderHook(() => useDeleteProject(mockOnDelete));

    // Act - Confirm deletion with no project selected
    await act(async () => {
      await result.current.confirmDelete();
    });

    // Assert
    expect(mockOnDelete).not.toHaveBeenCalled();
    expect(ProjectClientService.deleteProject).not.toHaveBeenCalled();
  });

  it("should cancel deletion and close modal", () => {
    // Arrange
    const { result } = renderHook(() => useDeleteProject(mockOnDelete));

    // Open the modal
    act(() => {
      result.current.openModal(mockProject);
    });

    // Act - Cancel deletion
    act(() => {
      result.current.cancelDelete();
    });

    // Assert
    expect(result.current.isOpen).toBe(false);
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  it("should clean up event listener on unmount", () => {
    // Setup spy on document event listeners
    const addEventListenerSpy = vi.spyOn(document, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    // Render the hook
    const { unmount } = renderHook(() => useDeleteProject());

    // Verify listener was added
    expect(addEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));

    // Act - Unmount the component
    unmount();

    // Assert - Event listener removed
    expect(removeEventListenerSpy).toHaveBeenCalledWith("keydown", expect.any(Function));
  });

  it("should close modal when escape key is pressed", () => {
    // Arrange
    const { result } = renderHook(() => useDeleteProject());

    // Open the modal
    act(() => {
      result.current.openModal(mockProject);
    });

    // Act - Press escape key
    const escapeKeyEvent = new KeyboardEvent("keydown", { key: "Escape" });
    act(() => {
      document.dispatchEvent(escapeKeyEvent);
    });

    // Assert
    expect(result.current.isOpen).toBe(false);
  });

  it("should not close modal on escape if deletion is in progress", () => {
    // Arrange
    const { result } = renderHook(() => useDeleteProject());

    // Open the modal
    act(() => {
      result.current.openModal(mockProject);
    });

    // Set isDeleting to true
    act(() => {
      result.current.confirmDelete();
      // Need to modify the state directly to simulate deletion in progress
      // Object.defineProperty(result.current, "isDeleting", {
      //   value: true,
      //   writable: true,
      // });
    });

    // Act - Press escape key
    const escapeKeyEvent = new KeyboardEvent("keydown", { key: "Escape" });
    act(() => {
      document.dispatchEvent(escapeKeyEvent);
    });

    // Assert - Modal should still be open
    expect(result.current.isOpen).toBe(true);
  });
});
