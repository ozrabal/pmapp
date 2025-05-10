/**
 * Helper functions for managing E2E test credentials
 */

/**
 * Get E2E test credentials from environment variables
 * @returns Object containing username and password
 * @throws Error if credentials are not set in .env.test
 */
export function getE2ECredentials(): { username: string; password: string } {
  const username = process.env.E2E_USERNAME;
  const password = process.env.E2E_PASSWORD;

  if (!username || !password) {
    throw new Error("E2E_USERNAME and E2E_PASSWORD must be set in .env.test");
  }

  return { username, password };
}
