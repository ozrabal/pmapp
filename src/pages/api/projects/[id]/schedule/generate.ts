// filepath: /Users/piotrlepkowski/Private/pmapp/src/pages/api/projects/[id]/schedule/generate.ts
import type { APIContext } from "astro";
import { projectIdSchema } from "../../../../../lib/schemas/project.schema";
import { ProjectService } from "../../../../../lib/services/project.service";
import type { GenerateScheduleResponseDto } from "../../../../../types";

// Set prerender to false for API routes
export const prerender = false;

/**
 * POST endpoint for generating a project schedule using AI
 * Route: /api/projects/{id}/schedule/generate
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

    // Step 3: Generate schedule using ProjectService with authenticated user's ID
    const projectService = new ProjectService(locals.supabase);
    const schedule = await projectService.generateProjectSchedule(parsedId.data, user.id);

    // Step 4: Return the generated schedule in the expected response format
    const response: GenerateScheduleResponseDto = {
      schedule: {
        stages: schedule.stages,
      },
    };

    return new Response(JSON.stringify(response), { status: 200, headers: { "Content-Type": "application/json" } });
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
