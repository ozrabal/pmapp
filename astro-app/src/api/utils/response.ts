import type { ErrorResponseDto } from "@/types";

const DEFAULT_HEADERS = {
  "Content-Type": "application/json",
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

export function createSuccessResponse<T>(data: T, status = 200, headers: HeadersInit = {}): Response {
  return createResponse(data, status, headers);
}

export function createValidationError(
  details: ErrorResponseDto["error"]["details"],
  status = 400,
  headers: HeadersInit = {}
): Response {
  const response: ErrorResponseDto = {
    error: {
      code: "validation_error",
      message: "Invalid query parameters",
      details,
    },
  };

  return new Response(JSON.stringify(response), {
    status,
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
  });
}

export function createErrorResponse(params: {
  status: number;
  message: string;
  code?: string;
  details?: ErrorResponseDto["error"]["details"];
}) {
  const response: ErrorResponseDto = {
    error: {
      code: params.code || "custom_error",
      message: params.message,
      details: params.details ? params.details : undefined,
    },
  };

  return createResponse(response, params.status || 500);
}
