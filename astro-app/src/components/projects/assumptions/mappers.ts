import type { Json } from "../../../db/database.types";
import type { SuggestionDto, FeedbackItemDto } from "../../../types";
import type { AssumptionsViewModel } from "../types";
import type { SuggestionViewModel, FeedbackItemViewModel } from "./types";

/**
 * Utility functions for mapping between API data types and view models
 */
export const AssumptionsMappers = {
  /**
   * Converts assumptions from JSON format to a structured view model
   */
  jsonToViewModel(json: Json | null): AssumptionsViewModel | null {
    if (!json) return null;

    // Use type assertion but safely check each field with nullish coalescing
    const assumptions = json as Record<string, unknown>;
    return {
      projectGoals: typeof assumptions?.projectGoals === "string" ? assumptions.projectGoals : "",
      targetAudience: typeof assumptions?.targetAudience === "string" ? assumptions.targetAudience : "",
      keyFeatures: typeof assumptions?.keyFeatures === "string" ? assumptions.keyFeatures : "",
      technologyStack: typeof assumptions?.technologyStack === "string" ? assumptions.technologyStack : "",
      constraints: typeof assumptions?.constraints === "string" ? assumptions.constraints : "",
    };
  },

  /**
   * Converts view model to JSON format for API
   */
  viewModelToJson(viewModel: AssumptionsViewModel | null): Json | null {
    if (!viewModel) return null;

    return {
      projectGoals: viewModel.projectGoals || "",
      targetAudience: viewModel.targetAudience || "",
      keyFeatures: viewModel.keyFeatures || "",
      technologyStack: viewModel.technologyStack || "",
      constraints: viewModel.constraints || "",
    };
  },

  /**
   * Gets a human-readable label for a field path
   */
  getFieldLabel(field: string): string {
    const fieldLabels: Record<string, string> = {
      projectGoals: "Project Goals",
      targetAudience: "Target Audience",
      keyFeatures: "Key Features",
      technologyStack: "Technology Stack",
      constraints: "Constraints",
    };

    return fieldLabels[field] || field;
  },

  /**
   * Converts a SuggestionDto to SuggestionViewModel
   */
  suggestionDtoToViewModel(dto: SuggestionDto): SuggestionViewModel {
    return {
      ...dto,
      isAccepted: false,
      isRejected: false,
      isFeedbackGiven: false,
    };
  },

  /**
   * Converts a FeedbackItemDto to FeedbackItemViewModel
   */
  feedbackDtoToViewModel(dto: FeedbackItemDto): FeedbackItemViewModel {
    return {
      ...dto,
      fieldLabel: this.getFieldLabel(dto.field),
    };
  },
};
