import { handle } from "hono/vercel";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import projectRoutes from "@/api/modules/project";
import { createErrorResponse } from "@/api/utils/response";

const router = new Hono().basePath("/api");

router.onError((error) => {
  if (error instanceof HTTPException) {
    // Get the custom response
    return createErrorResponse({
      status: error.status,
      message: error.message || "An error occurred",
      code: "http_exception",
      details: error.cause as Record<string, unknown>,
    });
  }

  if (error instanceof Error) {
    // Convert error to a Response using the same helper so the return type matches
    return createErrorResponse({
      status: 500,
      message: error.message || error.toString(),
      code: "internal_error",
      details: {},
    });
  }

  // Fallback: always return a Response to satisfy the ErrorHandler type
  return createErrorResponse({
    status: 500,
    message: "Unknown error",
    code: "internal_error",
    details: {},
  });
});

router.route("/project", projectRoutes);

export const maxDuration = 30;

export const GET = handle(router);
export const POST = handle(router);
export const PATCH = handle(router);
export const DELETE = handle(router);
export const OPTIONS = handle(router);
