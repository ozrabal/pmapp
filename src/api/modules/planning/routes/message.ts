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
      console.log("Extracted data:", extractedData);
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

  // Confidence threshold for step advancement
  const CONFIDENCE_THRESHOLD = 70;

  // Determine if we should validate and potentially advance
  let shouldAdvance = false;
  let validation: ValidationResult | null = null;

  if (session.currentStep === PlanningStep.INTRODUCTION) {
    // Always advance from introduction after any message
    shouldAdvance = true;
  } else if (session.currentStep === PlanningStep.COMPLETION) {
    // Already at completion, no advancement
    shouldAdvance = false;
  } else {
    // Validate current step data with enhanced validation
    validation = await validateStepData(
      session.collectedData,
      STEP_PROMPTS[session.currentStep]?.requiredFields || [],
      session.currentStep
    );

    // Advance only if validation is complete AND confidence meets threshold
    shouldAdvance = validation.isComplete && (validation.confidence || 0) >= CONFIDENCE_THRESHOLD;
  }

  let aiResponse = "";

  if (shouldAdvance) {
    // Advance to next step
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
    // Stay on current step, request clarification
    if (validation && validation.suggestions && validation.suggestions.length > 0) {
      // Use AI-generated suggestions from semantic validation
      aiResponse = "Thank you for the information! To create a better plan, I need some clarification:\n\n";
      aiResponse += validation.suggestions.join("\n\n");
    } else if (validation && (validation.missingFields.length > 0 || validation.incompleteFields.length > 0)) {
      // Fallback to field-based messages
      const missingFieldsText =
        validation.missingFields.length > 0
          ? `I still need the following information:\n- ${validation.missingFields.join("\n- ")}`
          : "";
      const incompleteFieldsText =
        validation.incompleteFields.length > 0
          ? `Please provide more detail for:\n- ${validation.incompleteFields.join("\n- ")}`
          : "";

      aiResponse = "Thank you! To complete this step, I need a bit more information.\n\n";
      if (missingFieldsText) {
        aiResponse += `${missingFieldsText}\n\n`;
      }
      if (incompleteFieldsText) {
        aiResponse += incompleteFieldsText;
      }
    } else {
      // Generate conversational response
      const response = await generateAiResponse(session, message);
      if (response.text) {
        aiResponse = response.text;
      }
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
