import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useProjectAssumptions } from "../../projects/assumptions/hooks/useProjectAssumptions";
import { ProjectClientService } from "../../../lib/services/project.service";

// Mock dependencies
vi.mock("../../../lib/services/project.service", () => ({
  ProjectClientService: {
    getProject: vi.fn().mockResolvedValue({
      id: "test-project-id",
      name: "Test Project",
      description: "Test Description",
      assumptions: {
        projectGoals: "Initial goals",
        targetAudience: "Initial audience",
        keyFeatures: "Initial features",
        technologyStack: "Initial tech stack",
        constraints: "Initial constraints",
      },
    }),
    updateProject: vi.fn().mockResolvedValue({}),
    validateProjectAssumptions: vi.fn().mockResolvedValue({
      isValid: true,
      feedback: [],
      suggestions: [
        {
          id: "suggestion-1",
          field: "projectGoals",
          suggestion: "Suggested goals improvement",
          reason: "To make goals more specific",
        },
      ],
    }),
  },
}));

describe("useProjectAssumptions", () => {
  const projectId = "test-project-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should load project on mount", async () => {
    const { result } = renderHook(() => useProjectAssumptions(projectId));

    await waitFor(() => {
      expect(result.current.project).not.toBeNull();
    });

    expect(ProjectClientService.getProject).toHaveBeenCalledWith(projectId);
    expect(result.current.project?.assumptions?.projectGoals).toBe("Initial goals");
  });

  it("should update assumption field and call API with debounce", async () => {
    // First setup the hook with real timers
    const { result } = renderHook(() => useProjectAssumptions(projectId));

    // Wait for initial load with real timers
    await waitFor(() => {
      expect(result.current.project).not.toBeNull();
    });

    // Now switch to fake timers for testing the debounce
    vi.useFakeTimers();

    // Update a field
    act(() => {
      result.current.updateAssumption("projectGoals", "Updated goals");
    });

    // Verify immediate state update
    expect(result.current.project?.assumptions?.projectGoals).toBe("Updated goals");

    // API should not have been called yet due to debounce
    expect(ProjectClientService.updateProject).not.toHaveBeenCalled();

    // Fast-forward debounce timeout
    act(() => {
      vi.advanceTimersByTime(500);
    });

    // Switch back to real timers before doing more async operations
    vi.useRealTimers();

    // Wait for update to complete
    await waitFor(() => {
      expect(ProjectClientService.updateProject).toHaveBeenCalled();
    });

    // Now API should be called
    expect(ProjectClientService.updateProject).toHaveBeenCalledWith(
      "test-project-id",
      expect.objectContaining({
        assumptions: expect.objectContaining({
          projectGoals: "Updated goals",
        }),
      })
    );
  });

  it("should validate assumptions", async () => {
    const { result } = renderHook(() => useProjectAssumptions(projectId));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.project).not.toBeNull();
    });

    // Trigger validation
    await act(async () => {
      await result.current.validateAssumptions();
    });

    // Check API call
    expect(ProjectClientService.validateProjectAssumptions).toHaveBeenCalledWith(projectId);

    // Check validation results
    expect(result.current.validationResult.isValid).toBe(true);
    expect(result.current.validationResult.suggestions).toHaveLength(1);
    expect(result.current.validationResult.suggestions[0].field).toBe("projectGoals");
  });

  it("should accept a suggestion", async () => {
    const { result } = renderHook(() => useProjectAssumptions(projectId));

    // Wait for initial load
    await waitFor(() => {
      expect(result.current.project).not.toBeNull();
    });

    // Trigger validation to get suggestions
    await act(async () => {
      await result.current.validateAssumptions();
    });

    // Accept the first suggestion
    await act(async () => {
      await result.current.acceptSuggestion("suggestion-1");
    });

    // Updated field should reflect the suggestion
    expect(result.current.project?.assumptions?.projectGoals).toBe("Suggested goals improvement");

    // The suggestion should be marked as accepted
    const suggestion = result.current.validationResult.suggestions.find((s) => s.id === "suggestion-1");
    expect(suggestion?.isAccepted).toBe(true);
  });
});
