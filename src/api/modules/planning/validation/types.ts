import type { ProjectData } from "@/api/types/chat";
import type { PlanningStep } from "../consts";

/**
 * Severity levels for validation issues
 */
export enum ValidationSeverity {
  ERROR = "error", // Blocks progression
  WARNING = "warning", // Should be addressed
  INFO = "info", // Nice-to-have
}

/**
 * Types of validation checks
 */
export enum ValidationLayerType {
  PRESENCE = "presence", // Field exists and non-empty
  SEMANTIC = "semantic", // Content is meaningful
  COMPLETENESS = "completeness", // Information is sufficient
  CONSISTENCY = "consistency", // Data is coherent
}

/**
 * Individual validation issue
 */
export interface ValidationIssue {
  field: string;
  layer: ValidationLayerType;
  severity: ValidationSeverity;
  message: string;
  suggestion?: string;
  currentValue?: unknown;
}

/**
 * Context for validation
 */
export interface ValidationContext {
  step: PlanningStep;
  previousData: ProjectData;
  attemptCount: number;
  userProfile?: {
    expertiseLevel?: "beginner" | "intermediate" | "expert";
    preferredResponseStyle?: "detailed" | "concise";
  };
}

/**
 * Enhanced validation result with confidence and structured issues
 */
export interface EnhancedValidationResult {
  isComplete: boolean; // All required fields present and valid
  isAcceptable: boolean; // Quality threshold met (may have warnings)
  confidence: number; // 0-100 confidence in validation
  issues: ValidationIssue[]; // All identified issues
  suggestions: string[]; // User-facing improvement suggestions
  requiredClarifications: string[]; // Specific questions to ask user
  metadata: {
    layersExecuted: ValidationLayerType[];
    executionTimeMs: number;
    aiCallCount: number;
  };
}

/**
 * Abstract validation layer interface
 */
export interface ValidationLayer {
  name: ValidationLayerType;
  priority: number; // Execution order (lower = earlier)
  validate(data: ProjectData, requiredFields: string[], context?: ValidationContext): Promise<ValidationLayerResult>;
}

/**
 * Result from individual validation layer
 */
export interface ValidationLayerResult {
  passed: boolean;
  confidence: number;
  issues: ValidationIssue[];
  suggestions: string[];
}
