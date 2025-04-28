import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '../../ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { AlertCircle } from 'lucide-react';
import { AssumptionField } from './AssumptionField';
import { ValidateAssumptionsButton } from './ValidateAssumptionsButton';
import { SuggestionsList } from './SuggestionsList';
import { useProjectAssumptions } from './hooks/useProjectAssumptions';
import type { AssumptionsViewModel } from '../types';
import type { FeedbackItemViewModel } from './types';

interface AssumptionsFormProps {
  projectId: string;
  className?: string;
}

/**
 * Form component for editing and validating project assumptions
 */
export function AssumptionsForm({ projectId, className }: AssumptionsFormProps) {
  const {
    project,
    validationResult,
    fieldRefs,
    updateAssumption,
    validateAssumptions,
    acceptSuggestion,
    rejectSuggestion,
    submitFeedback,
    focusField,
    refreshProject
  } = useProjectAssumptions(projectId);

  // Helper function to get suggestions for a specific field
  const getSuggestionsForField = (field: keyof AssumptionsViewModel) => {
    return validationResult.suggestions.filter(s => s.field === field);
  };
  
  // Helper function to get feedback for a specific field
  const getFeedbackForField = (field: keyof AssumptionsViewModel): FeedbackItemViewModel[] => {
    return validationResult.feedback.filter(f => f.field === field);
  };

  // Determine if the validation button should be disabled
  const isValidateDisabled = !project?.assumptions || 
    Object.values(project.assumptions).every(val => !val || val.trim() === '') ||
    validationResult.isLoading;
  
  if (project?.error) {
    return (
      <Alert variant="destructive" className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error loading project</AlertTitle>
        <AlertDescription>
          {project.error}
          <button 
            onClick={refreshProject}
            className="ml-2 text-xs underline hover:no-underline"
          >
            Try again
          </button>
        </AlertDescription>
      </Alert>
    );
  }

  if (project?.isLoading) {
    return (
      <div className={`animate-pulse space-y-6 ${className}`}>
        <div className="h-8 bg-muted rounded w-1/3"></div>
        <div className="space-y-4">
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-32 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (!project?.assumptions) {
    return (
      <Alert className={className}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No assumptions defined</AlertTitle>
        <AlertDescription>
          This project does not have any assumptions defined yet.
        </AlertDescription>
      </Alert>
    );
  }
console.log('PROJECT ASSUMPTIONS', project.assumptions);
  return (
    <div className={`space-y-6 ${className}`}>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Project Assumptions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <AssumptionField
            id="projectGoals"
            label="Project Goals"
            value={project.assumptions.projectGoals || ''}
            onChange={value => updateAssumption('projectGoals', value)}
            suggestions={getSuggestionsForField('projectGoals')}
            feedback={getFeedbackForField('projectGoals')}
            fieldRef={fieldRefs.projectGoals as React.RefObject<HTMLTextAreaElement>}
            maxLength={1000}
          />
          
          <AssumptionField
            id="targetAudience"
            label="Target Audience"
            value={project.assumptions.targetAudience || ''}
            onChange={value => updateAssumption('targetAudience', value)}
            suggestions={getSuggestionsForField('targetAudience')}
            feedback={getFeedbackForField('targetAudience')}
            fieldRef={fieldRefs.targetAudience as React.RefObject<HTMLTextAreaElement>}
            maxLength={500}
          />
          
          <AssumptionField
            id="keyFeatures"
            label="Key Features"
            value={project.assumptions.keyFeatures || ''}
            onChange={value => updateAssumption('keyFeatures', value)}
            suggestions={getSuggestionsForField('keyFeatures')}
            feedback={getFeedbackForField('keyFeatures')}
            fieldRef={fieldRefs.keyFeatures as React.RefObject<HTMLTextAreaElement>}
            maxLength={1000}
          />
          
          <AssumptionField
            id="technologyStack"
            label="Technology Stack"
            value={project.assumptions.technologyStack || ''}
            onChange={value => updateAssumption('technologyStack', value)}
            suggestions={getSuggestionsForField('technologyStack')}
            feedback={getFeedbackForField('technologyStack')}
            fieldRef={fieldRefs.technologyStack as React.RefObject<HTMLTextAreaElement>}
            maxLength={500}
          />
          
          <AssumptionField
            id="constraints"
            label="Constraints"
            value={project.assumptions.constraints || ''}
            onChange={value => updateAssumption('constraints', value)}
            suggestions={getSuggestionsForField('constraints')}
            feedback={getFeedbackForField('constraints')}
            fieldRef={fieldRefs.constraints as React.RefObject<HTMLTextAreaElement>}
            maxLength={500}
          />
          
          <div className="flex justify-end pt-2">
            <ValidateAssumptionsButton
              onValidate={validateAssumptions}
              isLoading={validationResult.isLoading}
              disabled={isValidateDisabled}
            />
          </div>
        </CardContent>
      </Card>
      
      {validationResult.error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Validation failed</AlertTitle>
          <AlertDescription>
            {validationResult.error}
            <button 
              onClick={validateAssumptions}
              className="ml-2 text-xs underline hover:no-underline"
            >
              Try again
            </button>
          </AlertDescription>
        </Alert>
      )}
      
      {validationResult.suggestions.length > 0 && (
        <SuggestionsList
          suggestions={validationResult.suggestions}
          onAccept={acceptSuggestion}
          onReject={rejectSuggestion}
          onFeedbackSubmit={submitFeedback}
          isLoading={validationResult.isLoading}
        />
      )}
    </div>
  );
}