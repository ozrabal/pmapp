import { type ValidationError } from "zod-validation-error";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
};

export type ErrorResponseDto<T extends ValidationError> = {
  error: {
    code: string;
    message: string;
    details?: Record<string, unknown> | T["details"];
  };
};

export function createResponse<T>(data: T, status = 200, headers: HeadersInit = {}): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
  });
}

export function createErrorResponse<T extends ValidationError>(params: {
  status: number;
  message: string;
  code?: string;
  details?: T["details"] | Record<string, unknown>;
}): Response {
  const response: ErrorResponseDto<T> = {
    error: {
      code: params.code || "custom_error",
      message: params.message,
      details: params.details,
    },
  };

  return createResponse(response, params.status || 500);
}
