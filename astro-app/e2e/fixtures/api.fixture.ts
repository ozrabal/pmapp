import { test as base } from "@playwright/test";

// Define test fixtures
interface ApiFixtures {
  baseApiUrl: string;
  createAuthHeader: (token: string) => Record<string, string>;
  getTestToken: () => Promise<string>;
}

/**
 * Extend the base test with API testing fixtures
 */
export const test = base.extend<ApiFixtures>({
  // The base API URL for tests
  // eslint-disable-next-line no-empty-pattern
  baseApiUrl: async ({}, use) => {
    // Use the same URL that's used in the Playwright config
    const baseUrl = "http://localhost:4322/api";
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(baseUrl);
  },

  // Function to create auth headers with token
  // eslint-disable-next-line no-empty-pattern
  createAuthHeader: async ({}, use) => {
    const createHeader = (token: string) => ({
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    });
    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(createHeader);
  },

  // Function to get a valid auth token for testing
  getTestToken: async ({ request, baseApiUrl }, use) => {
    const getToken = async () => {
      // This is a simplified approach - in a real implementation
      // you might have a dedicated endpoint for test auth tokens
      // or use a stored token from a successful login

      // Example of logging in to get a token:
      const loginResponse = await request.post(`${baseApiUrl}/auth/login`, {
        data: {
          email: "test@example.com",
          password: "password123",
        },
      });

      const responseBody = await loginResponse.json();
      return responseBody.token || "test-token-placeholder";
    };

    // eslint-disable-next-line react-hooks/rules-of-hooks
    await use(getToken);
  },
});
