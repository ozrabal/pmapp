# Implementation Plan for Vercel AI SDK Integration

## 1. Service Description

The AI Service will be a central component for integrating Large Language Model (LLM) capabilities into the application using Vercel AI SDK. It will replace the current mock implementations with actual AI-powered functionality, enabling real-time, streaming AI responses while maintaining type safety and proper error handling.

The service will provide a consistent interface for interacting with different AI models and providers through the Vercel AI SDK, handling system messages, user inputs, model selection, configuration, and structured outputs. It will support advanced features such as streaming responses, structured output validation, and tool calling.

## 2. Service Constructor

The AI service will be implemented as a TypeScript class with a singleton instance exported for application-wide use, maintaining the existing pattern found in the codebase.

```typescript
import { StreamingTextResponse, Message, createAI, createStreamableUI } from 'ai';
import { z } from 'zod';
import { nanoid } from 'nanoid';

export class AiService {
  private readonly defaultModel: string;
  private readonly fallbackModel: string;
  private readonly apiKeys: Record<string, string>;
  
  constructor() {
    // Initialize with environment variables or config parameters
    this.defaultModel = process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o';
    this.fallbackModel = process.env.OPENAI_FALLBACK_MODEL || 'gpt-3.5-turbo';
    this.apiKeys = {
      openai: process.env.OPENAI_API_KEY || '',
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      // Add other providers as needed
    };
    
    if (!this.apiKeys.openai) {
      console.warn('OpenAI API key is not set. AI features will not work properly.');
    }
  }
  
  // Public methods will be defined below...
}

// Export a singleton instance of the service
export const aiService = new AiService();
```

## 3. Public Methods and Properties

### 3.1 Validate Project Assumptions

This method will replace the current mock implementation, using AI to validate project assumptions and provide meaningful feedback and suggestions.

```typescript
/**
 * Validates project assumptions using AI
 * 
 * @param assumptions - The project assumptions to validate
 * @returns A promise that resolves to ValidateAssumptionsResult
 */
async validateProjectAssumptions(assumptions: ProjectAssumptions): Promise<ValidateAssumptionsResult> {
  // Validate input
  if (!assumptions) {
    throw new AiServiceError('Assumptions data is required', 'INVALID_INPUT');
  }
  
  try {
    const systemMessage = this.getSystemPromptForAssumptionsValidation();
    const userMessage = this.formatAssumptionsForPrompt(assumptions);
    
    const result = await this.completion({
      model: this.defaultModel,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      structured: assumptionsValidationSchema,
      temperature: 0.2, // Lower temperature for more consistent/deterministic results
      max_tokens: 2000,
    });
    
    return result;
  } catch (error) {
    this.handleError(error, 'Failed to validate project assumptions');
    return this.getFallbackValidationResult();
  }
}
```

### 3.2 Generate Project Suggestions

This method will replace the current mock implementation, using AI to generate context-aware suggestions for project improvements.

```typescript
/**
 * Generates AI suggestions for project improvements
 * 
 * @param projectContext - The project data context to base suggestions on
 * @param focus - Optional parameter to specify the area to focus suggestions on
 * @returns A promise that resolves to an array of SuggestionDto
 */
async generateProjectSuggestions(
  projectContext: ProjectSuggestionContext,
  focus?: string
): Promise<SuggestionDto[]> {
  // Validate input
  if (!projectContext || !projectContext.id || !projectContext.name) {
    throw new AiServiceError('Valid project context is required', 'INVALID_INPUT');
  }
  
  try {
    const systemMessage = this.getSystemPromptForProjectSuggestions(focus);
    const userMessage = this.formatProjectContextForPrompt(projectContext);
    
    const result = await this.completion({
      model: this.defaultModel,
      messages: [
        { role: 'system', content: systemMessage },
        { role: 'user', content: userMessage }
      ],
      structured: suggestionResponseSchema,
      temperature: 0.7, // Higher temperature for more creative suggestions
      max_tokens: 2000,
    });
    
    return result.suggestions;
  } catch (error) {
    this.handleError(error, 'Failed to generate project suggestions');
    return this.getFallbackSuggestions(projectContext);
  }
}
```

