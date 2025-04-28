import { useState, useCallback, useRef, useEffect } from 'react';
import { ProjectClientService } from '../../../../lib/services/project.service';
import type { ProjectDto, ValidateProjectAssumptionsResponseDto } from '../../../../types';
import type { AssumptionsViewModel } from '../../types';
import type { ValidationResultViewModel, SuggestionViewModel, FeedbackItemViewModel } from '../types';
import { AssumptionsMappers } from '../mappers';

// Helper function for debouncing
const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void => {
  let timeout: ReturnType<typeof setTimeout> | null = null;
  
  return function(...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
};

export interface ProjectViewModel {
  id: string;
  name: string;
  description: string | null;
  assumptions: AssumptionsViewModel | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Hook for managing project assumptions state and validation
 */
export function useProjectAssumptions(projectId: string) {
  // Project state
  const [project, setProject] = useState<ProjectViewModel | null>(null);
  
  // Validation result state
  const [validationResult, setValidationResult] = useState<ValidationResultViewModel>({
    isValid: false,
    feedback: [],
    suggestions: [],
    timestamp: null,
    isLoading: false,
    error: null
  });
  
  // References to form field elements for focus management
  const fieldRefs: Record<string, React.RefObject<HTMLTextAreaElement | null>> = {
    projectGoals: useRef<HTMLTextAreaElement>(null),
    targetAudience: useRef<HTMLTextAreaElement>(null),
    keyFeatures: useRef<HTMLTextAreaElement>(null),
    technologyStack: useRef<HTMLTextAreaElement>(null),
    constraints: useRef<HTMLTextAreaElement>(null)
  };

  // Function to load project data
  const loadProject = useCallback(async () => {
    try {
      setProject(prev => prev ? { ...prev, isLoading: true, error: null } : null);
      
      const projectData = await ProjectClientService.getProject(projectId);
      
      setProject({
        id: projectData.id,
        name: projectData.name,
        description: projectData.description,
        assumptions: AssumptionsMappers.jsonToViewModel(projectData.assumptions),
        isLoading: false,
        error: null
      });
    } catch (error) {
      setProject(prev => prev ? { 
        ...prev, 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      } : null);
    }
  }, [projectId]);
  
  // Function to update a single assumption field
  const updateAssumption = useCallback(
    (field: keyof AssumptionsViewModel, value: string) => {
      // Immediately update UI
      setProject(prev => {
        if (!prev || !prev.assumptions) return prev;
        
        return {
          ...prev,
          assumptions: {
            ...prev.assumptions,
            [field]: value
          }
        };
      });
      
      // Mark related suggestions as outdated
      setValidationResult(prev => ({
        ...prev,
        suggestions: prev.suggestions.map(s => 
          s.field === field ? { ...s, outdated: true } : s
        )
      }));
      
      // Trigger debounced update to API
      debouncedUpdate(field, value);
    },
    []
  );
  
  // Debounced function to update assumptions via API
  const debouncedUpdate = useCallback(
    debounce(async (field: keyof AssumptionsViewModel, value: string) => {
      if (!project?.id || !project.assumptions) return;
      
      try {
        const updatedAssumptions = { 
          ...project.assumptions, 
          [field]: value 
        };
        
        await ProjectClientService.updateProject(project.id, { 
          assumptions: AssumptionsMappers.viewModelToJson(updatedAssumptions) 
        });
      } catch (error) {
        console.error('Error saving assumptions:', error);
        // We could show a notification here but keeping it minimally intrusive
      }
    }, 500),
    [project]
  );
  
  // Function to validate assumptions via AI
  const validateAssumptions = useCallback(async () => {
    if (!project?.id) return;
    
    try {
      setValidationResult(prev => ({ 
        ...prev, 
        isLoading: true, 
        error: null 
      }));
      
      const result: ValidateProjectAssumptionsResponseDto = 
        await ProjectClientService.validateProjectAssumptions(project.id);
      console.log('Validation result:', result);
      setValidationResult({
        isValid: result.isValid,
        feedback: result.feedback.map(f => AssumptionsMappers.feedbackDtoToViewModel(f)),
        suggestions: result.suggestions.map(s => AssumptionsMappers.suggestionDtoToViewModel(s)),
        timestamp: new Date(),
        isLoading: false,
        error: null
      });
    } catch (error) {
      setValidationResult(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
    }
  }, [project]);
  
  // Function to accept a suggestion
  const acceptSuggestion = useCallback((suggestionId: string) => {
    if (!project?.assumptions) return;
    
    // Find the suggestion
    const suggestion = validationResult.suggestions.find(s => s.id === suggestionId);
    if (!suggestion || !suggestion.field || !suggestion.suggestion) return;
    
    // Update suggestion state
    setValidationResult(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => 
        s.id === suggestionId ? { ...s, isAccepted: true } : s
      )
    }));
    
    // Apply suggestion to form field
    const field = suggestion.field as keyof AssumptionsViewModel;
    updateAssumption(field, suggestion.suggestion);
    
    // Move focus to the field
    const fieldRef = fieldRefs[field];
    if (fieldRef?.current) {
      fieldRef.current.focus();
    }
  }, [validationResult.suggestions, project?.assumptions, updateAssumption]);
  
  // Function to reject a suggestion
  const rejectSuggestion = useCallback((suggestionId: string) => {
    setValidationResult(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => 
        s.id === suggestionId ? { ...s, isRejected: true } : s
      )
    }));
  }, []);
  
  // Function to submit feedback for a suggestion
  const submitFeedback = useCallback((suggestionId: string, isHelpful: boolean) => {
    // Update local state
    setValidationResult(prev => ({
      ...prev,
      suggestions: prev.suggestions.map(s => 
        s.id === suggestionId ? { ...s, isFeedbackGiven: true, isHelpful } : s
      )
    }));
    
    // Here we could call an API endpoint to save feedback
    // For now, we're just logging it
    console.log(`Feedback submitted: Suggestion ${suggestionId} was ${isHelpful ? 'helpful' : 'not helpful'}`);
  }, []);
  
  // Focus a specific field
  const focusField = useCallback((field: string) => {
    const fieldRef = fieldRefs[field as keyof typeof fieldRefs];
    if (fieldRef?.current) {
      fieldRef.current.focus();
      fieldRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, []);
  
  // Load project data on mount
  useEffect(() => {
    loadProject();
  }, [loadProject]);
  
  return {
    project,
    validationResult,
    fieldRefs,
    updateAssumption,
    validateAssumptions,
    acceptSuggestion,
    rejectSuggestion,
    submitFeedback,
    focusField,
    refreshProject: loadProject
  };
}