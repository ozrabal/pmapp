import type { APIContext } from "astro";
import { projectIdSchema } from "../../../../../lib/schemas/project.schema";
import { ProjectService } from "../../../../../lib/services/project.service";
import { OPENAI_API_KEY, OPENAI_DEFAULT_MODEL } from "astro:env/server";
import AiService, { type ProjectFunctionalBlockContext } from "@/lib/services/ai.service";

// Set prerender to false for API routes
export const prerender = false;

/**
 * POST endpoint for generating functional blocks for a project using AI
 * Route: /api/projects/{id}/functional-blocks/generate
 */
export async function POST({ params, locals }: APIContext) {
  try {
    // Step 1: Validate project ID from URL parameters
    const { id } = params;
    const parsedId = projectIdSchema.safeParse(id);

    if (!parsedId.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_PROJECT_ID",
            message: "Invalid project ID format",
            details: parsedId.error.format(),
          },
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 2: Get authenticated user using the secure method
    const {
      data: { user },
    } = await locals.supabase.auth.getUser();

    // Check if user is authenticated
    if (!user) {
      return new Response(
        JSON.stringify({
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    // Step 3: Generate functional blocks using ProjectService with the authenticated user's ID
    const projectService = new ProjectService(locals.supabase);
    const project = await projectService.getProject(user.id, parsedId.data);
    // const functionalBlocks = await projectService.generateFunctionalBlocks(parsedId.data, user.id);
    const requestBody = {
      id: project.id,
      name: project.name,
      description: project.description,
      assumptions: project.assumptions,
    };
    const ai = new AiService(OPENAI_DEFAULT_MODEL, OPENAI_API_KEY);
    const functionalBlocks = await ai.generateFunctionalBlocks(requestBody as ProjectFunctionalBlockContext);

    // Step 4: Return the generated functional blocks
    return new Response(
      JSON.stringify({
        functionalBlocks,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      const status =
        error.message.includes("not found") || error.message.includes("access denied")
          ? 404
          : error.message.includes("permission")
            ? 403
            : 500;

      const code = status === 404 ? "NOT_FOUND" : status === 403 ? "FORBIDDEN" : "INTERNAL_ERROR";

      return new Response(
        JSON.stringify({
          error: {
            code,
            message: error.message || "An unexpected error occurred",
          },
        }),
        { status, headers: { "Content-Type": "application/json" } }
      );
    }

    // Generic error fallback
    return new Response(
      JSON.stringify({
        error: {
          code: "UNKNOWN_ERROR",
          message: "An unexpected error occurred",
        },
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
