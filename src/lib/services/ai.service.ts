import type { FeedbackItemDto, SuggestionDto } from '../../types';
import type { ProjectAssumptions } from '../schemas/assumptions.schema';

/**
 * Result structure returned by the AI validation service
 */
export interface ValidateAssumptionsResult {
  isValid: boolean;
  feedback: FeedbackItemDto[];
  suggestions: SuggestionDto[];
}

/**
 * Service for AI-powered operations
 * Handles communication with AI services for validating and enhancing project data
 */
export class AiService {
  /**
   * Validates project assumptions using AI
   * This is currently a mock implementation that returns synthetic data
   * 
   * @param assumptions - The project assumptions to validate
   * @returns A promise that resolves to ValidateAssumptionsResult
   */
  async validateProjectAssumptions(assumptions: ProjectAssumptions): Promise<ValidateAssumptionsResult> {
    // Mock implementation - in a real implementation, this would call an AI service
    console.log('Validating project assumptions:', JSON.stringify(assumptions, null, 2));
    
    // Create a mock validation result based on the provided assumptions
    const result: ValidateAssumptionsResult = {
      isValid: true,
      feedback: [],
      suggestions: []
    };
    
    // Add mock feedback items based on actual assumptions data
    if (assumptions.marketAssumptions?.targetAudience === '') {
      result.isValid = false;
      result.feedback.push({
        field: 'marketAssumptions.targetAudience',
        message: 'Target audience should be defined for better project focus',
        severity: 'warning'
      });
    }
    
    if (!assumptions.technicalAssumptions?.technologies?.length) {
      result.feedback.push({
        field: 'technicalAssumptions.technologies',
        message: 'Consider specifying technologies to be used in the project',
        severity: 'info'
      });
    }
    
    // Add some generic mock suggestions
    result.suggestions.push({
      id: 'sugg-001',
      field: 'businessAssumptions.timeline',
      suggestion: 'Consider breaking down the timeline into specific milestones',
      reason: 'Detailed timelines help in better project planning and tracking'
    });
    
    result.suggestions.push({
      id: 'sugg-002',
      field: 'technicalAssumptions.architecture',
      suggestion: 'Consider adding more details about the system architecture',
      reason: 'A well-defined architecture helps in identifying potential technical challenges early'
    });
    
    // Simulate a slight delay to mimic AI processing time
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return result;
  }
}

// Export a singleton instance of the service
export const aiService = new AiService();