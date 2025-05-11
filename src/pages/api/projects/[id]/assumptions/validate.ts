import type { APIRoute } from "astro";
import { z } from "zod";
import { ProjectService } from "../../../../../lib/services/project.service";

export const prerender = false;

// Schema for validating URL parameters
const paramsSchema = z.object({
  id: z.string().uuid("Project ID must be a valid UUID"),
});

/**
 * POST handler for validating project assumptions
 * Endpoint: /api/projects/{id}/assumptions/validate
 */
export const POST: APIRoute = async ({ params, locals }) => {
  try {
    const supabase = locals.supabase;

    // Get authenticated user using the secure method
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if user is authenticated
    if (!user) {
      return new Response(
        JSON.stringify({
          error: {
            code: "unauthorized",
            message: "Authentication required",
          },
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Step 2: Validate URL parameters
    const validatedParams = paramsSchema.safeParse(params);

    if (!validatedParams.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "invalid_parameter",
            message: "Invalid project ID format",
            details: validatedParams.error.format(),
          },
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const projectId = validatedParams.data.id;

    // Step 3: Process the request using the ProjectService
    const projectService = new ProjectService(supabase);

    try {
      // Validate the project assumptions using the authenticated user's ID
      const validationResult = await projectService.validateProjectAssumptions(projectId, user.id);

      // Return the validation result
      return new Response(JSON.stringify(validationResult), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    } catch (error: unknown) {
      // Handle specific error cases
      if (error instanceof Error && error.message === "Project not found or access denied") {
        return new Response(
          JSON.stringify({
            error: {
              code: "not_found",
              message: "Project not found or you do not have access to it",
            },
          }),
          {
            status: 404,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (error instanceof Error && error.message === "Project assumptions not defined") {
        return new Response(
          JSON.stringify({
            error: {
              code: "unprocessable_content",
              message: "Project does not have any assumptions to validate",
            },
          }),
          {
            status: 422,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      if (error instanceof Error && error.message === "Invalid assumptions format") {
        return new Response(
          JSON.stringify({
            error: {
              code: "invalid_format",
              message: "Project assumptions have an invalid format",
            },
          }),
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        );
      }

      // Return a generic error response
      return new Response(
        JSON.stringify({
          error: {
            code: "internal_server_error",
            message: "An unexpected error occurred while validating assumptions",
          },
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Catch any uncaught errors
    return new Response(
      JSON.stringify({
        error: {
          code: "internal_server_error",
          message: "An unexpected server error occurred",
        },
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
};
