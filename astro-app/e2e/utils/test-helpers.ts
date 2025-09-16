import { expect, type Page } from "@playwright/test";

/**
 * Helper function to wait for network requests to complete
 * @param page The Playwright page object
 */
export async function waitForNetworkIdle(page: Page): Promise<void> {
  await page.waitForLoadState("networkidle");
}

/**
 * Helper function to wait for page navigation
 * @param page The Playwright page object
 * @param urlPattern The URL pattern to wait for
 */
export async function waitForNavigation(page: Page, urlPattern: RegExp): Promise<void> {
  await page.waitForURL(urlPattern);
}

/**
 * Helper function to check if an element is visible
 * @param page The Playwright page object
 * @param selector The selector to check
 * @returns True if the element is visible, false otherwise
 */
export async function isElementVisible(page: Page, selector: string): Promise<boolean> {
  try {
    const element = page.locator(selector);
    return await element.isVisible();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    return false;
  }
}

/**
 * Helper function to take a screenshot of the current page
 * @param page The Playwright page object
 * @param name The name of the screenshot
 */
export async function takeScreenshot(page: Page, name: string): Promise<void> {
  await page.screenshot({ path: `./test-results/screenshots/${name}.png`, fullPage: true });
}

/**
 * Helper function to verify an element has specific text content
 * @param page The Playwright page object
 * @param selector The selector to check
 * @param text The text to verify
 */
export async function expectElementToHaveText(page: Page, selector: string, text: string): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toContainText(text);
}

/**
 * Helper function to verify that an element exists on the page
 * @param page The Playwright page object
 * @param selector The selector to check
 */
export async function expectElementToExist(page: Page, selector: string): Promise<void> {
  const element = page.locator(selector);
  await expect(element).toHaveCount(1);
}
