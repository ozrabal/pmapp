// filepath: /Users/piotrlepkowski/Private/pmapp/src/pages/api/ai/project-suggestions.ts
import type { APIRoute } from "astro";
import { z } from "zod";
import { aiService } from "../../../lib/services/ai.service";
import { AiServiceError } from "../../../lib/services/errors/ai-service.error";

export const prerender = false;

// Input validation schema
const inputSchema = z.object({
  projectId: z.string(),
  context: z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    assumptions: z.any().nullable(),
    functionalBlocks: z.any().nullable(),
    schedule: z.any().nullable(),
  }),
  focus: z.string().optional(),
});

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    // Parse and validate input
    const rawData = await request.json();
    const validatedData = inputSchema.parse(rawData);

    // Process with AI service
    const suggestions = await aiService.generateProjectSuggestions(validatedData.context, validatedData.focus);

    // Return response
    return new Response(JSON.stringify({ suggestions }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error generating project suggestions:", error);

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
          details: { originalMessage: error.message || "Unknown error" },
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
