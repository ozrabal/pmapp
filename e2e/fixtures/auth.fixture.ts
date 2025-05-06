/* eslint-disable react-hooks/rules-of-hooks */
import { test as base } from "@playwright/test";
import { LoginPage } from "../models/LoginPage";

// Define test fixtures
interface AuthFixtures {
  loginPage: LoginPage;
  authenticatedPage: LoginPage;
}

/**
 * Extend the base test with authentication fixtures
 */
export const test = base.extend<AuthFixtures>({
  // Define a fixture for the login page
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  // Define a fixture for an authenticated page
  // This logs in before the test and is available in the test
  authenticatedPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    // Using test credentials - in a real project, these would come from env vars
    // or be specific test users created for e2e testing
    await loginPage.login("test@example.com", "password123");

    // Wait for authentication to complete
    await page.waitForURL(/\/dashboard/);

    await use(loginPage);
  },
});
