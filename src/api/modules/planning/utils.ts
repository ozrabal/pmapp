import {
  type ChatSession,
  type ProjectData,
  type StepPrompt,
  type StepPrompts,
  type ValidationResult,
} from "@/api/types/chat";
import { createAIService, type TextGenerationResponse } from "@/lib/services/ai";
import { AiModel, PlanningStep, PROJEST_SPECIFICATION_PROMPT, STEP_ORDER, STEP_PROMPTS } from "./consts";
import { fieldRequirementsManager } from "./validation/field-requirements";
import { validationOrchestrator } from "./validation/orchestrator";
import type { ValidationContext } from "./validation/types";

export function getCurrentStepIndex(step: PlanningStep): number {
  return STEP_ORDER.indexOf(step);
}

export async function extractMessageData(
  message: string,
  step: PlanningStep
): Promise<StepPrompt["extractDataSchema"] | null | string> {
  const aiService = createAIService(process.env.OPENAI_API_KEY || "");
  const prompt = STEP_PROMPTS[step]?.extractData;
  if (!prompt) {
    return null;
  }
  //TODO what if there no schema defined?

  if (STEP_PROMPTS[step].extractDataSchema) {
    const result = await aiService.generateObjectWithSchema(
      {
        prompt: `${prompt} <message>${message}</message>`,
        model: AiModel.GPT_4O_MINI,
        temperature: 0.5,
      },
      STEP_PROMPTS[step].extractDataSchema
    );

    return result as unknown as StepPrompt["extractDataSchema"] | null;
  }

  const result = await aiService.generateText({
    prompt: `${prompt} <message>${message}</message>`,
    model: AiModel.GPT_4O_MINI,
    temperature: 0.5,
  });

  if (result.success && result.data) {
    return result.data.text;
  }

  return null;
}

/**
 * Enhanced validation function using the new multi-layer system
 * Maintains backward compatibility with the old ValidationResult interface
 */
export async function validateStepData(
  data: ProjectData,
  requiredFields: StepPrompt["requiredFields"],
  step: PlanningStep,
  context?: Partial<ValidationContext>
): Promise<ValidationResult> {
  // Get dynamic required fields from FieldRequirementsManager
  const dynamicRequiredFields = fieldRequirementsManager.getRequiredFieldNames(step, data);
  const allRequiredFields = requiredFields || dynamicRequiredFields;

  // Initialize orchestrator with default layers if not already done
  if (validationOrchestrator["layers"].length === 0) {
    validationOrchestrator.registerDefaultLayers();
  }

  // Build validation context
  const validationContext: ValidationContext = {
    step,
    previousData: data,
    attemptCount: context?.attemptCount || 1,
    userProfile: context?.userProfile,
  };

  // Execute enhanced validation
  const enhancedResult = await validationOrchestrator.validate(data, allRequiredFields, validationContext);

  // Calculate completion percentage based on dynamic field requirements
  const totalFields = fieldRequirementsManager.getTotalFieldCount(step, data);
  const errorCount = enhancedResult.issues.filter((i) => i.severity === "error").length;
  const completedFields = Math.max(0, totalFields - errorCount);
  const completionPercentage = totalFields > 0 ? (completedFields / totalFields) * 100 : 100;

  // Convert to backward-compatible format
  const missing: string[] = [];
  const incomplete: string[] = [];

  enhancedResult.issues.forEach((issue) => {
    if (issue.severity === "error") {
      if (issue.message.includes("missing")) {
        missing.push(issue.field);
      } else {
        incomplete.push(issue.field);
      }
    }
  });

  return {
    isComplete: enhancedResult.isComplete,
    missingFields: missing,
    incompleteFields: incomplete,
    completionPercentage,
    // Add enhanced fields
    confidence: enhancedResult.confidence,
    issues: enhancedResult.issues,
    suggestions: enhancedResult.suggestions,
  };
}

/**
 * Legacy validation function for backward compatibility
 * Use validateStepData instead
 */
export function validateStepDataSync(
  data: ProjectData,
  requiredFields: StepPrompt["requiredFields"]
): ValidationResult {
  const missing: string[] = [];
  const incomplete: string[] = [];

  requiredFields?.forEach((field) => {
    if (data[field] === undefined || data[field] === null) {
      missing.push(field);
    } else if (typeof data[field] === "string" && data[field].trim() === "") {
      incomplete.push(field);
    }
  });

  const totalFields = requiredFields?.length || 0;
  const completedFields = totalFields - missing.length - incomplete.length;

  return {
    isComplete: missing.length === 0 && incomplete.length === 0,
    missingFields: missing,
    incompleteFields: incomplete,
    completionPercentage: totalFields > 0 ? (completedFields / totalFields) * 100 : 0,
  };
}

export function getNextStep(step: PlanningStep): PlanningStep {
  const currentIndex = getCurrentStepIndex(step);
  if (currentIndex === -1 || currentIndex === STEP_ORDER.length - 1) {
    return STEP_ORDER[STEP_ORDER.length - 1];
  }
  return STEP_ORDER[currentIndex + 1];
}

export async function generateProjectSpecification(data: ProjectData): Promise<TextGenerationResponse | null> {
  try {
    const aiService = createAIService(process.env.OPENAI_API_KEY);
    const result = await aiService.generateText({
      prompt: `${PROJEST_SPECIFICATION_PROMPT.prompt} ${JSON.stringify(data)}`,
      model: PROJEST_SPECIFICATION_PROMPT.model,
      temperature: PROJEST_SPECIFICATION_PROMPT.temperature,
    });
    if (!result.success || !result.data) {
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

export async function generateAiResponse(
  session: ChatSession,
  message: string
): Promise<TextGenerationResponse<string>> {
  const systemPrompt = `You are a helpful project planning assistant. Current step: ${session.currentStep}. 
  ${STEP_PROMPTS[session.currentStep]?.message || ""}
  
  Context of collected data: ${JSON.stringify(session.collectedData)}
  
  User's latest message: "${message}"
  
  Provide a helpful, conversational response that guides the user through this step.`;

  const aiService = createAIService(process.env.OPENAI_API_KEY);
  const result = await aiService.generateText({
    messages: [
      {
        role: "user",
        content: systemPrompt,
      },
    ],
    model: AiModel.GPT_4O_MINI,
    temperature: 0.5,
  });

  if (!result.success || !result.data) {
    return { text: "" } as TextGenerationResponse<string>;
  }

  return result.data;
}

export function calculateProgress(session: ChatSession, stepPrompts: StepPrompts): number {
  let totalCompletion = 0;
  let validatedSteps = 0;

  for (const step of STEP_ORDER) {
    if (step === PlanningStep.INTRODUCTION || step === PlanningStep.COMPLETION) continue;

    const prompt = stepPrompts[step];
    if (prompt.requiredFields) {
      const validation = validateStepDataSync(session.collectedData, prompt.requiredFields);
      totalCompletion += validation.completionPercentage;
      validatedSteps++;
    }
  }

  const progress = validatedSteps > 0 ? totalCompletion / validatedSteps : 0;

  return Math.round(progress);
}

// Re-export validation utilities
export { fieldRequirementsManager, validationOrchestrator };