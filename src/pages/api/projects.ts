import type { APIContext } from "astro";

import { ProjectService } from "../../lib/services/project.service";
import { listProjectsSchema } from "../../lib/schemas/project.schema";
import type { ErrorResponseDto, ListProjectsResponseDto } from "../../types";
import { DEFAULT_USER_ID } from "../../db/supabase.client";

// Mark this endpoint as non-prerendered (dynamic)
export const prerender = false;

/**
 * GET handler for listing projects with optional filtering and pagination
 *
 * @param context - The Astro API context containing request data and locals
 * @returns Response with projects list or error
 */
export async function GET(context: APIContext): Promise<Response> {
  // Get Supabase client from locals
  const { locals } = context;
  const { supabase } = locals;

  try {
    // Validate and parse query parameters
    const result = listProjectsSchema.safeParse(Object.fromEntries(context.url.searchParams));
    // If validation fails, return 400 Bad Request
    if (!result.success) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "invalid_parameters",
          message: "Invalid query parameters",
          details: result.error.format(),
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Parameters are valid, proceed with fetching projects
    const projectService = new ProjectService(supabase);

    // Use DEFAULT_USER_ID as specified in feedback
    const response: ListProjectsResponseDto = await projectService.listProjects(DEFAULT_USER_ID, result.data);

    // Return successful response
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching projects:", error);

    // Return 500 Internal Server Error
    const errorResponse: ErrorResponseDto = {
      error: {
        code: "server_error",
        message: "An error occurred while fetching projects",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
