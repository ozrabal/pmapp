import { OpenAI } from "openai";
import { nanoid } from "nanoid";
import { z } from "zod";

import type {
  FeedbackItemDto,
  SuggestionDto,
  ToolCompletionOptions,
  AiTool,
  ToolCompletionResult,
  MessageRequest,
} from "../../types";
import { AiServiceError } from "./errors/ai-service.error";
import type { ProjectAssumptions } from "../schemas/assumptions.schema";
import { assumptionsValidationSchema, suggestionResponseSchema } from "../schemas/ai-response.schema";

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
  assumptions: unknown | null;
  functionalBlocks: unknown | null;
  schedule: unknown | null;
}

/**
 * Options for AI completion methods
 */
interface CompletionOptions<T extends z.ZodType> {
  model: string;
  messages: MessageRequest[];
  structured: T;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

// Helper to check if we're running in a browser environment
const isBrowser = () => {
  return typeof window !== "undefined";
};

/**
 * Service for AI-powered operations
 * Handles communication with AI services for validating and enhancing project data
 */
export class AiService {
  private readonly defaultModel: string;
  private readonly fallbackModel: string;
  private readonly apiKey: string;
  private readonly openai: OpenAI | null;
  // Expanded list of models that don't support custom temperature settings
  private readonly modelsWithoutTemperatureSupport: string[] = [
    "gpt-4o-mini",
    "gpt-4o-2024-05-13",
    "gpt-4o",
    "gpt-4o-2024-05",
    // Add any other potential variants
    "gpt-4o-preview",
    "gpt-4-all-sense",
    "gpt-4-vision-preview",
    "gpt-4-all-tools",
  ];

  constructor() {
    // Initialize with environment variables
    this.defaultModel = import.meta.env.OPENAI_DEFAULT_MODEL || "gpt-4o";
    this.fallbackModel = import.meta.env.OPENAI_FALLBACK_MODEL || "gpt-3.5-turbo";
    this.apiKey = import.meta.env.OPENAI_API_KEY || "";

    // Only initialize OpenAI client on the server side
    if (!isBrowser()) {
      if (!this.apiKey) {
        console.warn("OpenAI API key is not set. AI features will not work properly.");
      }

      this.openai = new OpenAI({
        apiKey: this.apiKey,
      });
    } else {
      // In browser environment, set to null
      this.openai = null;
    }
  }

  // Check if we're able to use OpenAI services (only on server)
  private ensureServerEnvironment() {
    if (isBrowser() || !this.openai) {
      throw new AiServiceError("OpenAI operations can only be performed on the server", "SERVER_ONLY_OPERATION");
    }
  }

  /**
   * Validates project assumptions using AI
   *
   * @param assumptions - The project assumptions to validate
   * @returns A promise that resolves to ValidateAssumptionsResult
   */
  async validateProjectAssumptions(assumptions: ProjectAssumptions): Promise<ValidateAssumptionsResult> {
    this.ensureServerEnvironment();

    // Validate input
    if (!assumptions) {
      throw new AiServiceError("Assumptions data is required", "INVALID_INPUT");
    }

    try {
      const systemMessage = this.getSystemPromptForAssumptionsValidation();
      const userMessage = this.formatAssumptionsForPrompt(assumptions);

      const result = await this.completion({
        model: this.defaultModel,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        structured: assumptionsValidationSchema,
        temperature: 1, // Lower temperature for more consistent/deterministic results
        max_tokens: 2000,
      });

      return result;
    } catch (error) {
      this.handleError(error, "Failed to validate project assumptions");
      return this.getFallbackValidationResult();
    }
  }

  /**
   * Generates AI suggestions for project improvements
   *
   * @param projectContext - The project data context to base suggestions on
   * @param focus - Optional parameter to specify the area to focus suggestions on
   * @returns A promise that resolves to an array of SuggestionDto
   */
  async generateProjectSuggestions(projectContext: ProjectSuggestionContext, focus?: string): Promise<SuggestionDto[]> {
    this.ensureServerEnvironment();

    // Validate input
    if (!projectContext || !projectContext.id || !projectContext.name) {
      throw new AiServiceError("Valid project context is required", "INVALID_INPUT");
    }

    try {
      const systemMessage = this.getSystemPromptForProjectSuggestions(focus);
      const userMessage = this.formatProjectContextForPrompt(projectContext);

      const result = await this.completion({
        model: this.defaultModel,
        messages: [
          { role: "system", content: systemMessage },
          { role: "user", content: userMessage },
        ],
        structured: suggestionResponseSchema,
        temperature: 1, // Higher temperature for more creative suggestions
        max_tokens: 2000,
      });

      return result.suggestions;
    } catch (error) {
      this.handleError(error, "Failed to generate project suggestions");
      return this.getFallbackSuggestions(projectContext);
    }
  }

