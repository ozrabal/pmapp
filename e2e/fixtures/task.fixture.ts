import { test as base } from "@playwright/test";
import { LoginPage } from "e2e/models/LoginPage";
import { getE2ECredentials } from "e2e/utils/credentials";

// Helper function to generate a random UUID-like string
const generateRandomId = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

/**
 * Interface for task testing fixtures
 */
interface TaskFixtures {
  generateTaskData: () => Record<string, unknown>;
  createTestProject: () => Promise<{ id: string; name: string }>;
  createTestFunctionalBlock: (projectId: string) => Promise<{ id: string; name: string }>;
  baseApiUrl?: string;
}

/**
 * Extend the base test with task-specific fixtures
 */
export const test = base.extend<TaskFixtures>({
  // Generates random task data for tests
  // eslint-disable-next-line no-empty-pattern
  generateTaskData: async ({}, use) => {
    const generate = () => ({
      name: `Test Task ${Math.random().toString(36).substring(2, 15) + Date.now()}`,
      description: "This is a test task created by E2E test",
      priority: "medium",
      estimatedValue: 5,
    });
    await use(generate);
  },

  // Creates a test project for task testing
  createTestProject: async ({ request, baseApiUrl }, use) => {
    const createProject = async () => {
      const projectName = `Test Project ${generateRandomId().substring(0, 8)}`;

      const response = await request.post(`${baseApiUrl}/projects`, {
        data: {
          name: projectName,
          description: "Test project for task API tests",
        },
      });

      console.log("Creating project:", response);
      const responseBody = await response.json();
      console.log("Project created:", responseBody);
      return {
        id: responseBody.id,
        name: projectName,
      };
    };

    await use(createProject);
  },

  // Creates a test functional block for task testing
  createTestFunctionalBlock: async ({ request, baseApiUrl }, use) => {
    const createBlock = async (projectId: string) => {
      const blockName = `Test Block ${generateRandomId().substring(0, 8)}`;

      // Note: This assumes there's an API to add a functional block to a project
      // In a real application, you'd need to adjust this based on your actual API
      const response = await request.post(`${baseApiUrl}/projects/${projectId}/functional-blocks`, {
        data: {
          name: blockName,
          description: "Test functional block for task API tests",
        },
      });

      const responseBody = await response.json();
      return {
        id: responseBody.id,
        name: blockName,
      };
    };

    await use(createBlock);
  },
});

/**
 * Helper function to authenticate for tests
 * This function sets up the authentication cookies for the test browser context
 */
export async function setupAuth(context: import("@playwright/test").BrowserContext): Promise<void> {
  try {
    // Get the test credentials from environment or fixtures
    // const email = process.env.E2E_USERNAME || "test@example.com";
    // const password = process.env.E2E_PASSWORD || "testPassword123!";

    // // Create a new page in the provided context
    const page = await context.newPage();

    // // Navigate to the login page
    // await page.goto(`${process.env.API_BASE_URL || "http://localhost:3000"}/login?redirect=/dashboard`);

    // // Fill in login form
    // await page.fill('input[name="email"]', email);
    // await page.fill('input[name="password"]', password);

    // // Submit the form - this will set the authentication cookies
    // await page.click('button[type="submit"]');

    // // Wait for navigation to complete to ensure cookies are set
    // await page.waitForURL(`${process.env.API_BASE_URL || "http://localhost:3000"}/dashboard`, {
    //   timeout: 5000, // Adjust timeout as needed
    // });

    // // Close this temporary page as we only needed it to set cookies
    // await page.close();
    // Create a new login page instance
    const loginPage = new LoginPage(page);

    // Navigate to login page
    await loginPage.goto();

    // Get login credentials from environment variables helper
    const { username, password } = getE2ECredentials();

    // Login with valid credentials from environment variables
    await loginPage.login(username, password);
    await page.close();
  } catch (error) {
    // If authentication fails, throw an error to fail the tests that require auth
    // This makes it clear that the test didn't run properly due to auth issues
    throw new Error(`Authentication setup failed: ${error instanceof Error ? error.message : String(error)}`);
  }
}
