import { type Context } from "hono";
import { createErrorResponse, createSuccessResponse } from "@/api/utils/response";
import { Hono } from "hono";
import { sessionSchema } from "../schema";
import { sessions } from "./index"; // Import the in-memory session store

const chatGetSessionRoute = new Hono();

chatGetSessionRoute.get("/session/:id", async (c: Context) => {
  try {
    const queryParams = c.req.param();
    const parsedQuery = sessionSchema.safeParse(queryParams);

    if (!parsedQuery.success) {
      return createErrorResponse({
        status: 400,
        message: "Invalid query parameters",
        code: "invalid_request",
        details: parsedQuery.error.format(),
      });
    }

    const sessionId = parsedQuery.data.id;

    const session = sessions.get(sessionId);

    if (!session) {
      return createErrorResponse({
        status: 404,
        message: "Session not found",
        code: "not_found",
      });
    }

    return createSuccessResponse({
      message: "Chat session retrieved successfully",
      data: session,
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error stopping chat:", error);
    return createErrorResponse({
      status: 500,
      message: "Failed to stop chat",
      code: "server_error",
    });
  }
});

export default chatGetSessionRoute;
