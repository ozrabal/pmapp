import { handle } from "hono/vercel";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { jwt } from "hono/jwt";
import { type JWTPayload } from "hono/utils/jwt/types";
import projectRoutes from "@/api/modules/project";
import planningRoutes from "@/api/modules/planning";
import { createErrorResponse } from "@/api/utils/response";
import type { JwtVariables } from "hono/jwt";

const router = new Hono<{ Variables: JwtVariables<JWTPayload> }>().basePath("/api");

const jwtMiddleware = jwt({
  secret: process.env.JWT_SECRET!,
});

router.use("*", async (c, next) => {
  try {
    return await jwtMiddleware(c, next);
  } catch (error) {
    throw new HTTPException(401, {
      message: "Invalid or missing token",
      cause: { error: error instanceof Error ? error.message : "Token validation failed" },
    });
  }
});

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
router.route("/planning", planningRoutes);

export const maxDuration = 30;

export const GET = handle(router);
export const POST = handle(router);
export const PATCH = handle(router);
export const DELETE = handle(router);
export const OPTIONS = handle(router);
