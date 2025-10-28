import { Hono } from "hono";
import { zValidator } from "@/api/middlewares/validator.middleware";
import { createErrorResponse, createResponse } from "@/api/utils/response";
import { type ValidationResult, type ProjectData } from "@/api/types/chat";
import { deepMerge } from "@/lib/utils";
import { chatSessionService } from "@/lib/services/chatSession.service";
import { messageSchema } from "../schemas";
import { CompletionStatus, PlanningStep, STEP_ORDER, STEP_PROMPTS } from "../consts";
import {
  calculateProgress,
  extractMessageData,
  generateAiResponse,
  generateProjectSpecification,
  getCurrentStepIndex,
  getNextStep,
  validateStepData,
} from "../utils";

const app = new Hono();

export default app.post("/", zValidator("json", messageSchema), async (c) => {
  // const { sub: userId } = c.get("jwtPayload");
  const { sessionId, message } = c.req.valid("json");

  // @TODO: check if session.userId === userId to ensure the user owns the session
  const session = await chatSessionService.getSessionById(sessionId);

  if (!session) {
    return createResponse({ error: "Session not found" }, 404);
  }

  if (session.completionStatus === CompletionStatus.COMPLETED) {
    return createErrorResponse({
      status: 400,
      message: "Session already completed",
      code: "invalid_request",
    });
  }

  // Add user message to the session
  await chatSessionService.addMessage({
    sessionId,
    role: "user",
    content: message,
  });

  if (session.completionStatus !== CompletionStatus.INTRODUCTION) {
    const extractedData = await extractMessageData(message, session.currentStep);
    if (extractedData) {
      // eslint-disable-next-line no-console
      console.log("Extracted data:");
      const exData = extractedData as ProjectData;
      const updatedCollectedData = deepMerge(session.collectedData, exData);

      // Update session with new collected data
      await chatSessionService.updateSession(sessionId, {
        collectedData: updatedCollectedData,
      });

      // Update local session object for subsequent operations
      session.collectedData = updatedCollectedData;
    }
  }

  let validation: ValidationResult = {
    isComplete: true,
    missingFields: [],
    incompleteFields: [],
    completionPercentage: 100,
  };

  if (session.currentStep !== PlanningStep.INTRODUCTION || validation.isComplete) {
    validation = validateStepData(session.collectedData, STEP_PROMPTS[session.currentStep]?.requiredFields || []);
  }

  let aiResponse = "";
  // Check if we should advance to next step
  if (session.currentStep !== PlanningStep.INTRODUCTION || validation.isComplete) {
    const nextStep = getNextStep(session.currentStep);

    if (nextStep === PlanningStep.COMPLETION) {
      // Generate final project specification
      const specification = generateProjectSpecification(session.collectedData);
      aiResponse = `Great! I have all the information needed. Here's your comprehensive project specification:\n\n${specification}`;

      // Update session to completion
      await chatSessionService.updateSession(sessionId, {
        currentStep: nextStep,
        completionStatus: CompletionStatus.COMPLETED,
      });

      // Update local session object for subsequent operations
      session.currentStep = nextStep;
      session.completionStatus = CompletionStatus.COMPLETED;
    } else {
      aiResponse = STEP_PROMPTS[nextStep]?.message;

      // Update session with new step
      await chatSessionService.updateSession(sessionId, {
        currentStep: nextStep,
      });

      // Update local session object for subsequent operations
      session.currentStep = nextStep;
    }
  } else {
    // Generate follow-up questions for incomplete step
    const missingFieldsText =
      validation.missingFields.length > 0
        ? `I still need the following information to complete this step:\n- ${validation.missingFields.join("\n- ")}`
        : "You're almost there! Just a bit more information needed.";
    const incompleteFieldsText =
      validation.incompleteFields.length > 0
        ? `I still need the following information to complete this step:\n- ${validation.incompleteFields.join("\n- ")}`
        : "You're almost there! Just a bit more information needed.";

    const response = await generateAiResponse(session, aiResponse);
    if (response.text) {
      aiResponse = response.text;
    }

    if (missingFieldsText || incompleteFieldsText) {
      aiResponse += `\n\n${missingFieldsText}\n\n${incompleteFieldsText}`;
    }
  }

  // Add AI response to the session
  await chatSessionService.addMessage({
    sessionId,
    role: "assistant",
    content: aiResponse,
  });

  const overallProgress = calculateProgress(session, STEP_PROMPTS);

  const chatResponse = {
    message: aiResponse,
    sessionId,
    currentStep: session.currentStep,
    progress: {
      currentStep: getCurrentStepIndex(session.currentStep) + 1,
      totalSteps: STEP_ORDER.length,
      completionPercentage: overallProgress,
    },
    nextActions:
      session.currentStep === PlanningStep.COMPLETION
        ? ["Session completed"]
        : ["Continue providing the requested information"],
    isComplete: session.completionStatus === "completed",
    projectData: session.completionStatus === "completed" ? session.collectedData : undefined,
  };

  return createResponse(chatResponse);
});
