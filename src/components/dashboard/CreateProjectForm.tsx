import React, { useId, useEffect, useRef } from 'react';
import { useCreateProjectForm } from './hooks/useCreateProjectForm';
import ProjectNameInput from './ProjectNameInput';
import ProjectDescriptionTextarea from './ProjectDescriptionTextarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, CheckIcon, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export function CreateProjectForm() {
  // Generate unique IDs for form fields and form itself
  const formId = useId();
  const nameId = useId();
  const descriptionId = useId();
  const errorId = useId();
  
  // Reference for submit button to manage focus
  const submitButtonRef = useRef<HTMLButtonElement>(null);
  
  // Use custom form hook
  const { formState, actions, isValid } = useCreateProjectForm();
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await actions.submit();
  };
  
  // Focus management: On error, focus the submit button
  useEffect(() => {
    if (formState.serverError && submitButtonRef.current) {
      submitButtonRef.current.focus();
    }
  }, [formState.serverError]);

  // Keyboard handler for better accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Allow Escape key to cancel the form
    if (e.key === 'Escape' && !formState.isSubmitting) {
      e.preventDefault();
      actions.cancel();
    }
  };
  
  // Determine retry message based on error type
  const getRetryAction = () => {
    if (formState.serverError?.includes('połączyć z serwerem')) {
      return 'Sprawdź połączenie i spróbuj ponownie';
    }
    return 'Spróbuj ponownie';
  };
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <form 
        id={formId}
        onSubmit={handleSubmit} 
        onKeyDown={handleKeyDown}
        noValidate
        aria-labelledby={`${formId}-title`}
        aria-describedby={formState.serverError ? errorId : `${formId}-description`}
      >
        <CardHeader>
          <CardTitle id={`${formId}-title`}>Utwórz nowy projekt</CardTitle>
          <CardDescription id={`${formId}-description`}>
            Wypełnij poniższy formularz, aby utworzyć nowy projekt. Pola oznaczone gwiazdką (*) są wymagane.
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Error alert */}
          {formState.serverError && (
            <Alert 
              variant="destructive" 
              className="mb-6"
              id={errorId}
              role="alert"
            >
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
                <span>{formState.serverError}</span>
                <Button 
                  variant="destructive" 
                  size="sm" 
                  onClick={() => actions.reset()}
                  className="mt-2 sm:mt-0 flex gap-2 items-center whitespace-nowrap"
                  type="button"
                >
                  <RefreshCw className="h-3 w-3" />
                  {getRetryAction()}
                </Button>
              </AlertDescription>
            </Alert>
          )}
          
          {/* Project name field */}
          <ProjectNameInput
            id={nameId}
            value={formState.name}
            error={formState.nameError}
            onChange={actions.setName}
            onBlur={actions.validateName}
            disabled={formState.isSubmitting}
          />
          
          {/* Project description field */}
          <ProjectDescriptionTextarea
            id={descriptionId}
            value={formState.description}
            error={formState.descriptionError}
            onChange={actions.setDescription}
            onBlur={actions.validateDescription}
            maxLength={1000}
            disabled={formState.isSubmitting}
          />
        </CardContent>
        
        <CardFooter className="flex justify-between sm:justify-end gap-2 flex-wrap">
          <Button
            type="button"
            variant="outline"
            onClick={actions.cancel}
            disabled={formState.isSubmitting}
            className="w-full sm:w-auto order-2 sm:order-1"
          >
            Anuluj
          </Button>
          
          <Button
            ref={submitButtonRef}
            type="submit"
            disabled={!isValid || formState.isSubmitting}
            className="gap-2 w-full sm:w-auto order-1 sm:order-2"
            aria-busy={formState.isSubmitting}
          >
            {formState.isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                <span>Tworzenie...</span>
              </>
            ) : (
              <>
                <CheckIcon className="h-4 w-4" aria-hidden="true" />
                <span>Utwórz projekt</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

export default CreateProjectForm;