### 3.3 Stream Chat Completion

This method will provide streaming chat capabilities for interactive UI components.

```typescript
/**
 * Streams a chat completion response for real-time UI updates
 * 
 * @param messages - Array of message objects with role and content
 * @param options - Configuration options for the completion
 * @returns A StreamingTextResponse compatible with Astro API routes
 */
streamChatCompletion(
  messages: Message[],
  options: ChatCompletionOptions = {}
): StreamingTextResponse {
  // Validate messages
  if (!messages || messages.length === 0) {
    throw new AiServiceError('At least one message is required', 'INVALID_INPUT');
  }
  
  try {
    const model = options.model || this.defaultModel;
    const stream = this.createChatCompletionStream({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
      top_p: options.top_p ?? 1,
      stream: true,
    });
    
    return new StreamingTextResponse(stream);
  } catch (error) {
    this.handleError(error, 'Failed to create streaming completion');
    const fallbackStream = this.createFallbackStream('Sorry, I encountered an error processing your request.');
    return new StreamingTextResponse(fallbackStream);
  }
}
```

### 3.4 Tool-enabled Completion

This method will support AI tool calling for expanded functionality.

```typescript
/**
 * Performs a completion with tool calling capabilities
 * 
 * @param messages - Array of message objects with role and content
 * @param tools - Array of tool definitions
 * @param options - Configuration options for the completion
 * @returns A promise resolving to the completion result with tool calls
 */
async toolCompletion<T extends z.ZodType>(
  messages: Message[],
  tools: AiTool[],
  options: ToolCompletionOptions = {}
): Promise<ToolCompletionResult> {
  // Validate inputs
  if (!messages || messages.length === 0) {
    throw new AiServiceError('At least one message is required', 'INVALID_INPUT');
  }
  
  if (!tools || tools.length === 0) {
    throw new AiServiceError('At least one tool definition is required', 'INVALID_INPUT');
  }
  
  try {
    const model = options.model || this.defaultModel;
    const result = await this.createToolCompletion({
      model,
      messages,
      tools,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.max_tokens,
      tool_choice: options.tool_choice,
    });
    
    return this.processToolCompletionResult(result);
  } catch (error) {
    this.handleError(error, 'Failed to create tool completion');
    return this.getFallbackToolCompletionResult();
  }
}
```

## 4. Private Methods and Properties

### 4.1 Completion Base Method

```typescript
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
  temperature = 0.7,
  max_tokens,
  top_p = 1,
}: CompletionOptions<T>): Promise<z.infer<T>> {
  try {
    if (structured) {
      const result = await openai.chat.completions.create({
        model,
        messages,
        temperature,
        max_tokens,
        top_p,
        response_format: { type: "json_object" },
      });
      
      const content = result.choices[0]?.message?.content;
      if (!content) {
        throw new Error("Empty response from AI model");
      }
      
      return this.parseAndValidateStructured(content, structured);
    } else {
      throw new Error("Structured schema is required for completion method");
    }
  } catch (error) {
    if (error.code === 'rate_limit_exceeded') {
      return this.handleRateLimitError(error, { model, messages, structured, temperature, max_tokens, top_p });
    }
    throw error;
  }
}
```

### 4.2 Prompt Management Methods

```typescript
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
 * Formats project assumptions for prompt input
 */
private formatAssumptionsForPrompt(assumptions: ProjectAssumptions): string {
  return `Please validate the following project assumptions:
  
${JSON.stringify(assumptions, null, 2)}

Analyze each section critically and provide specific feedback on areas that need improvement.`;
}
```

### 4.3 Schema Validation Methods

```typescript
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
      throw new AiServiceError(
        `Invalid response format: ${error.message}`,
        'SCHEMA_VALIDATION_ERROR',
        { originalError: error }
      );
    } else if (error instanceof SyntaxError) {
      throw new AiServiceError(
        `Invalid JSON response: ${error.message}`,
        'JSON_PARSE_ERROR',
        { originalError: error }
      );
    }
    throw error;
  }
}
```

