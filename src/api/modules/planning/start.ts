import { Hono } from "hono";
import { z } from "zod";
import { zValidator } from "@/api/middlewares/validator.middleware";
import { generateSessionId } from "@/api/utils/session";
import { type ChatResponse, type ChatSession } from "@/api/types/chat";
import { createResponse } from "@/api/utils/response";
import { ChatActorRole, CompletionStatus, PlanningStep, STEP_ORDER, STEP_PROMPTS } from "./consts";
import { getCurrentStepIndex } from "./utils";
import { sessions } from ".";

export const startSessionSchema = z
  .object({
    userId: z.string().uuid(),
  })
  .strict();
const app = new Hono();

app.post("/start", zValidator("json", startSessionSchema), async (c) => {
  // const { sub: userId } = c.get("jwtPayload");

  const { userId } = c.req.valid("json");

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

  return createResponse(chatResponse);
});

export default app;
