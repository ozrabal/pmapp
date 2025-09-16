import type { ErrorResponseDto } from "../../types";

export interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: Record<string, unknown>;
  isApiError: boolean;
}

/**
 * Creates a standardized API error object
 */
export function createApiError(
  message: string,
  status?: number,
  code?: string,
  details?: Record<string, unknown>
): ApiError {
  const error = new Error(message) as ApiError;
  error.isApiError = true;
  error.status = status;
  error.code = code;
  error.details = details;
  return error;
}

/**
 * Parses API error responses into standardized error objects
 */
export async function parseApiErrorResponse(response: Response): Promise<ApiError> {
  let errorData: ErrorResponseDto;

  try {
    errorData = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (e) {
    // If JSON parsing fails, create a generic error
    return createApiError("Failed to parse error response", response.status, "parse_error");
  }

  return createApiError(
    errorData.error?.message || "Unknown error",
    response.status,
    errorData.error?.code,
    errorData.error?.details
  );
}

/**
 * Handles network or connection errors
 */
export function handleNetworkError(error: unknown): ApiError {
  if (error instanceof Error) {
    return createApiError(
      `Network error: ${error.message}`,
      0, // 0 indicates network error
      "network_error"
    );
  }
  return createApiError("Unknown network error occurred", 0, "network_error");
}

/**
 * Handles data validation errors for expected API data structures
 */
export function handleDataValidationError(fieldName: string, error: unknown): ApiError {
  const message = error instanceof Error ? error.message : "Invalid data format";

  return createApiError(
    `Data validation error in ${fieldName}: ${message}`,
    400, // Using 400 to indicate client-side validation issues
    "data_validation_error",
    { fieldName }
  );
}

/**
 * Determines if an error represents a session expiration
 */
export function isSessionExpiredError(error: ApiError): boolean {
  return error.status === 401;
}

/**
 * Determines if an error represents a permission issue
 */
export function isPermissionError(error: ApiError): boolean {
  return error.status === 403;
}

/**
 * Determines if an error represents a resource not found
 */
export function isNotFoundError(error: ApiError): boolean {
  return error.status === 404;
}

/**
 * Gets a user-friendly message based on error type
 */
export function getUserFriendlyErrorMessage(error: ApiError): string {
  if (isSessionExpiredError(error)) {
    return "Your session has expired. Please log in again to continue.";
  }

  if (isPermissionError(error)) {
    return "You don't have permission to access this resource.";
  }

  if (isNotFoundError(error)) {
    return "The requested resource was not found or has been deleted.";
  }

  if (error.status === 0) {
    return "Network error. Please check your internet connection and try again.";
  }

  if (error.status === 500) {
    return "An unexpected server error occurred. Our team has been notified.";
  }

  return error.message || "An unexpected error occurred.";
}

/**
 * Redirects to appropriate error page based on error type
 */
export function handleErrorRedirection(error: ApiError): void {
  if (isSessionExpiredError(error)) {
    // Redirect to login with return path
    const returnPath = encodeURIComponent(window.location.pathname);
    window.location.href = `/login?redirectTo=${returnPath}`;
    return;
  }

  // Other redirections can be added as needed
}
