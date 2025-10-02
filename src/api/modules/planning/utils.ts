import { type PlanningStep, STEP_ORDER } from "./consts";

export function getCurrentStepIndex(step: PlanningStep): number {
  return STEP_ORDER.indexOf(step);
}
