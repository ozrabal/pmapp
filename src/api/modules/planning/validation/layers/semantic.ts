import { z } from "zod";
import type { ProjectData } from "@/api/types/chat";
import { createAIService } from "@/lib/services/ai";
import { AiModel } from "../../consts";
import {
  ValidationLayerType,
  ValidationSeverity,
  type ValidationContext,
  type ValidationIssue,
  type ValidationLayer,
  type ValidationLayerResult,
} from "../types";

/**
 * AI-powered semantic validation of content quality
 */
export class SemanticValidationLayer implements ValidationLayer {
  name: ValidationLayerType = ValidationLayerType.SEMANTIC;
  priority = 2; // Run after presence validation

  private aiService = createAIService(process.env.OPENAI_API_KEY);

  async validate(
    data: ProjectData,
    requiredFields: string[],
    context: ValidationContext
  ): Promise<ValidationLayerResult> {
    const issues: ValidationIssue[] = [];
    const fieldScores: number[] = [];

    // Only validate fields that have values (presence layer already checked)
    const fieldsToValidate = requiredFields.filter((field) => {
      const value = data[field as keyof ProjectData];
      return value !== undefined && value !== null && value !== "";
    });

    if (fieldsToValidate.length === 0) {
      // No fields to validate semantically
      return {
        passed: true,
        confidence: 100,
        issues: [],
        suggestions: [],
      };
    }

    // Validate each field
    for (const field of fieldsToValidate) {
      const value = data[field as keyof ProjectData];
      const result = await this.validateField(field, value, context);

      fieldScores.push(result.qualityScore);
      issues.push(...result.fieldIssues);
    }

    // Calculate average quality score
    const averageQuality =
      fieldScores.length > 0 ? fieldScores.reduce((sum, score) => sum + score, 0) / fieldScores.length : 50;

    const passed = issues.filter((i) => i.severity === ValidationSeverity.ERROR).length === 0;
    const suggestions = this.generateSuggestions(issues, averageQuality);

    return {
      passed,
      confidence: averageQuality,
      issues,
      suggestions,
    };
  }

  /**
   * Validate individual field with AI
   */
  private async validateField(
    fieldName: string,
    value: unknown,
    context: ValidationContext
  ): Promise<{ qualityScore: number; fieldIssues: ValidationIssue[] }> {
    const issues: ValidationIssue[] = [];
    const valueStr = this.valueToString(value);

    // Skip very short responses (likely need more detail)
    if (valueStr.length < 10) {
      issues.push({
        field: fieldName,
        layer: ValidationLayerType.SEMANTIC,
        severity: ValidationSeverity.WARNING,
        message: `${this.humanizeFieldName(fieldName)} seems too brief`,
        suggestion: `Please provide more detail about ${this.humanizeFieldName(fieldName).toLowerCase()}`,
        currentValue: value,
      });
      return { qualityScore: 40, fieldIssues: issues };
    }

    const prompt = `Analyze the following response for a project planning step.

Field: ${fieldName}
Planning Step: ${context.step}
User Response: "${valueStr}"

Evaluate the response on these criteria:
1. Completeness: Does it fully answer what's being asked?
2. Relevance: Is it relevant to the field and planning step?
3. Clarity: Is it clear and understandable?
4. Actionability: Can this information be used for project planning?

Provide a quality score (0-100) and identify specific issues.`;

    const schema = z.object({
      qualityScore: z.number().min(0).max(100),
      issues: z.array(
        z.object({
          severity: z.enum(["error", "warning", "info"]),
          message: z.string(),
          suggestion: z.string().optional(),
        })
      ),
    });

    try {
      const result = await this.aiService.generateObjectWithSchema(
        {
          prompt,
          model: AiModel.GPT_4O_MINI,
          temperature: 0.3,
        },
        schema
      );

      if (result && typeof result === "object" && "qualityScore" in result && "issues" in result) {
        const validationResult = result as {
          qualityScore: number;
          issues: Array<{ severity: string; message: string; suggestion?: string }>;
        };

        // Convert AI issues to our format
        for (const aiIssue of validationResult.issues) {
          issues.push({
            field: fieldName,
            layer: ValidationLayerType.SEMANTIC,
            severity: aiIssue.severity as ValidationSeverity,
            message: aiIssue.message,
            suggestion: aiIssue.suggestion,
            currentValue: value,
          });
        }

        return {
          qualityScore: validationResult.qualityScore,
          fieldIssues: issues,
        };
      }
    } catch (error) {
      // AI validation failed, but don't block - log and continue
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      issues.push({
        field: fieldName,
        layer: ValidationLayerType.SEMANTIC,
        severity: ValidationSeverity.INFO,
        message: `Could not perform semantic validation: ${errorMessage}`,
        currentValue: value,
      });
    }

    // Fallback: return neutral score
    return {
      qualityScore: 50,
      fieldIssues: issues,
    };
  }

  /**
   * Convert any value to string for analysis
   */
  private valueToString(value: unknown): string {
    if (typeof value === "string") return value;
    if (Array.isArray(value)) return value.join(", ");
    if (typeof value === "object") return JSON.stringify(value);
    return String(value);
  }

  /**
   * Convert field names to human-readable format
   */
  private humanizeFieldName(field: string): string {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  /**
   * Generate actionable suggestions based on issues
   */
  private generateSuggestions(issues: ValidationIssue[], averageQuality: number): string[] {
    const suggestions: string[] = [];

    // Add suggestions from issues
    const uniqueSuggestions = new Set(issues.filter((i) => i.suggestion).map((i) => i.suggestion as string));
    suggestions.push(...uniqueSuggestions);

    // Add general quality suggestions if quality is low
    if (averageQuality < 60) {
      suggestions.push("Consider providing more detailed and specific information");
    }

    if (averageQuality < 40) {
      suggestions.push("Your responses seem quite brief - adding more context would help create a better plan");
    }

    return suggestions;
  }
}
