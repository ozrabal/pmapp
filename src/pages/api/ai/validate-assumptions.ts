// filepath: /Users/piotrlepkowski/Private/pmapp/src/pages/api/ai/validate-assumptions.ts
import type { APIRoute } from "astro";
import { z } from "zod";
import { aiService } from "../../../lib/services/ai.service";
import { ProjectAssumptionsSchema } from "../../../lib/schemas/assumptions.schema";
import { AiServiceError } from "../../../lib/services/errors/ai-service.error";

export const prerender = false;

// Input validation schema
const inputSchema = z.object({
  projectId: z.string(),
  assumptions: ProjectAssumptionsSchema,
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
