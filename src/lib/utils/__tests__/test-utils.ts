import { render } from "@testing-library/react";
import type { RenderOptions, RenderResult } from "@testing-library/react";
import type { ReactElement } from "react";
import { vi } from "vitest";

/**
 * Custom render function for testing React components with common wrappers
 *
 * @param ui - The React element to render
 * @param options - Additional render options from testing-library
 * @returns The render result from testing-library
 */
function customRender(ui: ReactElement, options?: Omit<RenderOptions, "wrapper">): RenderResult {
  return render(ui, {
    // Add global wrappers here if needed, such as:
    // - NotificationProvider
    // - ThemeProvider
    // - AuthProvider
    ...options,
  });
}

/**
 * Helper to await multiple async events for testing race conditions
 *
 * @param promises - Array of promises to await
 * @returns Promise that resolves when all promises are settled
 */
async function waitForAllPromises(promises: Promise<unknown>[]): Promise<PromiseSettledResult<unknown>[]> {
  return Promise.allSettled(promises);
}

/**
 * Creates mock event for testing event handlers
 *
 * @param overrides - Properties to override in the mock event
 * @returns A mock event object for testing
 */
function createMockEvent(overrides: Partial<Event> = {}): Event {
  return {
    preventDefault: vi.fn(),
    stopPropagation: vi.fn(),
    ...overrides,
  } as unknown as Event;
}

export * from "@testing-library/react";
export { customRender as render, waitForAllPromises, createMockEvent };
