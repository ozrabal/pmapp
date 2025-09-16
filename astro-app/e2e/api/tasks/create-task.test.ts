import { test as baseTest, expect, mergeTests } from "@playwright/test";
import { test as apiTest } from "../../fixtures/api.fixture";
import { test as taskTest, setupAuth } from "../../fixtures/task.fixture";

// Helper function to generate a random UUID-like string
const generateRandomId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

// Combine fixtures from both API and task tests
const test = mergeTests(apiTest, taskTest);

test.describe("Task creation API", () => {
  let projectId: string;
  let functionalBlockId: string;

  test.beforeAll(async ({ browser, createTestProject, createTestFunctionalBlock }) => {
    // Setup authentication with cookies
    const context = await browser.newContext();
    await setupAuth(context);

    // Create a test project with functional blocks using the authenticated context
    const project = await createTestProject();
    projectId = project.id;

    const block = await createTestFunctionalBlock(projectId);
    functionalBlockId = block.id;

    // Close the context when done
    await context.close();
  });

  test("should create a task successfully", async ({ request, generateTaskData }) => {
    // Arrange
    const taskData = generateTaskData();
    const taskName = taskData.name;

    // Act
    const response = await request.post(`/api/projects/${projectId}/functional-blocks/${functionalBlockId}/tasks`, {
      headers: {
        "Content-Type": "application/json",
      },
      data: taskData,
    });

    // Assert
    expect(response.status()).toBe(201);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("id");
    expect(responseBody).toHaveProperty("createdAt");
    expect(responseBody.name).toBe(taskName);
    expect(responseBody.description).toBe(taskData.description);
    expect(responseBody.priority).toBe(taskData.priority);
    expect(responseBody.estimatedValue).toBe(taskData.estimatedValue);
    expect(responseBody.estimatedByAI).toBe(false);
  });

  test("should return 400 for invalid input - missing task name", async ({ request }) => {
    // Arrange
    const invalidTaskData = {
      description: "Task without a name",
      priority: "low",
    };

    // Act
    const response = await request.post(`/api/projects/${projectId}/functional-blocks/${functionalBlockId}/tasks`, {
      headers: {
        "Content-Type": "application/json",
      },
      data: invalidTaskData,
    });

    // Assert
    expect(response.status()).toBe(400);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");
    expect(responseBody.error.code).toBe("VALIDATION_ERROR");
    expect(responseBody.error).toHaveProperty("details");
    expect(responseBody.error.details.fieldErrors).toHaveProperty("name");
  });

  test("should return 404 for non-existent project", async ({ request }) => {
    // Arrange
    const nonExistentProjectId = generateRandomId();
    const taskData = {
      name: "Task for non-existent project",
      description: "This task should not be created",
      priority: "medium",
    };

    // Act
    const response = await request.post(
      `/api/projects/${nonExistentProjectId}/functional-blocks/${functionalBlockId}/tasks`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        data: taskData,
      }
    );

    // Assert
    expect(response.status()).toBe(404);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");
    expect(responseBody.error.code).toBe("PROJECT_NOT_FOUND");
  });

  test("should return 404 for non-existent functional block", async ({ request }) => {
    // Arrange
    const nonExistentBlockId = generateRandomId();
    const taskData = {
      name: "Task for non-existent block",
      description: "This task should not be created",
      priority: "medium",
    };

    // Act
    const response = await request.post(`/api/projects/${projectId}/functional-blocks/${nonExistentBlockId}/tasks`, {
      headers: {
        "Content-Type": "application/json",
      },
      data: taskData,
    });

    // Assert
    expect(response.status()).toBe(404);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");
    expect(responseBody.error.code).toBe("FUNCTIONAL_BLOCK_NOT_FOUND");
  });

  test("should return 401 when not authenticated", async ({ request }) => {
    // Arrange
    const taskData = {
      name: "Unauthorized task",
      description: "This task should not be created",
      priority: "high",
    };

    // Act
    const response = await request.post(`/api/projects/${projectId}/functional-blocks/${functionalBlockId}/tasks`, {
      headers: {
        "Content-Type": "application/json",
      },
      data: taskData,
    });

    // Assert
    expect(response.status()).toBe(401);

    const responseBody = await response.json();
    expect(responseBody).toHaveProperty("error");
    expect(responseBody.error.code).toBe("UNAUTHORIZED");
  });
});
