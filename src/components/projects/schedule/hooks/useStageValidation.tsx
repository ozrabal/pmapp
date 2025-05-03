import { useState, useCallback } from "react";
import type { ScheduleStageViewModel } from "../types";

interface ValidationOptions {
  requireName?: boolean;
  checkDependencyCycles?: boolean;
}

interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Custom hook for validating schedule stage data
 */
export const useStageValidation = (allStages: ScheduleStageViewModel[], options: ValidationOptions = {}) => {
  const { requireName = true, checkDependencyCycles = true } = options;
  const [errors, setErrors] = useState<Record<string, string>>({});

  /**
   * Validate stage data before saving
   */
  const validateStage = useCallback(
    (stageData: Partial<ScheduleStageViewModel>, currentStageId?: string): ValidationResult => {
      const validationErrors: Record<string, string> = {};

      // Validate name
      if (requireName && (!stageData.name || stageData.name.trim() === "")) {
        validationErrors.name = "Nazwa etapu jest wymagana";
      }

      // Check for dependency cycles
      if (checkDependencyCycles && stageData.dependencies && stageData.dependencies.length > 0) {
        const hasCycle = checkForDependencyCycles(stageData.dependencies, currentStageId || "", allStages);

        if (hasCycle) {
          validationErrors.dependencies = "Wykryto cykliczne zależności. Proszę poprawić wybrane zależności.";
        }
      }

      setErrors(validationErrors);

      return {
        isValid: Object.keys(validationErrors).length === 0,
        errors: validationErrors,
      };
    },
    [allStages, requireName, checkDependencyCycles]
  );

  /**
   * Check if adding these dependencies would create a cycle
   */
  const checkForDependencyCycles = (
    dependencyIds: string[],
    stageId: string,
    stages: ScheduleStageViewModel[]
  ): boolean => {
    // Map of stage IDs to their dependencies
    const dependencyMap: Record<string, string[]> = {};

    // Build dependency map from current stages
    stages.forEach((stage) => {
      dependencyMap[stage.id] = [...stage.dependencies];
    });

    // Add or update the current stage being validated
    dependencyMap[stageId] = [...dependencyIds];

    // For each stage, check if we can reach that stage again by following dependencies
    const visited = new Set<string>();
    const path = new Set<string>();

    const hasCycleDFS = (currentId: string): boolean => {
      // If we've already determined this node doesn't lead to cycles, skip
      if (visited.has(currentId)) return false;

      // If we find this node in our current path, we have a cycle
      if (path.has(currentId)) return true;

      // Add to current path
      path.add(currentId);

      // Check all dependencies
      const dependencies = dependencyMap[currentId] || [];
      for (const dependencyId of dependencies) {
        if (hasCycleDFS(dependencyId)) {
          return true;
        }
      }

      // No cycles found from this node
      path.delete(currentId);
      visited.add(currentId);
      return false;
    };

    // Check for cycles starting from our stage
    return hasCycleDFS(stageId);
  };

  return {
    errors,
    validateStage,
    checkForDependencyCycles,
  };
};
