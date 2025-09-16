import { expect } from "@playwright/test";
import { test } from "./fixtures/auth.fixture";
import { LoginPage } from "./models/LoginPage";
import { getE2ECredentials } from "./utils/credentials";

test.describe("Authentication", () => {
  test("should protect dashboard route for unauthenticated users", async ({ page }) => {
    // Try accessing dashboard without authentication
    await page.goto("/dashboard");

    // Should be redirected to login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("should show error with invalid credentials", async ({ loginPage }) => {
    // Navigate to login page
    await loginPage.goto();

    // Attempt login with invalid credentials
    await loginPage.login("invalid@example.com", "wrongpassword");

    // Verify error message is displayed
    await loginPage.expectErrorMessage("Invalid email or password");
  });

  test("should redirect to dashboard after successful login", async ({ page }) => {
    // Create a new login page instance
    const loginPage = new LoginPage(page);

    // Navigate to login page
    await loginPage.goto();

    // Get login credentials from environment variables helper
    const { username, password } = getE2ECredentials();

    // Login with valid credentials from environment variables
    await loginPage.login(username, password);

    // Verify redirect to dashboard
    await loginPage.expectRedirectToDashboard();
  });
});