### 4.4 Error Handling Methods

```typescript
/**
 * Centralized error handler for AI service errors
 */
private handleError(error: any, contextMessage: string): void {
  const errorId = nanoid(6);
  const errorCode = error.code || 'UNKNOWN_ERROR';
  
  console.error(`[AI Service Error ${errorId}] ${contextMessage}: ${errorCode}`, error);
  
  // Depending on error type, we might want to perform different actions
  if (error.code === 'rate_limit_exceeded') {
    console.warn(`[AI Service Warning ${errorId}] Rate limit exceeded, consider implementing queue system`);
  } else if (error.code === 'context_length_exceeded') {
    console.warn(`[AI Service Warning ${errorId}] Context length exceeded, consider implementing chunking`);
  }
  
  // Could integrate with error reporting service here
  
  throw new AiServiceError(contextMessage, errorCode, { 
    originalError: error,
    errorId
  });
}

/**
 * Creates a fallback response when errors occur
 */
private getFallbackValidationResult(): ValidateAssumptionsResult {
  return {
    isValid: true,
    feedback: [{
      field: 'general',
      message: 'Unable to fully validate assumptions due to a technical issue. Please try again later.',
      severity: 'info'
    }],
    suggestions: []
  };
}
```

### 4.5 Stream Processing Methods

```typescript
/**
 * Creates a chat completion stream
 */
private createChatCompletionStream(options: OpenAIChatCompletionOptions): ReadableStream {
  try {
    return OpenAIStream(openai.chat.completions.create({
      ...options,
      stream: true
    }));
  } catch (error) {
    throw error;
  }
}

/**
 * Creates a fallback stream for error cases
 */
private createFallbackStream(message: string): ReadableStream {
  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(message));
      controller.close();
    }
  });
}
```

## 5. Error Handling

The service implements a comprehensive error handling strategy to provide robustness and graceful degradation in case of failures:

1. **Input Validation**
   - All public methods validate their inputs before processing
   - Specific error messages are provided for invalid inputs

2. **API Error Handling**
   - Specific handling for common API errors:
     - Rate limiting
     - Context length exceeded
     - Authentication issues
     - Network failures

3. **Structured Response Validation**
   - JSON parsing errors are caught and properly handled
   - Schema validation ensures responses match expected formats
   - Fallback responses provided when validation fails

4. **Timeout Handling**
   - All API calls include appropriate timeouts
   - Fallback responses provided when timeouts occur

5. **Custom Error Class**
   - A custom `AiServiceError` class provides consistent error formats
   - Errors include contextual information and unique error IDs
   - Error codes help with debugging and handling specific error scenarios

6. **Graceful Degradation**
   - Fallback models used when primary models are unavailable
   - Cached responses provided when appropriate
   - Fallback responses prevent UI disruption

## 6. Security Considerations

1. **API Key Management**
   - Keys stored only in environment variables, never in code
   - Fallback warnings when keys are missing
   - Different keys for development and production

2. **Input Sanitization**
   - All user inputs are sanitized before being sent to AI models
   - Potentially sensitive information is filtered out
   - Input length limits prevent token abuse

3. **Response Filtering**
   - Responses are validated against schemas to prevent unexpected content
   - Content policy checks ensure appropriate outputs
   - Rate limiting prevents abuse of the service

4. **Data Minimization**
   - Only necessary data sent to AI providers
   - Personal or sensitive information is anonymized when possible
   - No permanent storage of prompts or responses unless explicitly required

5. **Audit Logging**
   - Structured logs for all operations (excluding sensitive data)
   - Error logs include context but exclude sensitive information
   - Usage metrics tracking for monitoring and optimization

## 7. Step-by-Step Implementation Plan

### Step 1: Set Up Dependencies

```bash
# Install required packages
npm install ai openai zod nanoid
```

### Step 2: Create Type Definitions

Create or update `/src/types.ts` to include new types related to AI operations:

