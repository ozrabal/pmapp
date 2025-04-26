import { useState, useCallback } from "react";
import {  type ValidateProjectAssumptionsResponseDto } from "../../../types";
import { type ValidationResultViewModel, AssumptionsMapper } from "../types";

/**
 * Custom hook for validating project assumptions using AI
 */
export function useAssumptionsValidation(
  projectId: string,
  validateAssumptionsApi: (projectId: string) => Promise<ValidateProjectAssumptionsResponseDto>
) {
  const [validationResult, setValidationResult] = useState<ValidationResultViewModel | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  
  /**
   * Trigger validation of the assumptions
   */
  const validateAssumptions = useCallback(async () => {
    try {
      setIsValidating(true);
      setValidationError(null);
      
      // Call API to validate assumptions
      const response = await validateAssumptionsApi(projectId);
      
      // Map response to view model
      const result: ValidationResultViewModel = {
        isValid: response.isValid,
        feedbackItems: response.feedback.map(item => 
          AssumptionsMapper.feedbackDtoToViewModel(item)
        ),
        timestamp: new Date()
      };
      
      setValidationResult(result);
      return result;
    } catch (error) {
      setValidationError(error instanceof Error 
        ? error.message 
        : 'Nie udało się zwalidować założeń projektu');
      return null;
    } finally {
      setIsValidating(false);
    }
  }, [projectId, validateAssumptionsApi]);
  
  /**
   * Clear validation results
   */
  const clearValidation = useCallback(() => {
    setValidationResult(null);
    setValidationError(null);
  }, []);
  
  return {
    validationResult,
    isValidating,
    validationError,
    validateAssumptions,
    clearValidation
  };
}