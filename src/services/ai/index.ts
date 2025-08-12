import { z } from "zod";
import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import type { LanguageModelUsage } from "ai";
import { AiModel } from "@/api/modules/chat/consts";

const TextGenerationInputSchema = z.object({
  prompt: z.string().min(1, "Prompt cannot be empty"),
  system: z.string().optional(),
  model: z.enum([AiModel.GPT_4O, AiModel.GPT_4O_MINI, AiModel.GPT_3_5_TURBO]).default(AiModel.GPT_4O_MINI),
  temperature: z.number().min(0).max(2).optional(),
});

const ChatInputSchema = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().min(1),
      })
    )
    .min(1, "At least one message is required"),
  model: z.enum([AiModel.GPT_4O, AiModel.GPT_4O_MINI, AiModel.GPT_3_5_TURBO]).default(AiModel.GPT_4O_MINI),
  temperature: z.number().min(0).max(2).optional(),
});

// Response types
export interface AIServiceResponse<T = string> {
  success: boolean;
  data?: T;
  error?: string;
  usage?: LanguageModelUsage;
}

export interface TextGenerationResponse {
  text: string;
  finishReason: string;
  usage: LanguageModelUsage;
}

// Input types
export type TextGenerationInput = z.infer<typeof TextGenerationInputSchema>;
export type ChatInput = z.infer<typeof ChatInputSchema>;

/**
 * AI Service for text generation using OpenAI models
 * Can be used both on frontend and backend
 */
export class AIService {
  private static instance: AIService;
  private openaiClient: ReturnType<typeof createOpenAI>;

  private constructor(apiKey?: string) {
    // Configure OpenAI client with custom API key or use environment variable
    this.openaiClient = createOpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  public static getInstance(apiKey?: string): AIService {
    if (!AIService.instance) {
      AIService.instance = new AIService(apiKey);
    }
    return AIService.instance;
  }

  /**
   * Create a new instance with a specific API key
   * Useful when you need different instances with different API keys
   */
  public static createInstance(apiKey: string): AIService {
    return new AIService(apiKey);
  }

  /**
   * Generate text from a simple prompt
   * Suitable for completion tasks, summaries, etc.
   */
  async generateText(input: TextGenerationInput): Promise<AIServiceResponse<TextGenerationResponse>> {
    try {
      // Validate input
      const validatedInput = TextGenerationInputSchema.parse(input);

      const result = await generateText({
        model: this.openaiClient(validatedInput.model),
        prompt: validatedInput.prompt,
        system: validatedInput.system,
        temperature: validatedInput.temperature,
      });

      return {
        success: true,
        data: {
          text: result.text,
          finishReason: result.finishReason,
          usage: result.usage,
        },
        usage: result.usage,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Generate text from a conversation/chat format
   * Suitable for chat interfaces, conversational AI
   */
  async generateChatResponse(input: ChatInput): Promise<AIServiceResponse<TextGenerationResponse>> {
    try {
      // Validate input
      const validatedInput = ChatInputSchema.parse(input);

      const result = await generateText({
        model: this.openaiClient(validatedInput.model),
        messages: validatedInput.messages.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        temperature: validatedInput.temperature,
      });

      return {
        success: true,
        data: {
          text: result.text,
          finishReason: result.finishReason,
          usage: result.usage,
        },
        usage: result.usage,
      };
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Convenience method for quick text generation
   * Simplified interface for basic use cases
   */
  async quickGenerate(
    prompt: string,
    options?: {
      system?: string;
      model?: AiModel;
      temperature?: number;
    }
  ): Promise<string | null> {
    const result = await this.generateText({
      prompt,
      system: options?.system,
      model: options?.model || AiModel.GPT_4O_MINI,
      temperature: options?.temperature,
    });

    return result.success ? result.data?.text || null : null;
  }

  /**
   * Generate a summary of given text
   */
  async summarize(text: string, maxLength = 200): Promise<AIServiceResponse<TextGenerationResponse>> {
    return this.generateText({
      prompt: text,
      system: `Summarize the following text in approximately ${maxLength} characters or less. Be concise and capture the key points.`,
      model: AiModel.GPT_4O_MINI,
      temperature: 0.3,
    });
  }

  /**
   * Generate suggestions or recommendations
   */
  async generateSuggestions(context: string, count = 3): Promise<AIServiceResponse<TextGenerationResponse>> {
    return this.generateText({
      prompt: context,
      system: `Based on the provided context, generate ${count} helpful and relevant suggestions. Format them as a numbered list.`,
      model: AiModel.GPT_4O_MINI,
      temperature: 0.7,
    });
  }

  /**
   * Handle errors consistently
   */
  private handleError(error: unknown): AIServiceResponse<TextGenerationResponse> {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: `Validation error: ${error.errors.map((e) => e.message).join(", ")}`,
      };
    }

    if (error instanceof Error) {
      // Check for common OpenAI API errors
      if (error.message.includes("insufficient_quota")) {
        return {
          success: false,
          error: "OpenAI API quota exceeded",
        };
      }

      if (error.message.includes("invalid_api_key")) {
        return {
          success: false,
          error: "Invalid OpenAI API key",
        };
      }

      if (error.message.includes("rate_limit")) {
        return {
          success: false,
          error: "Rate limit exceeded. Please try again later.",
        };
      }

      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: "An unexpected error occurred",
    };
  }
}

// Export factory functions for different use cases
export function createAIService(apiKey?: string): AIService {
  if (apiKey) {
    return AIService.createInstance(apiKey);
  }
  return AIService.getInstance();
}

// Export singleton instance for convenience (uses environment variable)
export const aiService = AIService.getInstance();

// Export schemas for external validation
export { TextGenerationInputSchema, ChatInputSchema };
