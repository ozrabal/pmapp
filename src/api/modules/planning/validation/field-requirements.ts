import type { ProjectData } from "@/api/types/chat";
import { PlanningStep } from "../consts";

/**
 * Field importance levels
 */
export enum FieldImportance {
  CRITICAL = "critical", // Must have, blocks progression
  IMPORTANT = "important", // Should have, warning if missing
  OPTIONAL = "optional", // Nice to have, no warning
}

/**
 * Dynamic field requirement definition
 */
export interface FieldRequirement {
  name: keyof ProjectData;
  importance: FieldImportance;
  condition?: (data: ProjectData) => boolean; // Conditional requirement
  minLength?: number;
  minItems?: number; // For arrays
  validator?: (value: unknown) => boolean;
}

/**
 * Step-specific field requirements
 */
export interface StepFieldRequirements {
  step: PlanningStep;
  fields: FieldRequirement[];
}

/**
 * Manages dynamic field requirements based on context
 */
export class FieldRequirementsManager {
  private requirements: Map<PlanningStep, FieldRequirement[]> = new Map();

  constructor() {
    this.initializeRequirements();
  }

  /**
   * Initialize default requirements for each step
   */
  private initializeRequirements(): void {
    // Introduction step
    this.requirements.set(PlanningStep.INTRODUCTION, [
      {
        name: "applicationGeneralDescription",
        importance: FieldImportance.CRITICAL,
        minLength: 20,
      },
    ]);

    // Project type step
    this.requirements.set(PlanningStep.PROJECT_TYPE, [
      {
        name: "projectType",
        importance: FieldImportance.CRITICAL,
        minLength: 3,
      },
      {
        name: "projectName",
        importance: FieldImportance.CRITICAL,
        minLength: 2,
      },
      {
        name: "description",
        importance: FieldImportance.CRITICAL,
        minLength: 20,
      },
    ]);

    // Core features step
    this.requirements.set(PlanningStep.CORE_FEATURES, [
      {
        name: "coreFeatures",
        importance: FieldImportance.CRITICAL,
        minItems: 3,
        validator: (value: unknown) => Array.isArray(value) && value.length >= 3,
      },
    ]);

    // Technical requirements step
    this.requirements.set(PlanningStep.TECHNICAL_REQUIREMENTS, [
      {
        name: "technicalStack",
        importance: FieldImportance.IMPORTANT,
        minItems: 1,
        validator: (value: unknown) => Array.isArray(value) && value.length >= 1,
      },
    ]);

    // User personas step
    this.requirements.set(PlanningStep.USER_PERSONAS, [
      {
        name: "userPersonas",
        importance: FieldImportance.IMPORTANT,
        minItems: 1,
        validator: (value: unknown) => Array.isArray(value) && value.length >= 1,
      },
    ]);

    // UI/UX preferences step
    this.requirements.set(PlanningStep.UI_UX_PREFERENCES, [
      {
        name: "uiUxRequirements",
        importance: FieldImportance.IMPORTANT,
        minLength: 10,
      },
    ]);

    // Timeline and budget step
    this.requirements.set(PlanningStep.TIMELINE_BUDGET, [
      {
        name: "timeline",
        importance: FieldImportance.IMPORTANT,
        minLength: 5,
      },
      {
        name: "budget",
        importance: FieldImportance.IMPORTANT,
        minLength: 3,
      },
    ]);

    // Integration requirements step
    this.requirements.set(PlanningStep.INTEGRATION_REQUIREMENTS, [
      {
        name: "integrations",
        importance: FieldImportance.OPTIONAL,
        minItems: 0,
        // Allow empty array for this step
        validator: (value: unknown) => Array.isArray(value),
      },
    ]);

    // Validation and completion steps have no specific requirements
    this.requirements.set(PlanningStep.VALIDATION, []);
    this.requirements.set(PlanningStep.COMPLETION, []);
  }

  /**
   * Get requirements for a specific step
   */
  getRequirementsForStep(step: PlanningStep, data: ProjectData): FieldRequirement[] {
    const stepRequirements = this.requirements.get(step) || [];

    // Filter based on conditional requirements
    return stepRequirements.filter((req) => {
      if (req.condition) {
        return req.condition(data);
      }
      return true;
    });
  }

  /**
   * Get only required field names (CRITICAL importance)
   */
  getRequiredFieldNames(step: PlanningStep, data: ProjectData): string[] {
    const requirements = this.getRequirementsForStep(step, data);
    return requirements.filter((req) => req.importance === FieldImportance.CRITICAL).map((req) => String(req.name));
  }

  /**
   * Get all field names for a step (any importance)
   */
  getAllFieldNames(step: PlanningStep, data: ProjectData): string[] {
    const requirements = this.getRequirementsForStep(step, data);
    return requirements.map((req) => String(req.name));
  }

  /**
   * Get field importance
   */
  getFieldImportance(step: PlanningStep, fieldName: string): FieldImportance {
    const requirements = this.requirements.get(step) || [];
    const requirement = requirements.find((req) => String(req.name) === fieldName);
    return requirement?.importance || FieldImportance.OPTIONAL;
  }

  /**
   * Count total fields for a step (for progress calculation)
   */
  getTotalFieldCount(step: PlanningStep, data: ProjectData): number {
    const requirements = this.getRequirementsForStep(step, data);
    // Only count CRITICAL and IMPORTANT fields for progress
    return requirements.filter(
      (req) => req.importance === FieldImportance.CRITICAL || req.importance === FieldImportance.IMPORTANT
    ).length;
  }

  /**
   * Validate field against its requirements
   */
  validateField(step: PlanningStep, fieldName: string, value: unknown): boolean {
    const requirements = this.requirements.get(step) || [];
    const requirement = requirements.find((req) => String(req.name) === fieldName);

    if (!requirement) {
      return true; // No requirement, considered valid
    }

    // Check custom validator if exists
    if (requirement.validator) {
      return requirement.validator(value);
    }

    // Check minLength for strings
    if (requirement.minLength && typeof value === "string") {
      return value.length >= requirement.minLength;
    }

    // Check minItems for arrays
    if (requirement.minItems !== undefined && Array.isArray(value)) {
      return value.length >= requirement.minItems;
    }

    return true;
  }
}

// Export singleton instance
export const fieldRequirementsManager = new FieldRequirementsManager();
