import type { ProjectData } from "@/api/types/chat";
import {
  ValidationLayerType,
  ValidationSeverity,
  type EnhancedValidationResult,
  type ValidationContext,
  type ValidationIssue,
  type ValidationLayer,
} from "./types";

/**
 * Orchestrates multiple validation layers
 */
export class ValidationOrchestrator {
  private layers: ValidationLayer[] = [];

  constructor() {
    // Layers will be registered by the caller or via registerDefaultLayers
  }

  /**
   * Register default validation layers
   */
  registerDefaultLayers(): void {
    // Import layers dynamically to avoid circular dependencies
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { PresenceValidationLayer } = require("./layers/presence");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { SemanticValidationLayer } = require("./layers/semantic");

    this.layers = [new PresenceValidationLayer(), new SemanticValidationLayer()];
    this.layers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Add custom validation layer
   */
  registerLayer(layer: ValidationLayer): void {
    this.layers.push(layer);
    this.layers.sort((a, b) => a.priority - b.priority);
  }

  /**
   * Execute all validation layers
   */
  async validate(
    data: ProjectData,
    requiredFields: string[],
    context: ValidationContext
  ): Promise<EnhancedValidationResult> {
    const startTime = Date.now();
    const allIssues: ValidationIssue[] = [];
    const allSuggestions: string[] = [];
    const layersExecuted: ValidationLayerType[] = [];
    let totalConfidence = 0;
    let confidenceCount = 0;
    let aiCallCount = 0;

    // Execute each layer in priority order
    for (const layer of this.layers) {
      try {
        const result = await layer.validate(data, requiredFields, context);

        layersExecuted.push(layer.name);
        allIssues.push(...result.issues);
        allSuggestions.push(...result.suggestions);

        // Track confidence from layers that provide it
        if (result.confidence !== undefined) {
          totalConfidence += result.confidence;
          confidenceCount++;
        }

        // Count AI calls (semantic layer will increment this)
        if (layer.name === ValidationLayerType.SEMANTIC) {
          aiCallCount++;
        }
      } catch (error) {
        // Log error but continue with other layers
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        allIssues.push({
          field: "system",
          layer: layer.name,
          severity: ValidationSeverity.WARNING,
          message: `Validation layer ${layer.name} failed: ${errorMessage}`,
        });
      }
    }

    const executionTimeMs = Date.now() - startTime;

    // Calculate overall confidence
    const confidence = confidenceCount > 0 ? totalConfidence / confidenceCount : 50;

    // Check if validation is complete (no critical errors)
    const isComplete = !this.hasCriticalErrors(allIssues);

    // Check if validation is acceptable (confidence threshold met)
    const isAcceptable = confidence >= 60 && !this.hasCriticalErrors(allIssues);

    // Generate clarification questions from error issues
    const requiredClarifications = this.generateClarifications(allIssues);

    // Deduplicate suggestions
    const uniqueSuggestions = [...new Set(allSuggestions)];

    return {
      isComplete,
      isAcceptable,
      confidence,
      issues: allIssues,
      suggestions: uniqueSuggestions,
      requiredClarifications,
      metadata: {
        layersExecuted,
        executionTimeMs,
        aiCallCount,
      },
    };
  }

  /**
   * Check if issues contain critical errors
   */
  private hasCriticalErrors(issues: ValidationIssue[]): boolean {
    return issues.some((issue) => issue.severity === ValidationSeverity.ERROR);
  }

  /**
   * Generate user-facing clarification questions
   */
  private generateClarifications(issues: ValidationIssue[]): string[] {
    const errorIssues = issues.filter((i) => i.severity === ValidationSeverity.ERROR);

    return errorIssues
      .map((issue) => {
        if (issue.suggestion) {
          return issue.suggestion;
        }
        return `Please provide more information about: ${issue.field}`;
      })
      .filter((clarification, index, self) => self.indexOf(clarification) === index); // Deduplicate
  }
}

// Export singleton instance
export const validationOrchestrator = new ValidationOrchestrator();
