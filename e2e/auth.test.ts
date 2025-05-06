import { expect } from "@playwright/test";
import { test } from "./fixtures/auth.fixture";
import { LoginPage } from "./models/LoginPage";

test.describe("Authentication", () => {
  test("should show error with invalid credentials", async ({ loginPage }) => {
    // Navigate to login page
    await loginPage.goto();

    // Attempt login with invalid credentials
    await loginPage.login("invalid@example.com", "wrongpassword");

    // Verify error message is displayed
    await loginPage.expectErrorMessage("Nieprawidłowy email lub hasło");
  });

  test("should redirect to dashboard after successful login", async ({ page }) => {
    // Create a new login page instance
    const loginPage = new LoginPage(page);

    // Navigate to login page
    await loginPage.goto();

    // Login with valid credentials
    await loginPage.login("ozrabal@gmail.com", "admin");

    // Verify redirect to dashboard
    await loginPage.expectRedirectToDashboard();
  });

  test("should protect dashboard route for unauthenticated users", async ({ page }) => {
    // Try accessing dashboard without authentication
    await page.goto("/dashboard");

    // Should be redirected to login page
    await expect(page).toHaveURL(/\/auth\/login/);
  });

  test("already authenticated user should access dashboard", async ({ page }) => {
    // Using the authenticated fixture, navigate directly to dashboard
    await page.goto("/dashboard");

    // Should stay on dashboard page
    await expect(page).toHaveURL(/\/dashboard/);

    // Check for dashboard elements
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });
});
