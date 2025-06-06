// filepath: /Users/piotrlepkowski/Private/pmapp/src/pages/api/ai/generate-schedule.ts
import type { APIRoute } from "astro";
import { z } from "zod";
import { AiService } from "../../../lib/services/ai.service";
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
      functionalBlocks: z.any(),
    })
    .transform((data) => ({
      ...data,
      assumptions: data.assumptions ?? [], // Ensure assumptions is never null/undefined
      functionalBlocks: data.functionalBlocks ?? [], // Ensure functionalBlocks is never undefined
    })),
});

export const POST: APIRoute = async ({ request }) => {
  try {
    // Parse and validate input
    const rawData = await request.json();
    const validatedData = inputSchema.parse(rawData);

    // Process with AI service
    const ai = new AiService(OPENAI_DEFAULT_MODEL, OPENAI_API_KEY);
    const result = await ai.generateSchedule(validatedData.context);

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

    // For other errors, return a 500
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return new Response(
      JSON.stringify({
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
          details: { originalMessage: errorMessage },
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
