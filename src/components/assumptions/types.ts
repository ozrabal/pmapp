import type { Json } from "../../db/database.types";
import type { FeedbackItemDto, SuggestionDto } from "../../types";

/**
 * View model for project assumptions
 */
export interface AssumptionsViewModel {
  projectGoal: string;
  targetAudience: string;
  functionalities: string[];
  constraints: string[];
  
  // State management helpers
  isDirty: boolean;
  lastSaved: Date | null;
}

/**
 * Form state for assumptions editing
 */
export interface AssumptionsFormState {
  values: AssumptionsViewModel;
  errors: Record<string, string | null>;
  isSaving: boolean;
  savedSuccessfully: boolean;
  saveError: string | null;
}

/**
 * View model for validation results
 */
export interface ValidationResultViewModel {
  isValid: boolean;
  feedbackItems: FeedbackItemViewModel[];
  timestamp: Date;
}

/**
 * View model for feedback items
 */
export interface FeedbackItemViewModel {
  field: string;
  fieldLabel: string;
  message: string;
  severity: 'error' | 'warning' | 'info';
}

/**
 * View model for suggestions
 */
export interface SuggestionViewModel {
  id: string;
  field?: string;
  fieldLabel?: string;
  type?: string;
  content?: string;
  reason: string;
  
  // UI state
  isAccepted: boolean;
  isRejected: boolean;
  isFeedbackGiven: boolean;
}

/**
 * Mapper utilities for converting between types
 */
export class AssumptionsMapper {
  /**
   * Maps DB JSON to view model
   */
  static dbToViewModel(assumptions: Json | null): AssumptionsViewModel {
    if (!assumptions) {
      return {
        projectGoal: '',
        targetAudience: '',
        functionalities: [],
        constraints: [],
        isDirty: false,
        lastSaved: null
      };
    }
    
    const typed = assumptions as Record<string, any>;
    
    return {
      projectGoal: typed.projectGoal || '',
      targetAudience: typed.targetAudience || '',
      functionalities: Array.isArray(typed.functionalities) ? typed.functionalities : [],
      constraints: Array.isArray(typed.constraints) ? typed.constraints : [],
      isDirty: false,
      lastSaved: null
    };
  }
  
  /**
   * Maps view model to DB format
   */
  static viewModelToDB(viewModel: AssumptionsViewModel): Record<string, any> {
    const { isDirty, lastSaved, ...dbModel } = viewModel;
    return dbModel;
  }
  
  /**
   * Maps FeedbackItemDto to view model
   */
  static feedbackDtoToViewModel(dto: FeedbackItemDto): FeedbackItemViewModel {
    return {
      field: dto.field,
      fieldLabel: AssumptionsMapper.getFieldLabel(dto.field),
      message: dto.message,
      severity: dto.severity as 'error' | 'warning' | 'info',
    };
  }
  
  /**
   * Maps SuggestionDto to view model
   */
  static suggestionDtoToViewModel(dto: SuggestionDto): SuggestionViewModel {
    console.log('MAPPING DTO TO VIEW MODEL', dto);
    return {
      id: dto.id,
      field: dto.type,
      fieldLabel: dto.field ? AssumptionsMapper.getFieldLabel(dto.field) : undefined,
      type: dto.type,
      content: dto.content || dto.suggestion,
      reason: dto.reason,
      isAccepted: false,
      isRejected: false,
      isFeedbackGiven: false,
    };
  }
  
  /**
   * Gets a human-readable label for a field
   */
  static getFieldLabel(field: string): string {
    const fieldLabels: Record<string, string> = {
      'projectGoal': 'Cel projektu',
      'targetAudience': 'Grupa docelowa',
      'functionalities': 'Funkcjonalności',
      'constraints': 'Ograniczenia'
    };
    
    return fieldLabels[field] || field;
  }
}