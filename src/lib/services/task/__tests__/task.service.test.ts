import { describe, it, expect, vi, beforeEach } from "vitest";
import { TaskService, TaskError } from "../task.service";
import type { CreateTaskInput } from "../../../schemas/task.schemas";

// Create a mock for the Supabase client
const createMockSupabase = () => {
  const mockFrom = vi.fn();
  const mockSelect = vi.fn();
  const mockEq = vi.fn();
  const mockSingle = vi.fn();
  const mockInsert = vi.fn();

  // Setup the mock chain
  mockEq.mockReturnValue({ single: mockSingle });
  mockSelect.mockReturnValue({ eq: mockEq });
  mockInsert.mockReturnValue({ select: mockSelect });
  mockFrom.mockReturnValue({
    select: mockSelect,
    insert: mockInsert,
  });

  return {
    from: mockFrom,
    mockSelect,
    mockEq,
    mockSingle,
    mockInsert,
  };
};

describe("TaskService", () => {
  let taskService: TaskService;
  let mockSupabase: ReturnType<typeof createMockSupabase>;

  beforeEach(() => {
    taskService = new TaskService();
    mockSupabase = createMockSupabase();
  });

  describe("createTaskInFunctionalBlock", () => {
    // Valid test data
    const validUserId = "user-123";
    const validProjectId = "project-456";
    const validBlockId = "block-789";
    const validTaskData: CreateTaskInput = {
      name: "Test Task",
      description: "This is a test task",
      priority: "medium",
      estimatedValue: 5,
    };

    // Test case: Successful task creation
    it("should create a task successfully", async () => {
      // Arrange
      const mockProject = {
        id: validProjectId,
        owner_id: validUserId,
        functionalBlocks: {
          blocks: [{ id: validBlockId, name: "Test Block" }],
        },
      };
      const mockCreatedTask = {
        id: "task-123",
        created_at: "2025-06-12T10:00:00Z",
      };

      mockSupabase.mockSingle.mockResolvedValueOnce({ data: mockProject, error: null });
      mockSupabase.mockSingle.mockResolvedValueOnce({ data: mockCreatedTask, error: null });

      // Act
      const result = await taskService.createTaskInFunctionalBlock(
        mockSupabase as any,
        validUserId,
        validProjectId,
        validBlockId,
        validTaskData
      );

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith("projects");
      expect(mockSupabase.mockSelect).toHaveBeenCalledWith("id, owner_id, functionalBlocks");
      expect(mockSupabase.mockEq).toHaveBeenCalledWith("id", validProjectId);
      expect(mockSupabase.from).toHaveBeenCalledWith("tasks");
      expect(mockSupabase.mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          project_id: validProjectId,
          functional_block_id: validBlockId,
          name: validTaskData.name,
          description: validTaskData.description,
          priority: validTaskData.priority,
          estimated_value: validTaskData.estimatedValue,
        })
      );

      expect(result).toEqual({
        id: mockCreatedTask.id,
        name: validTaskData.name,
        description: validTaskData.description,
        priority: validTaskData.priority,
        estimatedValue: validTaskData.estimatedValue,
        estimatedByAI: false,
        createdAt: mockCreatedTask.created_at,
      });
    });

    // Test case: Project not found
    it("should throw an error if project is not found", async () => {
      // Arrange
      mockSupabase.mockSingle.mockResolvedValueOnce({ data: null, error: { message: "Project not found" } });

      // Act & Assert
      await expect(
        taskService.createTaskInFunctionalBlock(
          mockSupabase as any,
          validUserId,
          validProjectId,
          validBlockId,
          validTaskData
        )
      ).rejects.toThrow(TaskError);

      await expect(
        taskService.createTaskInFunctionalBlock(
          mockSupabase as any,
          validUserId,
          validProjectId,
          validBlockId,
          validTaskData
        )
      ).rejects.toMatchObject({
        message: "Project not found",
        statusCode: 404,
        errorCode: "PROJECT_NOT_FOUND",
      });
    });

    // Test case: Functional block not found
    it("should throw an error if functional block is not found", async () => {
      // Arrange
      const mockProject = {
        id: validProjectId,
        owner_id: validUserId,
        functionalBlocks: {
          blocks: [{ id: "different-block-id", name: "Different Block" }],
        },
      };

      mockSupabase.mockSingle.mockResolvedValueOnce({ data: mockProject, error: null });

      // Act & Assert
      await expect(
        taskService.createTaskInFunctionalBlock(
          mockSupabase as any,
          validUserId,
          validProjectId,
          validBlockId,
          validTaskData
        )
      ).rejects.toThrow(TaskError);

      await expect(
        taskService.createTaskInFunctionalBlock(
          mockSupabase as any,
          validUserId,
          validProjectId,
          validBlockId,
          validTaskData
        )
      ).rejects.toMatchObject({
        message: "Functional block not found in this project",
        statusCode: 404,
        errorCode: "FUNCTIONAL_BLOCK_NOT_FOUND",
      });
    });

    // Test case: Project has no functional blocks
    it("should throw an error if project has no functional blocks", async () => {
      // Arrange
      const mockProject = {
        id: validProjectId,
        owner_id: validUserId,
        functionalBlocks: null,
      };

      mockSupabase.mockSingle.mockResolvedValueOnce({ data: mockProject, error: null });

      // Act & Assert
      await expect(
        taskService.createTaskInFunctionalBlock(
          mockSupabase as any,
          validUserId,
          validProjectId,
          validBlockId,
          validTaskData
        )
      ).rejects.toThrow(TaskError);

      await expect(
        taskService.createTaskInFunctionalBlock(
          mockSupabase as any,
          validUserId,
          validProjectId,
          validBlockId,
          validTaskData
        )
      ).rejects.toMatchObject({
        message: "Project has no functional blocks",
        statusCode: 404,
        errorCode: "FUNCTIONAL_BLOCKS_NOT_FOUND",
      });
    });

    // Test case: Error inserting task
    it("should throw an error if task insertion fails", async () => {
      // Arrange
      const mockProject = {
        id: validProjectId,
        owner_id: validUserId,
        functionalBlocks: {
          blocks: [{ id: validBlockId, name: "Test Block" }],
        },
      };

      mockSupabase.mockSingle.mockResolvedValueOnce({ data: mockProject, error: null });
      mockSupabase.mockSingle.mockResolvedValueOnce({ data: null, error: { message: "Insert failed" } });

      // Act & Assert
      await expect(
        taskService.createTaskInFunctionalBlock(
          mockSupabase as any,
          validUserId,
          validProjectId,
          validBlockId,
          validTaskData
        )
      ).rejects.toThrow(TaskError);

      await expect(
        taskService.createTaskInFunctionalBlock(
          mockSupabase as any,
          validUserId,
          validProjectId,
          validBlockId,
          validTaskData
        )
      ).rejects.toMatchObject({
        message: "Failed to create task",
        statusCode: 500,
        errorCode: "TASK_CREATION_FAILED",
      });
    });
  });
});
