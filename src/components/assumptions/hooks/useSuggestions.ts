import { useState, useCallback } from "react";
import { type GetProjectSuggestionsResponseDto } from "../../../types";
import { type SuggestionViewModel, AssumptionsMapper } from "../types";

/**
 * Custom hook for managing AI-generated suggestions
 */
export function useSuggestions(
  projectId: string,
  fetchSuggestionsApi: (projectId: string, focus?: string) => Promise<GetProjectSuggestionsResponseDto>,
  submitFeedbackApi: (suggestionContext: string, suggestionHash: string, isHelpful: boolean) => Promise<void>,
  onAcceptSuggestion: (field: string, value: any) => void
) {
  const [suggestions, setSuggestions] = useState<SuggestionViewModel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  /**
   * Fetch suggestions from API
   */
  const fetchSuggestions = useCallback(async (focus?: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await fetchSuggestionsApi(projectId, focus);

      console.log('Fetched suggestions:', response);
      // Map API response to view models
      const mappedSuggestions = response.map(suggestion => 
        AssumptionsMapper.suggestionDtoToViewModel(suggestion)
      );
console.log('Mapped suggestions:', mappedSuggestions);
      setSuggestions(mappedSuggestions);
      return mappedSuggestions;
    } catch (error) {
      const errorMessage = error instanceof Error
        ? error.message
        : 'Nie udało się pobrać sugestii';
      
      setError(errorMessage);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [fetchSuggestionsApi, projectId]);
  
  /**
   * Accept a suggestion and update the form
   */
  const acceptSuggestion = useCallback((suggestionId: string) => {
    console.log('Accepting suggestion with ID:', suggestionId);
    const suggestion = suggestions.find(s => s.id === suggestionId);
    
    if (!suggestion) {
      console.error('Suggestion not found:', suggestionId);
      return false;
    }
    
    if (suggestion.content === undefined || suggestion.content === null) {
      console.error('Suggestion has no content:', suggestion);
      return false;
    }
    
    // Determine the field to use - handle special case for name suggestions
    let fieldToUse = suggestion.field;
    
    // Special case for name suggestions which might not have a field property
    if (!fieldToUse && suggestionId.startsWith('sugg-name-')) {
      fieldToUse = 'name';
      console.log('Using "name" as field for name suggestion:', suggestionId);
    } else if (!fieldToUse) {
      fieldToUse = 'general';
      console.log('Using "general" as default field for suggestion without field property:', suggestionId);
    }
    
    console.log('Applying suggestion:', {
      field: fieldToUse,
      content: suggestion.content
    });
    
    // Apply suggestion to form
    onAcceptSuggestion(fieldToUse, suggestion.content);
    
    // Mark suggestion as accepted in UI
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId
        ? { ...s, isAccepted: true, isRejected: false }
        : s
      )
    );
    
    return true;
  }, [onAcceptSuggestion, suggestions]);
  
  /**
   * Reject a suggestion
   */
  const rejectSuggestion = useCallback((suggestionId: string) => {
    // Mark suggestion as rejected in UI
    setSuggestions(prev => 
      prev.map(s => s.id === suggestionId
        ? { ...s, isRejected: true, isAccepted: false }
        : s
      )
    );
  }, []);
  
  /**
   * Provide feedback on a suggestion
   */
  const provideFeedback = useCallback(async (
    suggestionId: string,
    isHelpful: boolean
  ) => {
    const suggestion = suggestions.find(s => s.id === suggestionId);

    if (!suggestion) return;
    
    try {
      await submitFeedbackApi(
        // Suggestion context identifier, typically project ID + field
        `project:${projectId}:${suggestion.field || 'general'}`,
        // Use suggestion ID as hash
        suggestionId,
        isHelpful
      );
      
      // Update UI state to show feedback was given
      setSuggestions(prev => 
        prev.map(s => s.id === suggestionId
          ? { ...s, isFeedbackGiven: true }
          : s
        )
      );
    } catch (error) {
      console.error('Failed to submit suggestion feedback:', error);
      // We don't surface this error to the user as it's not critical
    }
  }, [projectId, submitFeedbackApi, suggestions]);
  
  /**
   * Clear all suggestions
   */
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);
  
  return {
    suggestions,
    isLoading,
    error,
    fetchSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    provideFeedback,
    clearSuggestions
  };
}