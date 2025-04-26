import React, { useState, useEffect, useCallback } from "react";
import { type Json } from "../../db/database.types";
import { type ProjectDto } from "../../types";
import { useAssumptionsForm } from "./hooks/useAssumptionsForm";
import { useAssumptionsValidation } from "./hooks/useAssumptionsValidation";
import { useSuggestions } from "./hooks/useSuggestions";
import { AssumptionsForm } from "./AssumptionsForm";
import { ValidationButton } from "./ValidationButton";
import { ValidationResults } from "./ValidationResults";
import { SuggestionsList } from "./SuggestionsList";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card";
import { Alert, AlertDescription } from "../ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

interface ProjectClientService {
  updateProject: (id: string, data: any) => Promise<any>;
  validateProjectAssumptions: (id: string) => Promise<any>;
  getProjectSuggestions: (id: string, focus?: string) => Promise<any>;
  submitSuggestionFeedback: (suggestionContext: string, suggestionHash: string, isHelpful: boolean) => Promise<void>;
}

interface AssumptionsTabViewProps {
  projectId: string;
  initialProject: ProjectDto;
  clientService?: Partial<ProjectClientService>;
}

// Create client service methods that can be used from the browser
const createClientService = (projectId: string): ProjectClientService => {
  return {
    updateProject: async (id: string, data: any) => {
      const response = await fetch(`/api/projects/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Nie udało się zaktualizować projektu');
      }
      
      return await response.json();
    },
    
    validateProjectAssumptions: async (id: string) => {
      const response = await fetch(`/api/projects/${id}/assumptions/validate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Nie udało się zwalidować założeń');
      }
      
      return await response.json();
    },
    
    getProjectSuggestions: async (id: string, focus?: string) => {
      const url = new URL(`/api/projects/${id}/suggestions`, window.location.origin);
      if (focus) {
        url.searchParams.append('focus', focus);
      }
      
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Nie udało się pobrać sugestii');
      }
      
      return await response.json();
    },
    
    submitSuggestionFeedback: async (suggestionContext: string, suggestionHash: string, isHelpful: boolean) => {
      const response = await fetch('/api/ai-feedbacks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          suggestionContext,
          suggestionHash,
          isHelpful,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Nie udało się wysłać feedbacku');
      }
      
      return await response.json();
    }
  };
};

