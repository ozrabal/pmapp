import { STEP_ORDER, PlanningStep } from "./consts";
import type { ChatSession, StepValidators } from "@/api/types/chat";

export function getCurrentStepIndex(step: PlanningStep): number {
  return STEP_ORDER.indexOf(step);
}

export function calculateProgress(session: ChatSession, stepValidators: StepValidators): number {
  let totalCompletion = 0;
  let validatedSteps = 0;

  for (const step of STEP_ORDER) {
    if (step === PlanningStep.INTRODUCTION || step === PlanningStep.COMPLETION) continue;

    const validator = stepValidators[step];
    if (validator) {
      const validation = validator.validate(session.collectedData);
      totalCompletion += validation.completionPercentage;
      validatedSteps++;
    }
  }

  const progress = validatedSteps > 0 ? totalCompletion / validatedSteps : 0;

  return Math.round(progress);
}
