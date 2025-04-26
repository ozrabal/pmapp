import { useState, useEffect, useCallback } from "react";
import { useEffect as useReactUseEffect } from "react";
import type { Json } from "../../../db/database.types";
import type { AssumptionsFormState, AssumptionsViewModel } from "../types";
import { AssumptionsMapper } from "../types";

/**
 * Custom hook for managing the assumptions form state and auto-saving
 */
export function useAssumptionsForm(
  projectId: string,
  initialAssumptions: Json | null,
  onSave: (projectId: string, assumptions: Record<string, any>) => Promise<void>
) {
  // Initialize state from props
  const [formState, setFormState] = useState<AssumptionsFormState>(() => ({
    values: AssumptionsMapper.dbToViewModel(initialAssumptions),
    errors: {},
    isSaving: false,
    savedSuccessfully: false,
    saveError: null
  }));
  
  // Track if component is mounted to prevent state updates after unmount
  const [isMounted, setIsMounted] = useState(true);
  useEffect(() => {
    return () => {
      setIsMounted(false);
    };
  }, []);
  
  // Validate a single field
  const validateField = useCallback((field: keyof AssumptionsViewModel, value: any): string | null => {
    if (field === 'projectGoal' && value.length > 1000) {
      return 'Cel projektu nie może przekraczać 1000 znaków';
    }
    
    if (field === 'targetAudience' && value.length > 500) {
      return 'Grupa docelowa nie może przekraczać 500 znaków';
    }
    
    if (field === 'functionalities') {
      if (!Array.isArray(value)) {
        return 'Funkcjonalności muszą być listą';
      }
      
      if (value.length > 10) {
        return 'Możesz dodać maksymalnie 10 funkcjonalności';
      }
      
      const invalidItem = value.find(item => typeof item !== 'string' || item.length > 200);
      if (invalidItem !== undefined) {
        return 'Każda funkcjonalność nie może przekraczać 200 znaków';
      }
    }
    
    if (field === 'constraints') {
      if (!Array.isArray(value)) {
        return 'Ograniczenia muszą być listą';
      }
      
      if (value.length > 5) {
        return 'Możesz dodać maksymalnie 5 ograniczeń';
      }
      
      const invalidItem = value.find(item => typeof item !== 'string' || item.length > 200);
      if (invalidItem !== undefined) {
        return 'Każde ograniczenie nie może przekraczać 200 znaków';
      }
    }
    
    return null;
  }, []);
  
  // Update a single field in the form
  const updateField = useCallback((field: keyof AssumptionsViewModel, value: any) => {
    setFormState(prev => {
      // Validate the new value
      const error = validateField(field, value);
      
      // Create the new state
      const newState = {
        ...prev,
        values: {
          ...prev.values,
          [field]: value,
          isDirty: true
        },
        errors: {
          ...prev.errors,
          [field]: error
        },
        saveError: null // Clear previous save errors
      };
      
      return newState;
    });
  }, [validateField]);
  
  // Save the form data to the server
  const saveData = useCallback(async () => {
    // Check if there are any validation errors
    const hasErrors = Object.values(formState.errors).some(error => error !== null);
    if (hasErrors) {
      return;
    }
    
    setFormState(prev => ({
      ...prev,
      isSaving: true,
      savedSuccessfully: false,
      saveError: null
    }));
    
    try {
      // Convert view model to DB format and save
      const dbModel = AssumptionsMapper.viewModelToDB(formState.values);
      await onSave(projectId, dbModel);
      
      // Update state only if component is still mounted
      if (isMounted) {
        setFormState(prev => ({
          ...prev,
          isSaving: false,
          savedSuccessfully: true,
          values: {
            ...prev.values,
            isDirty: false,
            lastSaved: new Date()
          }
        }));
      }
    } catch (error) {
      // Update error state only if component is still mounted
      if (isMounted) {
        setFormState(prev => ({
          ...prev,
          isSaving: false,
          savedSuccessfully: false,
          saveError: error instanceof Error ? error.message : 'Nie udało się zapisać zmian'
        }));
      }
    }
  }, [formState.errors, formState.values, isMounted, onSave, projectId]);
  
  // Implement our own debounced auto-save with standard useEffect
  useEffect(() => {
    // Skip save if not dirty or already saving
    if (!formState.values.isDirty || formState.isSaving) {
      return;
    }
    
    // Create debounced save timer
    const timer = setTimeout(() => {
      saveData();
    }, 1500);
    
    // Clear the timer on cleanup
    return () => {
      clearTimeout(timer);
    };
  }, [formState.values, formState.isSaving, saveData]);
  
  // Reset form to initial data
  const resetForm = useCallback(() => {
    setFormState({
      values: AssumptionsMapper.dbToViewModel(initialAssumptions),
      errors: {},
      isSaving: false,
      savedSuccessfully: false,
      saveError: null
    });
  }, [initialAssumptions]);
  
  // Explicitly save now (for button actions)
  const saveNow = useCallback(async () => {
    if (formState.values.isDirty && !formState.isSaving) {
      await saveData();
    }
    
    return !formState.saveError;
  }, [formState.values.isDirty, formState.isSaving, formState.saveError, saveData]);
  
  return {
    formState,
    updateField,
    resetForm,
    saveNow
  };
}