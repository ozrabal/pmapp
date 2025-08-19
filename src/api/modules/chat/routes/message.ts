import { createErrorResponse, createSuccessResponse } from "@/api/utils/response";
import { Hono } from "hono";
import { messageSchema } from "@/api/modules/chat/schema";
import { sessions } from ".";
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
import type { ProjectData, ValidationResult } from "@/api/types/chat";

const chatMessageRoute = new Hono();

function isObject(item: unknown): item is Record<string, unknown> {
  return typeof item === "object" && item !== null && !Array.isArray(item);
}

export function deepMerge<T extends object, U extends object>(target: T, source: U): T & U {
  const result: T & U = { ...target } as T & U;

  for (const key in source) {
    const sourceValue = source[key];
    const targetValue = (target as Record<string, unknown>)[key];

    if (Array.isArray(targetValue) && Array.isArray(sourceValue)) {
      // Merge arrays without repetition
      result[key] = Array.from(new Set([...(targetValue as unknown[]), ...(sourceValue as unknown[])])) as (T &
        U)[typeof key];
    } else if (isObject(sourceValue) && isObject(targetValue)) {
      result[key] = deepMerge(targetValue as object, sourceValue as object) as (T & U)[typeof key];
    } else {
      result[key] = sourceValue as (T & U)[typeof key];
    }
  }

  return result;
}

export default chatMessageRoute.post("/message", async (c) => {
  try {
    const body = await c.req.json();
    const parsedBody = messageSchema.safeParse(body);

    if (!parsedBody.success) {
      return createErrorResponse({
        status: 400,
        message: "Invalid request body",
        code: "invalid_request",
        details: parsedBody.error.format(),
      });
    }

    const { id, message } = parsedBody.data;

    const session = sessions.get(id);

    if (!session) {
      return createErrorResponse({
        status: 404,
        message: "Session not found",
        code: "not_found",
      });
    }

    if (session.completionStatus === CompletionStatus.COMPLETED) {
      return createErrorResponse({
        status: 400,
        message: "Session already completed",
        code: "invalid_request",
      });
    }

    session.conversationHistory.push({
      role: "user",
      content: message,
      timestamp: new Date(),
    });

    if (session.completionStatus !== CompletionStatus.INTRODUCTION) {
      const extractedData = await extractMessageData(message, session.currentStep);
      if (extractedData) {
        console.log("Extracted data:");
        const exData = extractedData as ProjectData;
        session.collectedData = deepMerge(session.collectedData, exData);
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
      session.currentStep = nextStep;

      if (nextStep === PlanningStep.COMPLETION) {
        // Generate final project specification
        const specification = generateProjectSpecification(session.collectedData);
        aiResponse = `Great! I have all the information needed. Here's your comprehensive project specification:\n\n${specification}`;
        session.completionStatus = CompletionStatus.COMPLETED;
      } else {
        aiResponse = STEP_PROMPTS[nextStep]?.message;
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

    session.conversationHistory.push({
      role: "assistant",
      content: aiResponse,
      timestamp: new Date(),
    });
    session.updatedAt = new Date();

    const overallProgress = calculateProgress(session, STEP_PROMPTS);

    return createSuccessResponse({
      message: aiResponse,
      sessionId: id,
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
    });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Error handling chat message:", error);
    return createErrorResponse({
      status: 500,
      message: "Failed to process chat message",
      code: "server_error",
    });
  }
});
