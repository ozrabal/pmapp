import type { ErrorResponseDto } from "@/types";

export function createValidationError(details: ErrorResponseDto["error"]["details"]) {
  const response: ErrorResponseDto = {
    error: {
      code: "validation_error",
      message: "Invalid query parameters",
      details,
    },
  };

  return new Response(JSON.stringify(response), {
    status: 400,
    headers: {
      "Content-Type": "application/json",
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

  return new Response(JSON.stringify(response), {
    status: params.status || 500,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