  /**
   * Performs a completion with tool calling capabilities
   *
   * @param messages - Array of message objects with role and content
   * @param tools - Array of tool definitions
   * @param options - Configuration options for the completion
   * @returns A promise resolving to the completion result with tool calls
   */
  async toolCompletion(
    messages: MessageRequest[],
    tools: AiTool[],
    options: ToolCompletionOptions = {}
  ): Promise<ToolCompletionResult> {
    this.ensureServerEnvironment();

    // Validate inputs
    if (!messages || messages.length === 0) {
      throw new AiServiceError("At least one message is required", "INVALID_INPUT");
    }

    if (!tools || tools.length === 0) {
      throw new AiServiceError("At least one tool definition is required", "INVALID_INPUT");
    }

    try {
      const model = options.model || this.defaultModel;
      const result = await this.createToolCompletion({
        model,
        messages,
        tools,
        temperature: options.temperature ?? 1,
        max_tokens: options.max_tokens,
        tool_choice: options.tool_choice,
      });

      return this.processToolCompletionResult(result);
    } catch (error) {
      this.handleError(error, "Failed to create tool completion");
      return this.getFallbackToolCompletionResult();
    }
  }

  /**
   * Base method for AI completions with structured output support
   *
   * @param options - Configuration options for the completion
   * @returns A promise resolving to the structured completion result
   */
  private async completion<T extends z.ZodType>({
    model,
    messages,
    structured,
    temperature = 1,
    max_tokens,
    top_p = 1,
  }: CompletionOptions<T>): Promise<z.infer<T>> {
    this.ensureServerEnvironment();

    try {
      if (structured) {
        // Check if the model supports temperature settings
        const adjustedTemperature = this.modelsWithoutTemperatureSupport.includes(model) ? undefined : temperature;

        const result = await this.openai?.chat.completions.create({
          model,
          messages,
          temperature: adjustedTemperature,
          max_completion_tokens: max_tokens,
          top_p,
          response_format: { type: "json_object" },
        });

        if (!result) {
          throw new Error("Failed to get response from AI model");
        }

        const content = result.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Empty response from AI model");
        }

        return this.parseAndValidateStructured(content, structured);
      } else {
        throw new Error("Structured schema is required for completion method");
      }
    } catch (error) {
      if (error.code === "rate_limit_exceeded") {
        return this.handleRateLimitError(error, { model, messages, structured, temperature, max_tokens, top_p });
      }
      throw error;
    }
  }

