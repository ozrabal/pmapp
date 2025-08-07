import { createErrorResponse, createSuccessResponse } from "@/api/utils/response";
import { Hono, type Context } from "hono";
import { sessionSchema } from "../schema";
import { sessions } from ".";

const chatDeleteSessionRoute = new Hono();

export default chatDeleteSessionRoute.delete("/session/:id", async (c: Context) => {
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

    sessions.delete(sessionId);

    return createSuccessResponse({
      message: "Session deleted successfully",
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error deleting session:", error);
    return createErrorResponse({
      status: 500,
      message: "Failed to delete session",
      code: "server_error",
    });
  }
});