export function AssumptionsTabView({
  projectId,
  initialProject,
  clientService: providedClientService
}: AssumptionsTabViewProps) {
  const [project, setProject] = useState<ProjectDto>(initialProject);
  const [generalError, setGeneralError] = useState<string | null>(null);
  
  // Create a client service if one isn't provided or if the provided one has null methods
  const [clientService, setClientService] = useState<ProjectClientService>(() => {
    // Check if the provided client service has valid methods
    if (providedClientService && 
        typeof providedClientService.updateProject === 'function' &&
        typeof providedClientService.validateProjectAssumptions === 'function' &&
        typeof providedClientService.getProjectSuggestions === 'function' &&
        typeof providedClientService.submitSuggestionFeedback === 'function') {
      return providedClientService as ProjectClientService;
    }
    
    // Create a new client service with default implementations
    return createClientService(projectId);
  });
  
  // Initialize form hook
  const {
    formState,
    updateField,
    resetForm,
    saveNow
  } = useAssumptionsForm(
    projectId,
    project.assumptions,
    async (id: string, assumptions: Record<string, any>) => {
      try {
        const result = await clientService.updateProject(id, { assumptions });
        setProject(prev => ({ ...prev, assumptions: result.assumptions }));
        return result;
      } catch (error) {
        console.error("Failed to save assumptions:", error);
        throw error;
      }
    }
  );
  
  // Initialize validation hook
  const {
    validationResult,
    isValidating,
    validationError,
    validateAssumptions,
    clearValidation
  } = useAssumptionsValidation(
    projectId,
    clientService.validateProjectAssumptions
  );
  
  // Initialize suggestions hook
  const {
    suggestions,
    isLoading: isSuggestionsLoading,
    error: suggestionsError,
    fetchSuggestions,
    acceptSuggestion,
    rejectSuggestion,
    provideFeedback,
    clearSuggestions
  } = useSuggestions(
    projectId,
    clientService.getProjectSuggestions,
    clientService.submitSuggestionFeedback,
    updateField
  );

  
  // Handle validation trigger
  const handleValidate = useCallback(async () => {
    try {
      setGeneralError(null);
      
      // Save current form data first
      const saveResult = await saveNow();
      if (!saveResult) {
        setGeneralError("Nie udało się zapisać założeń przed walidacją");
        return;
      }
      
      // Clear existing validation and suggestions
      clearValidation();
      clearSuggestions();
      
      // Trigger validation
      const result = await validateAssumptions();
      console.log("Validation result:", result);
      // Fetch suggestions if validation succeeded
      if (result) {
        await fetchSuggestions();
      }
    } catch (error) {
      setGeneralError(
        error instanceof Error
          ? `Wystąpił błąd: ${error.message}`
          : "Wystąpił nieoczekiwany błąd"
      );
    }
  }, [saveNow, clearValidation, clearSuggestions, validateAssumptions, fetchSuggestions]);
  
  // Effect to handle changes in validation error
  useEffect(() => {
    if (validationError) {
      setGeneralError(validationError);
    }
  }, [validationError]);
  
  // Effect to handle changes in suggestions error
  useEffect(() => {
    if (suggestionsError) {
      setGeneralError(suggestionsError);
    }
  }, [suggestionsError]);
  
  // Focus a field in the form when a feedback item is clicked
  const handleFieldFocus = useCallback((field: string) => {
    // Implementation will depend on the form's field refs
    document.querySelector(`[name="${field}"]`)?.focus();
  }, []);
  
  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <Tabs defaultValue="assumptions" className="w-full">
        <TabsList>
          <TabsTrigger value="general">Informacje ogólne</TabsTrigger>
          <TabsTrigger value="assumptions">Założenia</TabsTrigger>
          <TabsTrigger value="functionalities">Funkcjonalności</TabsTrigger>
          <TabsTrigger value="schedule">Harmonogram</TabsTrigger>
        </TabsList>
        
        <TabsContent value="assumptions" className="space-y-6 mt-6">
          {/* Main Card */}
          <Card>
            <CardHeader>
              <CardTitle>Założenia projektu</CardTitle>
              <CardDescription>
                Zdefiniuj główne założenia projektu, które będą podstawą do dalszych analiz.
                Uzupełnij wszystkie pola, aby otrzymać kompleksową walidację i sugestie.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* General error alert */}
              {generalError && (
                <Alert variant="destructive" className="mb-4">
                  <AlertDescription>{generalError}</AlertDescription>
                </Alert>
              )}
              
              {/* Assumptions Form */}
              <AssumptionsForm
                formState={formState}
                onUpdateField={updateField}
                onReset={resetForm}
              />
              
              {/* Validation Button */}
              <div className="mt-4 flex justify-end">
                <ValidationButton
                  onClick={handleValidate}
                  isLoading={isValidating}
                  isDisabled={formState.isSaving}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Results Section - conditionally rendered */}
          {validationResult && suggestions && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Validation Results */}
              <Card>
                <CardHeader>
                  <CardTitle>Wyniki walidacji</CardTitle>
                  <CardDescription>
                    Analiza poprawności i kompletności założeń projektu.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ValidationResults
                    validation={validationResult}
                    onFieldFocus={handleFieldFocus}
                  />
                </CardContent>
              </Card>
              
              {/* Suggestions */}
              <Card>
                <CardHeader>
                  <CardTitle>Sugestie usprawnień</CardTitle>
                  <CardDescription>
                    Propozycje ulepszenia założeń Twojego projektu.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SuggestionsList
                    suggestions={suggestions}
                    isLoading={isSuggestionsLoading}
                    onAccept={(suggestionId) => acceptSuggestion(suggestionId)}
                    onReject={(suggestionId) => rejectSuggestion(suggestionId)}
                    onFeedback={(suggestionId, isHelpful) => provideFeedback(suggestionId, isHelpful)}
                  />
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}