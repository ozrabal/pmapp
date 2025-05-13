// filepath: /Users/piotrlepkowski/Private/pmapp/src/pages/api/ai/project-suggestions.ts
import type { APIRoute } from "astro";
import { z } from "zod";
import { AiService } from "../../../lib/services/ai.service";
import { AiServiceError } from "../../../lib/services/errors/ai-service.error";
import { OPENAI_API_KEY, OPENAI_DEFAULT_MODEL } from "astro:env/server";

export const prerender = false;

// Input validation schema
const inputSchema = z.object({
  projectId: z.string(),
  context: z
    .object({
      id: z.string(),
      name: z.string(),
      description: z.string().nullable(),
      assumptions: z.any().nullable(),
      functionalBlocks: z.any().nullable(),
      schedule: z.any().nullable(),
    })
    .transform((data) => ({
      ...data,
      assumptions: data.assumptions ?? null,
      functionalBlocks: data.functionalBlocks ?? null,
      schedule: data.schedule ?? null,
    })),
  focus: z.string().optional(),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate input
    const rawData = await request.json();
    const validatedData = inputSchema.parse(rawData);

    // Process with AI service
    const ai = new AiService(OPENAI_DEFAULT_MODEL, OPENAI_API_KEY);
    const suggestions = await ai.generateProjectSuggestions(validatedData.context, validatedData.focus);

    // Return response
    return new Response(JSON.stringify({ suggestions }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // If it's a validation error, return a 400
    if (error instanceof z.ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_INPUT",
            message: "Invalid input data",
            details: error.errors,
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // If it's our custom error type, use its information
    if (error instanceof AiServiceError) {
      return new Response(
        JSON.stringify({
          error: {
            code: error.code,
            message: error.toUserMessage(),
            details: error.context,
          },
        }),
        {
          status: error.code === "INVALID_INPUT" ? 400 : 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // For other errors, return a 500
    return new Response(
      JSON.stringify({
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
          details: { originalMessage: error instanceof Error ? error.message : "Unknown error" },
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
