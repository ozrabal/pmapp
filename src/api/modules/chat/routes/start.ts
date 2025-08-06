import { type Context } from "hono";
import { createErrorResponse, createSuccessResponse } from "@/api/utils/response";
import { startSessionSchema } from "../schema";
import { generateSessionId } from "@/api/utils/session";
import type { ChatResponse, ChatSession } from "@/api/types/chat";
import { ChatActorRole, CompletionStatus, PlanningStep, STEP_ORDER, STEP_PROMPTS } from "../consts";
import { getCurrentStepIndex } from "../utils";
import { Hono } from "hono";
import { sessions } from "./index"; // Import the in-memory session store

const chatStartRoute = new Hono();

chatStartRoute.post("/start", async (c: Context) => {
  try {
    const body = await c.req.json();
    const parsedBody = startSessionSchema.safeParse(body);

    if (!parsedBody.success) {
      return createErrorResponse({
        status: 400,
        message: "Invalid request body",
        code: "invalid_request",
        details: parsedBody.error.format(),
      });
    }

    const { userId } = parsedBody.data;
    const sessionId = generateSessionId();

    const session: ChatSession = {
      id: sessionId,
      userId,
      currentStep: PlanningStep.INTRODUCTION,
      collectedData: {},
      conversationHistory: [
        {
          role: ChatActorRole.ASSISTANT,
          content: STEP_PROMPTS[PlanningStep.INTRODUCTION].message,
          timestamp: new Date(),
        },
      ],
      completionStatus: CompletionStatus.IN_PROGRESS,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Here you would typically save the session to a database
    sessions.set(sessionId, session);

    const chatResponse: ChatResponse = {
      sessionId,
      currentStep: PlanningStep.INTRODUCTION,
      message: STEP_PROMPTS[PlanningStep.INTRODUCTION].message,
      progress: {
        currentStep: getCurrentStepIndex(PlanningStep.INTRODUCTION) + 1,
        totalSteps: STEP_ORDER.length,
        completionPercentage: 0,
      },
      nextActions: [STEP_PROMPTS[PlanningStep.INTRODUCTION].nextAction],
      isComplete: false,
    };

    return createSuccessResponse(chatResponse);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error starting chat:", error);
    return createErrorResponse({
      status: 500,
      message: "Failed to start chat",
      code: "server_error",
    });
  }
});

export default chatStartRoute;
