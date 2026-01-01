import type { ProjectData } from "@/api/types/chat";
import {
  ValidationLayerType,
  ValidationSeverity,
  type ValidationIssue,
  type ValidationLayer,
  type ValidationLayerResult,
} from "../types";

/**
 * Validates presence and basic format of required fields
 * Enhanced version of the original validateStepData function
 */
export class PresenceValidationLayer implements ValidationLayer {
  name: ValidationLayerType = ValidationLayerType.PRESENCE;
  priority = 1; // Run first

  async validate(
    data: ProjectData,
    requiredFields: string[]
    // context not needed for presence validation
  ): Promise<ValidationLayerResult> {
    const issues: ValidationIssue[] = [];
    const totalFields = requiredFields.length;
    let validFields = 0;

    for (const field of requiredFields) {
      const value = data[field as keyof ProjectData];

      // Check for missing or null fields
      if (value === undefined || value === null) {
        issues.push({
          field,
          layer: ValidationLayerType.PRESENCE,
          severity: ValidationSeverity.ERROR,
          message: `${this.humanizeFieldName(field)} is required but missing`,
          suggestion: `Please provide ${this.humanizeFieldName(field).toLowerCase()}`,
          currentValue: value,
        });
        continue;
      }

      // Check for empty strings
      if (typeof value === "string" && value.trim() === "") {
        issues.push({
          field,
          layer: ValidationLayerType.PRESENCE,
          severity: ValidationSeverity.ERROR,
          message: `${this.humanizeFieldName(field)} cannot be empty`,
          suggestion: `Please provide a meaningful value for ${this.humanizeFieldName(field).toLowerCase()}`,
          currentValue: value,
        });
        continue;
      }

      // Check for empty arrays
      if (Array.isArray(value) && value.length === 0) {
        issues.push({
          field,
          layer: ValidationLayerType.PRESENCE,
          severity: ValidationSeverity.ERROR,
          message: `${this.humanizeFieldName(field)} requires at least one item`,
          suggestion: `Please provide at least one ${this.humanizeFieldName(field).toLowerCase().slice(0, -1)}`,
          currentValue: value,
        });
        continue;
      }

      // Check for arrays with empty string items
      if (Array.isArray(value)) {
        const emptyItems = value.filter((item) => typeof item === "string" && item.trim() === "");
        if (emptyItems.length > 0) {
          issues.push({
            field,
            layer: ValidationLayerType.PRESENCE,
            severity: ValidationSeverity.WARNING,
            message: `${this.humanizeFieldName(field)} contains empty items`,
            suggestion: `Please ensure all items in ${this.humanizeFieldName(field).toLowerCase()} have meaningful content`,
            currentValue: value,
          });
          validFields += 0.5; // Partial credit
          continue;
        }
      }

      // Field is valid
      validFields++;
    }

    const passed = issues.filter((i) => i.severity === ValidationSeverity.ERROR).length === 0;
    const confidence = totalFields > 0 ? (validFields / totalFields) * 100 : 100;

    const suggestions: string[] = [];
    if (!passed) {
      const errorFields = issues
        .filter((i) => i.severity === ValidationSeverity.ERROR)
        .map((i) => this.humanizeFieldName(i.field).toLowerCase());

      if (errorFields.length === 1) {
        suggestions.push(`Please provide ${errorFields[0]}`);
      } else if (errorFields.length === 2) {
        suggestions.push(`Please provide ${errorFields[0]} and ${errorFields[1]}`);
      } else if (errorFields.length > 2) {
        const lastField = errorFields.pop();
        suggestions.push(`Please provide ${errorFields.join(", ")}, and ${lastField}`);
      }
    }

    return {
      passed,
      confidence,
      issues,
      suggestions,
    };
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
}
