import { STEP_ORDER, PlanningStep, PROJEST_SPECIFICATION_PROMPT } from "@/api/modules/chat/consts";
import type { ChatSession, ProjectData, StepPrompt, StepPrompts, ValidationResult } from "@/api/types/chat";
import { createAIService, type TextGenerationResponse } from "@/services/ai";
import { OPENAI_API_KEY } from "astro:env/server";

export function getCurrentStepIndex(step: PlanningStep): number {
  return STEP_ORDER.indexOf(step);
}

export function calculateProgress(session: ChatSession, stepPrompts: StepPrompts): number {
  let totalCompletion = 0;
  let validatedSteps = 0;

  for (const step of STEP_ORDER) {
    if (step === PlanningStep.INTRODUCTION || step === PlanningStep.COMPLETION) continue;

    const prompt = stepPrompts[step];
    if (prompt.requiredFields) {
      const validation = validateStepData(session.collectedData, prompt.requiredFields);
      totalCompletion += validation.completionPercentage;
      validatedSteps++;
    }
  }

  const progress = validatedSteps > 0 ? totalCompletion / validatedSteps : 0;

  return Math.round(progress);
}

export function validateStepData(data: ProjectData, requiredFields: StepPrompt["requiredFields"]): ValidationResult {
  const missing: string[] = [];
  const incomplete: string[] = [];

  requiredFields?.forEach((field) => {
    if (data[field] === undefined || data[field] === null) {
      missing.push(field);
    } else if (typeof data[field] === "string" && data[field].trim() === "") {
      incomplete.push(field);
    }
  });

  const totalFields = 3;
  const completedFields = totalFields - missing.length - incomplete.length;

  return {
    isComplete: missing.length === 0 && incomplete.length === 0,
    missingFields: missing,
    incompleteFields: incomplete,
    completionPercentage: (completedFields / totalFields) * 100,
  };
}

export async function generateProjectSpecification(data: ProjectData): Promise<TextGenerationResponse | null> {
  try {
    const aiService = createAIService(OPENAI_API_KEY);
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
