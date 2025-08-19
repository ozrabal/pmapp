import {
  STEP_ORDER,
  PlanningStep,
  PROJEST_SPECIFICATION_PROMPT,
  STEP_PROMPTS,
  AiModel,
} from "@/api/modules/chat/consts";
import type { ChatSession, ProjectData, StepPrompt, StepPrompts, ValidationResult } from "@/api/types/chat";
import { createAIService, type TextGenerationResponse } from "@/services/ai";
import { OPENAI_API_KEY } from "astro:env/server";

export function getCurrentStepIndex(step: PlanningStep): number {
  return STEP_ORDER.indexOf(step);
}

export function getNextStep(step: PlanningStep): PlanningStep {
  const currentIndex = getCurrentStepIndex(step);
  if (currentIndex === -1 || currentIndex === STEP_ORDER.length - 1) {
    return STEP_ORDER[STEP_ORDER.length - 1];
  }
  return STEP_ORDER[currentIndex + 1];
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

export async function extractMessageData(
  message: string,
  step: PlanningStep
): Promise<StepPrompt["extractDataSchema"] | null | string> {
  const aiService = createAIService(OPENAI_API_KEY);
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

export async function generateAiResponse(
  session: ChatSession,
  message: string
): Promise<TextGenerationResponse<string>> {
  const systemPrompt = `You are a helpful project planning assistant. Current step: ${session.currentStep}. 
  ${STEP_PROMPTS[session.currentStep]?.message || ""}
  
  Context of collected data: ${JSON.stringify(session.collectedData)}
  
  User's latest message: "${message}"
  
  Provide a helpful, conversational response that guides the user through this step.`;

  const aiService = createAIService(OPENAI_API_KEY);
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
