import { type Page, type Locator, expect } from "@playwright/test";

/**
 * Page Object Model for Login Page
 */
export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.getByLabel("Email");
    this.passwordInput = page.getByLabel("Password");
    this.submitButton = page.getByRole("button", { name: /sign in/i });
    this.errorMessage = page.getByRole("alert");
    this.forgotPasswordLink = page.getByRole("link", { name: /forgot password/i });
  }

  /**
   * Navigate to login page
   */
  async goto() {
    await this.page.goto("/auth/login");
  }

  /**
   * Login with email and password
   */
  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /**
   * Assert that error message is visible with specific text
   */
  async expectErrorMessage(message?: string) {
    await expect(this.errorMessage).toBeVisible();
    if (message) {
      await expect(this.errorMessage).toContainText(message);
    }
  }

  /**
   * Assert that user is redirected to dashboard after login
   */
  async expectRedirectToDashboard() {
    await expect(this.page).toHaveURL(/\/dashboard/);
  }
}
