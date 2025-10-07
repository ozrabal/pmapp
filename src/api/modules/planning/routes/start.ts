import { Hono } from "hono";
import { generateSessionId } from "@/api/utils/session";
import { type ChatResponse, type ChatSession } from "@/api/types/chat";
import { createResponse } from "@/api/utils/response";
import { getCurrentStepIndex } from "@/api/modules/planning/utils";
import { ChatActorRole, CompletionStatus, PlanningStep, STEP_ORDER, STEP_PROMPTS } from "../consts";
import { sessions } from "..";

const app = new Hono();

app.post("/", async (c) => {
  const { sub: userId } = c.get("jwtPayload");

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