  /**
   * Parses and validates structured output against a Zod schema
   */
  private parseAndValidateStructured<T extends z.ZodType>(content: string, schema: T): z.infer<T> {
    try {
      // First parse as JSON
      const parsed = JSON.parse(content);

      // Then validate against schema
      const validated = schema.parse(parsed);
      return validated;
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new AiServiceError(`Invalid response format: ${error.message}`, "SCHEMA_VALIDATION_ERROR", {
          originalError: error,
        });
      } else if (error instanceof SyntaxError) {
        throw new AiServiceError(`Invalid JSON response: ${error.message}`, "JSON_PARSE_ERROR", {
          originalError: error,
        });
      }
      throw error;
    }
  }

  /**
   * Handles rate limit errors with exponential backoff retry
   */
  private async handleRateLimitError<T extends z.ZodType>(
    error: any,
    options: CompletionOptions<T>,
    attempt = 1
  ): Promise<z.infer<T>> {
    const maxAttempts = 3;
    const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff with max 10s

    if (attempt > maxAttempts) {
      throw error; // Max retries exceeded
    }

    console.warn(`Rate limit exceeded, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);

    // Wait for the calculated delay
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Try with a fallback model if this is the last attempt
    if (attempt === maxAttempts && options.model !== this.fallbackModel) {
      console.warn("Switching to fallback model for final retry attempt");
      return this.completion({
        ...options,
        model: this.fallbackModel,
      });
    }

    // Retry with the same options
    try {
      return await this.completion(options);
    } catch (retryError) {
      if (retryError.code === "rate_limit_exceeded") {
        return this.handleRateLimitError(retryError, options, attempt + 1);
      }
      throw retryError;
    }
  }

  /**
   * Processes tool completion result
   */
  private processToolCompletionResult(result: any): ToolCompletionResult {
    const message = result.choices[0]?.message?.content || "";
    const toolCalls = result.choices[0]?.message?.tool_calls || [];

    return {
      message,
      toolCalls: toolCalls.map((call: any) => ({
        id: call.id,
        type: call.type,
        function: {
          name: call.function.name,
          arguments: call.function.arguments,
        },
      })),
    };
  }

  /**
   * Centralized error handler for AI service errors
   */
  private handleError(error: any, contextMessage: string): void {
    const errorId = nanoid(6);
    const errorCode = error.code || "UNKNOWN_ERROR";

    console.error(`[AI Service Error ${errorId}] ${contextMessage}: ${errorCode}`, error);

    // Depending on error type, we might want to perform different actions
    if (error.code === "rate_limit_exceeded") {
      console.warn(`[AI Service Warning ${errorId}] Rate limit exceeded, consider implementing queue system`);
    } else if (error.code === "context_length_exceeded") {
      console.warn(`[AI Service Warning ${errorId}] Context length exceeded, consider implementing chunking`);
    }

    throw new AiServiceError(contextMessage, errorCode, {
      originalError: error,
      errorId,
    });
  }

  /**
   * Creates a fallback validation result for error cases
   */
  private getFallbackValidationResult(): ValidateAssumptionsResult {
    return {
      isValid: true,
      feedback: [
        {
          field: "general",
          message: "Unable to fully validate assumptions due to a technical issue. Please try again later.",
          severity: "info",
        },
      ],
      suggestions: [],
    };
  }

  /**
   * Creates fallback suggestions for error cases
   */
  private getFallbackSuggestions(): SuggestionDto[] {
    return [
      {
        id: `fallback-${nanoid(6)}`,
        type: "general",
        content: "Consider reviewing all aspects of your project for completeness and clarity.",
        reason: "Comprehensive planning helps identify potential issues early.",
      },
    ];
  }

  /**
   * Creates a fallback tool completion result for error cases
   */
  private getFallbackToolCompletionResult(): ToolCompletionResult {
    return {
      message: "I'm sorry, but I couldn't process your request at this time. Please try again later.",
      toolCalls: [],
    };
  }

  /**
   * Gets the system prompt for assumptions validation
   */
  private getSystemPromptForAssumptionsValidation(): string {
    return `You are an expert project management assistant specialized in validating project assumptions.
Your task is to analyze the provided project assumptions and provide constructive feedback.
For each assumption area, identify potential issues, inconsistencies, or missing information.
Your response should follow this JSON structure exactly:
{
  "isValid": boolean,
  "feedback": [
    {
      "field": "string",
      "message": "string",
      "severity": "error" | "warning" | "info"
    }
  ],
  "suggestions": [
    {
      "id": "string",
      "field": "string",
      "suggestion": "string",
      "reason": "string"
    }
  ]
}`;
  }

  /**
   * Gets the system prompt for project suggestions
   */
  private getSystemPromptForProjectSuggestions(focus?: string): string {
    let prompt = `You are an expert project management assistant specialized in providing project improvement suggestions.
Your task is to analyze the provided project data and generate constructive suggestions.`;

    if (focus) {
      prompt += `\nFocus your suggestions specifically on the "${focus}" aspect of the project.`;
    }

    prompt += `\nYour response should follow this JSON structure exactly:
{
  "suggestions": [
    {
      "id": "string",
      "type": "string",
      "content": "string",
      "reason": "string"
    }
  ]
}`;

    return prompt;
  }

  /**
   * Formats project assumptions for prompt input
   */
  private formatAssumptionsForPrompt(assumptions: ProjectAssumptions): string {
    return `Please validate the following project assumptions:
    
${JSON.stringify(assumptions, null, 2)}

Analyze each section critically and provide specific feedback on areas that need improvement.`;
  }

  /**
   * Formats project context for prompt input
   */
  private formatProjectContextForPrompt(context: ProjectSuggestionContext): string {
    return `Please generate suggestions for the following project:
    
Project Name: ${context.name}
${context.description ? `Description: ${context.description}` : ""}

${context.assumptions ? `Assumptions: ${JSON.stringify(context.assumptions, null, 2)}` : ""}
${context.functionalBlocks ? `Functional Blocks: ${JSON.stringify(context.functionalBlocks, null, 2)}` : ""}
${context.schedule ? `Schedule: ${JSON.stringify(context.schedule, null, 2)}` : ""}

Provide specific, actionable suggestions to improve this project.`;
  }

  /**
   * Creates a tool completion
   */
  private async createToolCompletion(options: any): Promise<any> {
    this.ensureServerEnvironment();

    return this.openai?.chat.completions.create({
      ...options,
      tools: options.tools,
    });
  }
}

// Export a singleton instance of the service
export const aiService = new AiService();