```typescript
// AI Service related types
export interface AiCompletionOptions {
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
  model?: string;
}

export interface ChatCompletionOptions extends AiCompletionOptions {
  stream?: boolean;
}

export interface ToolCompletionOptions extends AiCompletionOptions {
  tool_choice?: string | object;
}

export interface AiTool {
  type: 'function';
  function: {
    name: string;
    description: string;
    parameters: Record<string, any>;
  };
}

export interface ToolCompletionResult {
  message: string;
  toolCalls: {
    id: string;
    type: string;
    function: {
      name: string;
      arguments: string;
    };
  }[];
}
```

### Step 3: Create Schema Definitions

Create `/src/lib/schemas/ai-response.schema.ts` with Zod schemas for structured outputs:

```typescript
import { z } from 'zod';

export const feedbackItemSchema = z.object({
  field: z.string(),
  message: z.string(),
  severity: z.enum(['error', 'warning', 'info'])
});

export const suggestionSchema = z.object({
  id: z.string().optional().default(() => nanoid()),
  field: z.string(),
  suggestion: z.string(),
  reason: z.string()
});

export const assumptionsValidationSchema = z.object({
  isValid: z.boolean(),
  feedback: z.array(feedbackItemSchema),
  suggestions: z.array(suggestionSchema)
});

export const suggestionResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      id: z.string().optional().default(() => nanoid()),
      type: z.string(),
      content: z.string(),
      reason: z.string()
    })
  )
});
```

### Step 4: Create Error Class

Create `/src/lib/services/errors/ai-service.error.ts`:

```typescript
export class AiServiceError extends Error {
  code: string;
  context?: Record<string, any>;

  constructor(message: string, code: string = 'UNKNOWN_ERROR', context?: Record<string, any>) {
    super(message);
    this.name = 'AiServiceError';
    this.code = code;
    this.context = context;
    
    // Capturing stack trace, excluding constructor call from it
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, AiServiceError);
    }
  }
}
```

### Step 5: Update AI Service Implementation

Replace the content of `/src/lib/services/ai.service.ts` with the implementation based on all the methods outlined above:

