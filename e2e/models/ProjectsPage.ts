import { type Page, type Locator, expect } from "@playwright/test";
import { waitForNetworkIdle } from "../utils/test-helpers";

/**
 * Page Object Model for Projects page
 */
export class ProjectsPage {
  readonly page: Page;
  readonly createProjectButton: Locator;
  readonly projectsList: Locator;
  readonly projectCards: Locator;
  readonly projectFilter: Locator;
  readonly emptyStateMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.createProjectButton = page.getByRole("button", { name: /create project/i });
    this.projectsList = page.getByRole("list", { name: /projects list/i });
    this.projectCards = page.getByTestId("project-card");
    this.projectFilter = page.getByRole("combobox", { name: /filter projects/i });
    this.emptyStateMessage = page.getByText(/you don't have any projects yet/i);
  }

  /**
   * Navigate to projects page
   */
  async goto() {
    await this.page.goto("/dashboard");
    await waitForNetworkIdle(this.page);
  }

  /**
   * Click the create project button
   */
  async clickCreateProject() {
    await this.createProjectButton.click();
  }

  /**
   * Get the count of projects displayed
   */
  async getProjectCount(): Promise<number> {
    try {
      return await this.projectCards.count();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return 0;
    }
  }

  /**
   * Check if empty state is displayed
   */
  async isEmptyStateVisible(): Promise<boolean> {
    try {
      return await this.emptyStateMessage.isVisible();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      return false;
    }
  }

  /**
   * Open a specific project by name
   */
  async openProject(name: string) {
    await this.page.getByRole("heading", { name }).click();
  }

  /**
   * Filter projects by status
   */
  async filterByStatus(status: string) {
    await this.projectFilter.click();
    await this.page.getByRole("option", { name: status }).click();
    await waitForNetworkIdle(this.page);
  }

  /**
   * Assert that a project with the given name exists
   */
  async expectProjectExists(name: string) {
    const projectCard = this.page.getByRole("heading", { name }).first();
    await expect(projectCard).toBeVisible();
  }

  /**
   * Assert that a project doesn't exist
   */
  async expectProjectDoesNotExist(name: string) {
    const projectCard = this.page.getByRole("heading", { name });
    await expect(projectCard).toHaveCount(0);
  }
}
