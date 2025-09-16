// API endpoint for generating project suggestions
import type { APIContext } from "astro";
import { ProjectService } from "../../../../../lib/services/project.service";
import { projectIdSchema, projectSuggestionsSchema } from "../../../../../lib/schemas/project.schema";
import type {
  ErrorResponseDto,
  GetProjectSuggestionsRequestDto,
  GetProjectSuggestionsResponseDto,
  SuggestionDto,
} from "../../../../../types";

// Mark this endpoint as non-prerendered (dynamic)
export const prerender = false;

/**
 * POST handler for generating AI suggestions for a project
 *
 * @param context - The Astro API context containing request data and locals
 * @returns Response with project suggestions or error
 */
export async function POST(context: APIContext): Promise<Response> {
  // Get Supabase client from locals
  const { locals } = context;
  const { supabase } = locals;

  try {
    // Get project ID from path parameters
    const { id } = context.params;

    // Validate project ID format
    const projectIdValidation = projectIdSchema.safeParse(id);
    if (!projectIdValidation.success) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "invalid_parameter",
          message: "Invalid project ID format",
          details: projectIdValidation.error.format(),
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const projectId = projectIdValidation.data;

    // Parse and validate the request body
    let requestBody: GetProjectSuggestionsRequestDto = {};
    try {
      // Check if the request has a body before trying to parse it
      const contentType = context.request.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const body = await context.request.json();
        if (body) {
          requestBody = body;
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "invalid_request",
          message: "Invalid JSON in request body",
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Validate the request body against schema
    const bodyValidation = projectSuggestionsSchema.safeParse(requestBody);
    if (!bodyValidation.success) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "invalid_input",
          message: "Invalid request data",
          details: bodyValidation.error.format(),
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    const { focus } = bodyValidation.data;

    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser();

    // Check if user is authenticated
    if (!user) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "unauthorized",
          message: "Authentication required",
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 401,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Create the project service
    const projectService = new ProjectService(supabase);

    try {
      // Generate project suggestions
      const suggestions: SuggestionDto[] = await projectService.getProjectSuggestions(projectId, user.id, focus);

      // Format the response according to the DTO
      const response: GetProjectSuggestionsResponseDto = {
        suggestions,
      };

      // Return suggestions
      return new Response(JSON.stringify(response), {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // Check error type and return appropriate response
      if (error instanceof Error) {
        if (error.message.includes("not found")) {
          const errorResponse: ErrorResponseDto = {
            error: {
              code: "not_found",
              message: "Project not found",
            },
          };

          return new Response(JSON.stringify(errorResponse), {
            status: 404,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }

        if (error.message.includes("access denied") || error.message.includes("permission")) {
          const errorResponse: ErrorResponseDto = {
            error: {
              code: "forbidden",
              message: "You don't have permission to access this project",
            },
          };

          return new Response(JSON.stringify(errorResponse), {
            status: 403,
            headers: {
              "Content-Type": "application/json",
            },
          });
        }
      }

      // Re-throw other errors to be caught by the outer catch block
      throw error;
    }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Return 500 Internal Server Error
    const errorResponse: ErrorResponseDto = {
      error: {
        code: "server_error",
        message: "An error occurred while generating project suggestions",
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