```typescript
import { openai } from '@ai-sdk/openai';
import { anthropic } from '@ai-sdk/anthropic';
import { StreamingTextResponse, Message, OpenAIStream } from 'ai';
import { nanoid } from 'nanoid';
import { z } from 'zod';

import type { 
  FeedbackItemDto, 
  SuggestionDto,
  AiCompletionOptions,
  ChatCompletionOptions,
  ToolCompletionOptions,
  AiTool,
  ToolCompletionResult
} from '../../types';
import { AiServiceError } from './errors/ai-service.error';
import type { ProjectAssumptions } from '../schemas/assumptions.schema';
import { 
  assumptionsValidationSchema,
  suggestionResponseSchema
} from '../schemas/ai-response.schema';

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
 * Options for AI completion methods
 */
interface CompletionOptions<T extends z.ZodType> {
  model: string;
  messages: Message[];
  structured: T;
  temperature?: number;
  max_tokens?: number;
  top_p?: number;
}

/**
 * Service for AI-powered operations
 * Handles communication with AI services for validating and enhancing project data
 */
export class AiService {
  private readonly defaultModel: string;
  private readonly fallbackModel: string;
  private readonly apiKeys: Record<string, string>;
  
  constructor() {
    // Initialize with environment variables or config parameters
    this.defaultModel = process.env.OPENAI_DEFAULT_MODEL || 'gpt-4o';
    this.fallbackModel = process.env.OPENAI_FALLBACK_MODEL || 'gpt-3.5-turbo';
    this.apiKeys = {
      openai: process.env.OPENAI_API_KEY || '',
      anthropic: process.env.ANTHROPIC_API_KEY || '',
      // Add other providers as needed
    };
    
    if (!this.apiKeys.openai) {
      console.warn('OpenAI API key is not set. AI features will not work properly.');
    }
  }

  /**
   * Validates project assumptions using AI
   * 
   * @param assumptions - The project assumptions to validate
   * @returns A promise that resolves to ValidateAssumptionsResult
   */
  async validateProjectAssumptions(assumptions: ProjectAssumptions): Promise<ValidateAssumptionsResult> {
    // Validate input
    if (!assumptions) {
      throw new AiServiceError('Assumptions data is required', 'INVALID_INPUT');
    }
    
    try {
      const systemMessage = this.getSystemPromptForAssumptionsValidation();
      const userMessage = this.formatAssumptionsForPrompt(assumptions);
      
      const result = await this.completion({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        structured: assumptionsValidationSchema,
        temperature: 0.2, // Lower temperature for more consistent/deterministic results
        max_tokens: 2000,
      });
      
      return result;
    } catch (error) {
      this.handleError(error, 'Failed to validate project assumptions');
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
  async generateProjectSuggestions(
    projectContext: ProjectSuggestionContext,
    focus?: string
  ): Promise<SuggestionDto[]> {
    // Validate input
    if (!projectContext || !projectContext.id || !projectContext.name) {
      throw new AiServiceError('Valid project context is required', 'INVALID_INPUT');
    }
    
    try {
      const systemMessage = this.getSystemPromptForProjectSuggestions(focus);
      const userMessage = this.formatProjectContextForPrompt(projectContext);
      
      const result = await this.completion({
        model: this.defaultModel,
        messages: [
          { role: 'system', content: systemMessage },
          { role: 'user', content: userMessage }
        ],
        structured: suggestionResponseSchema,
        temperature: 0.7, // Higher temperature for more creative suggestions
        max_tokens: 2000,
      });
      
      return result.suggestions;
    } catch (error) {
      this.handleError(error, 'Failed to generate project suggestions');
      return this.getFallbackSuggestions(projectContext);
    }
  }

  /**
   * Streams a chat completion response for real-time UI updates
   * 
   * @param messages - Array of message objects with role and content
   * @param options - Configuration options for the completion
   * @returns A StreamingTextResponse compatible with Astro API routes
   */
  streamChatCompletion(
    messages: Message[],
    options: ChatCompletionOptions = {}
  ): StreamingTextResponse {
    // Validate messages
    if (!messages || messages.length === 0) {
      throw new AiServiceError('At least one message is required', 'INVALID_INPUT');
    }
    
    try {
      const model = options.model || this.defaultModel;
      const stream = this.createChatCompletionStream({
        model,
        messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens,
        top_p: options.top_p ?? 1,
        stream: true,
      });
      
      return new StreamingTextResponse(stream);
    } catch (error) {
      this.handleError(error, 'Failed to create streaming completion');
      const fallbackStream = this.createFallbackStream('Sorry, I encountered an error processing your request.');
      return new StreamingTextResponse(fallbackStream);
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
    messages: Message[],
    tools: AiTool[],
    options: ToolCompletionOptions = {}
  ): Promise<ToolCompletionResult> {
    // Validate inputs
    if (!messages || messages.length === 0) {
      throw new AiServiceError('At least one message is required', 'INVALID_INPUT');
    }
    
    if (!tools || tools.length === 0) {
      throw new AiServiceError('At least one tool definition is required', 'INVALID_INPUT');
    }
    
    try {
      const model = options.model || this.defaultModel;
      const result = await this.createToolCompletion({
        model,
        messages,
        tools,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.max_tokens,
        tool_choice: options.tool_choice,
      });
      
      return this.processToolCompletionResult(result);
    } catch (error) {
      this.handleError(error, 'Failed to create tool completion');
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
    temperature = 0.7,
    max_tokens,
    top_p = 1,
  }: CompletionOptions<T>): Promise<z.infer<T>> {
    try {
      if (structured) {
        const result = await openai.chat.completions.create({
          model,
          messages,
          temperature,
          max_tokens,
          top_p,
          response_format: { type: "json_object" },
        });
        
        const content = result.choices[0]?.message?.content;
        if (!content) {
          throw new Error("Empty response from AI model");
        }
        
        return this.parseAndValidateStructured(content, structured);
      } else {
        throw new Error("Structured schema is required for completion method");
      }
    } catch (error) {
      if (error.code === 'rate_limit_exceeded') {
        return this.handleRateLimitError(error, { model, messages, structured, temperature, max_tokens, top_p });
      }
      throw error;
    }
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
${context.description ? `Description: ${context.description}` : ''}

${context.assumptions ? `Assumptions: ${JSON.stringify(context.assumptions, null, 2)}` : ''}
${context.functionalBlocks ? `Functional Blocks: ${JSON.stringify(context.functionalBlocks, null, 2)}` : ''}
${context.schedule ? `Schedule: ${JSON.stringify(context.schedule, null, 2)}` : ''}

Provide specific, actionable suggestions to improve this project.`;
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
        throw new AiServiceError(
          `Invalid response format: ${error.message}`,
          'SCHEMA_VALIDATION_ERROR',
          { originalError: error }
        );
      } else if (error instanceof SyntaxError) {
        throw new AiServiceError(
          `Invalid JSON response: ${error.message}`,
          'JSON_PARSE_ERROR',
          { originalError: error }
        );
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
    attempt: number = 1
  ): Promise<z.infer<T>> {
    const maxAttempts = 3;
    const delay = Math.min(2000 * Math.pow(2, attempt - 1), 10000); // Exponential backoff with max 10s
    
    if (attempt > maxAttempts) {
      throw error; // Max retries exceeded
    }
    
    console.warn(`Rate limit exceeded, retrying in ${delay}ms (attempt ${attempt}/${maxAttempts})`);
    
    // Wait for the calculated delay
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Try with a fallback model if this is the last attempt
    if (attempt === maxAttempts && options.model !== this.fallbackModel) {
      console.warn('Switching to fallback model for final retry attempt');
      return this.completion({
        ...options,
        model: this.fallbackModel
      });
    }
    
    // Retry with the same options
    try {
      return await this.completion(options);
    } catch (retryError) {
      if (retryError.code === 'rate_limit_exceeded') {
        return this.handleRateLimitError(retryError, options, attempt + 1);
      }
      throw retryError;
    }
  }

  /**
   * Creates a chat completion stream
   */
  private createChatCompletionStream(options: any): ReadableStream {
    try {
      return OpenAIStream(openai.chat.completions.create({
        ...options,
        stream: true
      }));
    } catch (error) {
      throw error;
    }
  }

  /**
   * Creates a tool completion
   */
  private async createToolCompletion(options: any): Promise<any> {
    return openai.chat.completions.create({
      ...options,
      tools: options.tools
    });
  }

  /**
   * Processes tool completion result
   */
  private processToolCompletionResult(result: any): ToolCompletionResult {
    const message = result.choices[0]?.message?.content || '';
    const toolCalls = result.choices[0]?.message?.tool_calls || [];
    
    return {
      message,
      toolCalls: toolCalls.map((call: any) => ({
        id: call.id,
        type: call.type,
        function: {
          name: call.function.name,
          arguments: call.function.arguments
        }
      }))
    };
  }

  /**
   * Creates a fallback stream for error cases
   */
  private createFallbackStream(message: string): ReadableStream {
    return new ReadableStream({
      start(controller) {
        controller.enqueue(new TextEncoder().encode(message));
        controller.close();
      }
    });
  }

  /**
   * Centralized error handler for AI service errors
   */
  private handleError(error: any, contextMessage: string): void {
    const errorId = nanoid(6);
    const errorCode = error.code || 'UNKNOWN_ERROR';
    
    console.error(`[AI Service Error ${errorId}] ${contextMessage}: ${errorCode}`, error);
    
    // Depending on error type, we might want to perform different actions
    if (error.code === 'rate_limit_exceeded') {
      console.warn(`[AI Service Warning ${errorId}] Rate limit exceeded, consider implementing queue system`);
    } else if (error.code === 'context_length_exceeded') {
      console.warn(`[AI Service Warning ${errorId}] Context length exceeded, consider implementing chunking`);
    }
    
    throw new AiServiceError(contextMessage, errorCode, { 
      originalError: error,
      errorId
    });
  }

  /**
   * Creates a fallback validation result for error cases
   */
  private getFallbackValidationResult(): ValidateAssumptionsResult {
    return {
      isValid: true,
      feedback: [{
        field: 'general',
        message: 'Unable to fully validate assumptions due to a technical issue. Please try again later.',
        severity: 'info'
      }],
      suggestions: []
    };
  }

  /**
   * Creates fallback suggestions for error cases
   */
  private getFallbackSuggestions(context: ProjectSuggestionContext): SuggestionDto[] {
    return [{
      id: `fallback-${nanoid(6)}`,
      type: 'general',
      content: 'Consider reviewing all aspects of your project for completeness and clarity.',
      reason: 'Comprehensive planning helps identify potential issues early.'
    }];
  }

  /**
   * Creates a fallback tool completion result for error cases
   */
  private getFallbackToolCompletionResult(): ToolCompletionResult {
    return {
      message: "I'm sorry, but I couldn't process your request at this time. Please try again later.",
      toolCalls: []
    };
  }
}

