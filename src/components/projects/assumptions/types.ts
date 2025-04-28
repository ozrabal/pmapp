import type { FeedbackItemDto, SuggestionDto } from '../../../types';
import type { AssumptionsViewModel } from '../types';

// Extended view model types for suggestions and feedback
export interface SuggestionViewModel extends SuggestionDto {
  // UI state extensions
  isAccepted: boolean;
  isRejected: boolean;
  isFeedbackGiven: boolean;
  isHelpful?: boolean;
  outdated?: boolean;
}

export interface FeedbackItemViewModel extends FeedbackItemDto {
  fieldLabel: string; // Human-readable field name
}

export interface ValidationResultViewModel {
  isValid: boolean;
  feedback: FeedbackItemViewModel[];
  suggestions: SuggestionViewModel[];
  timestamp: Date | null;
  isLoading: boolean;
  error: string | null;
}

// Props for components
export interface ValidateAssumptionsButtonProps {
  onValidate: () => Promise<void>;
  isLoading: boolean;
  disabled: boolean;
  className?: string;
}

export interface SuggestionsListProps {
  suggestions: SuggestionViewModel[];
  onAccept: (suggestionId: string) => void;
  onReject: (suggestionId: string) => void;
  onFeedbackSubmit: (suggestionId: string, isHelpful: boolean) => void;
  isLoading: boolean;
  className?: string;
}

export interface SuggestionItemProps {
  suggestion: SuggestionViewModel;
  onAccept: () => void;
  onReject: () => void;
  onFeedbackSubmit: (isHelpful: boolean) => void;
  disabled?: boolean;
  className?: string;
}

export interface FeedbackButtonProps {
  onFeedbackSubmit: (isHelpful: boolean) => void;
  isSubmitted: boolean;
  selectedFeedback?: boolean;
  className?: string;
}

export interface AssumptionFieldProps {
  id: keyof AssumptionsViewModel;
  label: string;
  value: string;
  onChange: (value: string) => void;
  suggestions?: SuggestionViewModel[];
  feedback?: FeedbackItemViewModel[];  // Added feedback array for field-specific validation results
  fieldRef: React.RefObject<HTMLTextAreaElement>;
  maxLength?: number;
  isLoading?: boolean;
  className?: string;
}

export interface FeedbackItemProps {
  feedback: FeedbackItemViewModel;
  onFieldFocus?: (field: string) => void;
  className?: string;
}