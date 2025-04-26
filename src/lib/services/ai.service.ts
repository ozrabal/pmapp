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
 * Context structure for project suggestions
 */
export interface ProjectSuggestionContext {
  id: string;
  name: string;
  description: string | null;
  assumptions: any | null;
  functionalBlocks: any | null;
  schedule: any | null;
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

  /**
   * Generates AI suggestions for project improvements
   * This is currently a mock implementation that returns synthetic data
   * 
   * @param projectContext - The project data context to base suggestions on
   * @param focus - Optional parameter to specify the area to focus suggestions on
   * @returns A promise that resolves to an array of SuggestionDto
   */
  async generateProjectSuggestions(
    projectContext: ProjectSuggestionContext,
    focus?: string
  ): Promise<SuggestionDto[]> {
    // Mock implementation - in a real implementation, this would call an AI service
    console.log('Generating suggestions for project:', projectContext.name);
    if (focus) {
      console.log('Focus area:', focus);
    }
    
    // Generate mock suggestions based on project context and focus area
    const suggestions: SuggestionDto[] = [];
    
    // Basic suggestions based on project name and description
    suggestions.push({
      id: 'sugg-name-001',
      type: 'projectGoal',
      content: `Consider making the project name "${projectContext.name}" more specific to its purpose`,
      reason: 'More specific names help stakeholders understand the project scope at a glance'
    });

    if (!projectContext.description || projectContext.description.length < 50) {
      suggestions.push({
        id: 'sugg-desc-001',
        type: 'description_enhancement',
        content: 'Expand your project description with more details about goals, scope, and expected outcomes',
        reason: 'Detailed descriptions help team members and stakeholders align on project objectives'
      });
    }
    
    // Add focus-specific suggestions
    if (!focus || focus.toLowerCase().includes('assumption')) {
      suggestions.push({
        id: 'sugg-assum-001',
        type: 'assumption_refinement',
        content: 'Consider adding market size estimates to your business assumptions',
        reason: 'Quantitative market data helps validate the business case for the project'
      });
      
      suggestions.push({
        id: 'sugg-assum-002',
        type: 'assumption_validation',
        content: 'Validate your technical assumptions with a proof of concept for critical components',
        reason: 'Early technical validation reduces project risks and prevents costly changes later'
      });
    }
    
    if (!focus || focus.toLowerCase().includes('function')) {
      suggestions.push({
        id: 'sugg-func-001',
        type: 'functional_blocks_organization',
        content: 'Group related functional blocks into logical modules for better organization',
        reason: 'Modular organization improves code maintainability and team collaboration'
      });
    }
    
    if (!focus || focus.toLowerCase().includes('schedule')) {
      suggestions.push({
        id: 'sugg-sched-001',
        type: 'schedule_optimization',
        content: 'Add buffer time between dependent stages in your project schedule',
        reason: 'Schedule buffers help accommodate unexpected delays and reduce project timeline risks'
      });
    }
    
    // Simulate a slight delay to mimic AI processing time
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return suggestions;
  }
}

// Export a singleton instance of the service
export const aiService = new AiService();