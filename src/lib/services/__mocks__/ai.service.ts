import { vi } from "vitest";

/**
 * Mock AI service for testing
 */
export const aiService = {
  /**
   * Mock implementation of validateProjectAssumptions
   */
  validateProjectAssumptions: vi.fn().mockResolvedValue({
    isValid: true,
    feedback: [
      {
        field: "projectGoals",
        message: "Clear and well-defined goals",
        severity: "info",
      },
    ],
    suggestions: [
      {
        id: "suggestion-1",
        field: "projectGoals",
        suggestion: "Consider adding specific success metrics",
        reason: "Measurable goals help track project success",
      },
    ],
  }),

  /**
   * Mock implementation of generateProjectSuggestions
   */
  generateProjectSuggestions: vi.fn().mockResolvedValue({
    suggestions: [
      {
        id: "suggestion-1",
        category: "feature",
        title: "User authentication",
        description: "Implement secure user authentication",
      },
    ],
  }),

  /**
   * Mock implementation of generateSchedule
   */
  generateSchedule: vi.fn().mockResolvedValue({
    stages: [
      {
        id: "stage-1",
        name: "Planning",
        description: "Project planning phase",
        startDate: "2025-05-01",
        endDate: "2025-05-15",
        dependencies: [],
      },
    ],
  }),

  /**
   * Mock implementation of completion
   */
  completion: vi.fn().mockResolvedValue({
    content: "This is a mock AI response",
  }),

  /**
   * Mock implementation of toolCompletion
   */
  toolCompletion: vi.fn().mockResolvedValue({
    content: null,
    toolCalls: [
      {
        id: "call-1",
        type: "function",
        function: {
          name: "mockFunction",
          arguments: '{"param1":"value1"}',
        },
      },
    ],
  }),
};

export default aiService;
