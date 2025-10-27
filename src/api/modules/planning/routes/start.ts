import { Hono } from "hono";
import { type ChatResponse } from "@/api/types/chat";
import { createResponse } from "@/api/utils/response";
import { getCurrentStepIndex } from "@/api/modules/planning/utils";
import { chatSessionService } from "@/lib/services/chatSession.service";
import { ChatActorRole, CompletionStatus, PlanningStep, STEP_ORDER, STEP_PROMPTS } from "../consts";

const app = new Hono();

app.post("/", async (c) => {
  const { sub: userId } = c.get("jwtPayload");

  const session = await chatSessionService.createSession({
    userId,
    currentStep: PlanningStep.INTRODUCTION,
    collectedData: {},
    completionStatus: CompletionStatus.IN_PROGRESS,
    initialMessage: {
      role: ChatActorRole.ASSISTANT,
      content: STEP_PROMPTS[PlanningStep.INTRODUCTION].message,
      timestamp: new Date(),
    },
  });

  const chatResponse: ChatResponse = {
    sessionId: session.id,
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
