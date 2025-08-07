import { type Context } from "hono";
import { createErrorResponse, createSuccessResponse } from "@/api/utils/response";
import { Hono } from "hono";
import { sessionSchema } from "../schema";
import { sessions } from "./index"; // Import the in-memory session store
import { calculateProgress, getCurrentStepIndex } from "../utils";
import { STEP_ORDER, STEP_PROMPTS } from "../consts";

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

    const overallProgress = calculateProgress(session, STEP_PROMPTS);

    return createSuccessResponse({
      sessionId: session.id,
      userId: session.userId,
      currentStep: session.currentStep,
      collectedData: session.collectedData,
      conversationHistory: session.conversationHistory,
      completionStatus: session.completionStatus,
      progress: {
        currentStep: getCurrentStepIndex(session.currentStep) + 1,
        totalSteps: STEP_ORDER.length,
        completionPercentage: Math.round(overallProgress),
      },
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
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