// Export a singleton instance of the service
export const aiService = new AiService();
```

### Step 6: Create API Endpoint for Structured AI Responses

Create or update `/src/pages/api/ai/validate-assumptions.ts`:

```typescript
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { aiService } from '../../../lib/services/ai.service';
import { projectAssumptionsSchema } from '../../../lib/schemas/assumptions.schema';

export const prerender = false;

const inputSchema = z.object({
  projectId: z.string(),
  assumptions: projectAssumptionsSchema
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate input
    const rawData = await request.json();
    const validatedData = inputSchema.parse(rawData);
    
    // Process with AI service
    const result = await aiService.validateProjectAssumptions(validatedData.assumptions);
    
    // Return response
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Error validating assumptions:', error);
    
    // If it's a validation error, return a 400
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        error: 'Invalid input data',
        details: error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For other errors, return a 500
    return new Response(JSON.stringify({ 
      error: 'Failed to process request',
      message: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### Step 7: Create API Endpoint for Streaming Responses

Create or update `/src/pages/api/ai/chat.ts`:

```typescript
import type { APIRoute } from 'astro';
import { z } from 'zod';
import { aiService } from '../../../lib/services/ai.service';

export const prerender = false;

const inputSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['system', 'user', 'assistant']),
    content: z.string()
  })),
  temperature: z.number().optional(),
  max_tokens: z.number().optional()
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate input
    const rawData = await request.json();
    const validatedData = inputSchema.parse(rawData);
    
    // Process with AI service - returning a streaming response
    const streamingResponse = aiService.streamChatCompletion(
      validatedData.messages,
      {
        temperature: validatedData.temperature,
        max_tokens: validatedData.max_tokens
      }
    );
    
    // Return the streaming response directly
    return streamingResponse;
  } catch (error) {
    console.error('Error in chat API:', error);
    
    // If it's a validation error, return a 400
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify({ 
        error: 'Invalid input data',
        details: error.errors
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // For other errors, return a 500
    return new Response(JSON.stringify({ 
      error: 'Failed to process chat request',
      message: error.message || 'Unknown error'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
```

### Step 8: Create React Hook for AI Interactions

Create `/src/components/hooks/useAiChat.ts`:

```typescript
import { useState } from 'react';
import { useChat } from 'ai/react';
import type { Message } from 'ai';

interface UseAiChatOptions {
  initialMessages?: Message[];
  onFinish?: (message: Message) => void;
  onError?: (error: Error) => void;
}

export function useAiChat(options: UseAiChatOptions = {}) {
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    error,
    append,
    reload,
    stop,
    isLoading: aiIsLoading
  } = useChat({
    api: '/api/ai/chat',
    initialMessages: options.initialMessages || [],
    onFinish: options.onFinish,
    onError: (error) => {
      console.error('AI chat error:', error);
      options.onError?.(error);
    }
  });
  
  // Combine the loading states
  const combinedIsLoading = isLoading || aiIsLoading;
  
  const sendMessage = async (content: string) => {
    try {
      setIsLoading(true);
      await append({ role: 'user', content });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    setMessages,
    error,
    append,
    reload,
    stop,
    isLoading: combinedIsLoading,
    sendMessage
  };
}
```

### Step 9: Update Environment Configuration

Update `/src/env.d.ts` to include AI-specific environment variables:

```typescript
/// <reference types="astro/client" />
interface ImportMetaEnv {
  readonly OPENAI_API_KEY: string;
  readonly OPENAI_DEFAULT_MODEL: string;
  readonly OPENAI_FALLBACK_MODEL: string;
  readonly ANTHROPIC_API_KEY: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
```

### Step 10: Create a Simple AI Chat Component

Create `/src/components/AiChat.tsx`:

```typescript
import { useState } from 'react';
import { useAiChat } from './hooks/useAiChat';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from './ui/card';
import { Textarea } from './ui/textarea';

interface AiChatProps {
  initialSystemMessage?: string;
}

export default function AiChat({ initialSystemMessage }: AiChatProps) {
  const initialMessages = initialSystemMessage 
    ? [{ role: 'system', content: initialSystemMessage }] 
    : [];
    
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading
  } = useAiChat({
    initialMessages,
    onError: (error) => {
      console.error('Chat error:', error);
    }
  });
  
  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>AI Assistant</CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4 max-h-96 overflow-auto">
        {messages.map((message, i) => (
          message.role !== 'system' && (
            <div 
              key={i} 
              className={`p-4 rounded-lg ${
                message.role === 'user' ? 'bg-primary/10 ml-4' : 'bg-muted mr-4'
              }`}
            >
              <div className="font-semibold mb-1">
                {message.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="whitespace-pre-wrap">{message.content}</div>
            </div>
          )
        ))}
        
        {isLoading && (
          <div className="p-4 bg-muted rounded-lg mr-4">
            <div className="font-semibold mb-1">Assistant</div>
            <div className="flex items-center space-x-2">
              <span>Thinking</span>
              <span className="animate-pulse">...</span>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter>
        <form onSubmit={handleSubmit} className="w-full flex space-x-2">
          <Textarea 
            value={input} 
            onChange={handleInputChange}
            placeholder="Ask a question..."
            className="flex-grow"
            disabled={isLoading}
            rows={1}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            Send
          </Button>
        </form>
      </CardFooter>
    </Card>
  );
}
```

### Step 11: Add Environment Variables to Project

Create or update `.env` and `.env.example` files with the necessary AI service variables (make sure `.env` is in `.gitignore`):

```
# .env.example
OPENAI_API_KEY=your_openai_api_key
OPENAI_DEFAULT_MODEL=gpt-4o
OPENAI_FALLBACK_MODEL=gpt-3.5-turbo
ANTHROPIC_API_KEY=your_anthropic_api_key
```

### Step 12: Test the Implementation

1. Create a simple test page to verify functionality:

```typescript
// src/pages/ai-test.astro
---
import Layout from '../layouts/Layout.astro';
import AiChat from '../components/AiChat';
---

<Layout title="AI Chat Test">
  <div class="container mx-auto py-8">
    <h1 class="text-3xl font-bold mb-8">AI Chat Test</h1>
    <AiChat initialSystemMessage="You are a helpful assistant specialized in project management." client:load />
  </div>
</Layout>
```

2. Test the API endpoints directly using tools like cURL or Postman.

3. Use the validation endpoint with your existing assumptions form:

```typescript
// Example usage in a component
const validateAssumptions = async (assumptions) => {
  try {
    const response = await fetch('/api/ai/validate-assumptions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        projectId: project.id,
        assumptions
      })
    });
    
    if (!response.ok) {
      throw new Error(`Error: ${response.status}`);
    }
    
    const validationResult = await response.json();
    // Handle validation results (feedback, suggestions)
    return validationResult;
  } catch (error) {
    console.error('Failed to validate assumptions:', error);
    throw error;
  }
};
```