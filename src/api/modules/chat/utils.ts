import { STEP_ORDER, PlanningStep } from "./consts";
import type { ChatSession, ProjectData, StepPrompt, StepPrompts, ValidationResult } from "@/api/types/chat";

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
