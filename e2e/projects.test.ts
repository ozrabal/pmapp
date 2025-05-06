import { test } from "./fixtures/auth.fixture";
import { expect } from "@playwright/test";
import { ProjectsPage } from "./models/ProjectsPage";
import { waitForNetworkIdle } from "./utils/test-helpers";

test.describe("Project Management", () => {
  test("should display empty state when user has no projects", async ({ page }) => {
    // Create a new projects page instance
    const projectsPage = new ProjectsPage(page);

    // Navigate to projects page (dashboard)
    await projectsPage.goto();

    // Check if the empty state is displayed
    expect(await projectsPage.isEmptyStateVisible()).toBeTruthy();

    // Verify no projects are shown
    expect(await projectsPage.getProjectCount()).toBe(0);
  });

  test("should create a new project", async ({ page }) => {
    // Create a new projects page instance
    const projectsPage = new ProjectsPage(page);

    // Navigate to projects page
    await projectsPage.goto();

    // Click the create project button
    await projectsPage.clickCreateProject();

    // Fill out the form
    await page.getByLabel("Project name").fill("Test Project");
    await page.getByLabel("Description").fill("This is a test project created by Playwright");
    await page.getByRole("button", { name: /create/i }).click();

    // Wait for the operation to complete
    await waitForNetworkIdle(page);

    // Verify the project appears in the list
    await projectsPage.expectProjectExists("Test Project");
  });

  test("should filter projects by status", async ({ page }) => {
    // Create a new projects page instance
    const projectsPage = new ProjectsPage(page);

    // Assuming we have projects with different statuses
    await projectsPage.goto();

    // Count all projects initially
    const initialCount = await projectsPage.getProjectCount();

    // Filter by 'In Progress' status
    await projectsPage.filterByStatus("In Progress");

    // Get the filtered count
    const filteredCount = await projectsPage.getProjectCount();

    // The filtered count should be less than or equal to the initial count
    expect(filteredCount).toBeLessThanOrEqual(initialCount);
  });

  test("should navigate to project details", async ({ page }) => {
    // Create a new projects page instance
    const projectsPage = new ProjectsPage(page);

    // Navigate to projects page
    await projectsPage.goto();

    // Create a project if none exists
    if (await projectsPage.isEmptyStateVisible()) {
      await projectsPage.clickCreateProject();
      await page.getByLabel("Project name").fill("Project for Details Test");
      await page.getByLabel("Description").fill("Testing project details navigation");
      await page.getByRole("button", { name: /create/i }).click();
      await waitForNetworkIdle(page);
    }

    // Open the first project (or the one we just created)
    const projectName = "Project for Details Test";
    await projectsPage.openProject(projectName);

    // Verify we're on the project details page
    await expect(page).toHaveURL(/\/projects\/[^/]+$/);

    // Verify project name is displayed in the header
    await expect(page.getByRole("heading", { name: projectName })).toBeVisible();
  });
});
