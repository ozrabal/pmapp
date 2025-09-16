// Global setup for all test files
import "@testing-library/jest-dom";
import { afterAll, beforeAll, expect, vi } from "vitest";

// Mock global objects that might be missing in jsdom
// This addresses the "not implemented" errors for certain browser APIs
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Add any global mocks or custom matchers here
beforeAll(() => {
  // Global setup before all tests
});

afterAll(() => {
  // Global teardown after all tests
});

// Add custom matchers if needed
expect.extend({
  // Add custom matchers here if needed
});
