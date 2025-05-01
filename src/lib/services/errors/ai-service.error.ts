// filepath: /Users/piotrlepkowski/Private/pmapp/src/lib/services/errors/ai-service.error.ts
/**
 * Custom error class for AI service errors
 * Provides structured error information with error codes and context
 */
export class AiServiceError extends Error {
  code: string;
  context?: Record<string, any>;

  constructor(message: string, code = "UNKNOWN_ERROR", context?: Record<string, any>) {
    super(message);
    this.name = "AiServiceError";
    this.code = code;
    this.context = context;

    // Capturing stack trace, excluding constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AiServiceError);
    }
  }

  /**
   * Creates a JSON representation of the error
   */
  toJSON(): Record<string, any> {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      ...(this.context ? { context: this.context } : {}),
    };
  }

  /**
   * Creates a user-friendly error message
   */
  toUserMessage(): string {
    switch (this.code) {
      case "INVALID_INPUT":
        return "The provided input data is invalid. Please check and try again.";
      case "RATE_LIMIT_EXCEEDED":
        return "Our AI service is experiencing high demand. Please try again in a few moments.";
      case "SCHEMA_VALIDATION_ERROR":
        return "We received an unexpected response format from the AI service. Our team has been notified.";
      case "JSON_PARSE_ERROR":
        return "We encountered an error processing the AI response. Our team has been notified.";
      case "API_CONNECTION_ERROR":
        return "We're having trouble connecting to our AI service. Please check your internet connection and try again.";
      default:
        return "An unexpected error occurred with our AI service. Please try again later.";
    }
  }
}
