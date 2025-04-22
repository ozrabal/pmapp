import type { APIContext } from "astro";
import { ProjectService } from "../../../lib/services/project.service";
import { projectIdSchema } from "../../../lib/schemas/project.schema";
import type { ErrorResponseDto } from "../../../types";
import { DEFAULT_USER_ID } from "../../../db/supabase.client";

// Mark this endpoint as non-prerendered (dynamic)
export const prerender = false;

/**
 * GET handler for retrieving a single project by ID
 *
 * @param context - The Astro API context containing request data and locals
 * @returns Response with project data or error
 */
export async function GET(context: APIContext): Promise<Response> {
  // Get Supabase client from locals
  const { locals } = context;
  const { supabase } = locals;

  try {
    // Get project ID from path parameters
    const { id } = context.params;
    
    // Validate project ID format
    const validationResult = projectIdSchema.safeParse(id);
    if (!validationResult.success) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "invalid_parameter",
          message: "Invalid project ID format",
          details: validationResult.error.format(),
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Create the project service
    const projectService = new ProjectService(supabase);
    
    try {
      // Get the project
      const project = await projectService.getProject(DEFAULT_USER_ID, validationResult.data);
      
      // Return project data
      return new Response(JSON.stringify(project), {
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
        
        if (error.message.includes("unauthorized") || error.message.includes("permission")) {
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
  } catch (error) {
    // Log the error for debugging
    console.error("Error fetching project:", error);

    // Return 500 Internal Server Error
    const errorResponse: ErrorResponseDto = {
      error: {
        code: "server_error",
        message: "An error occurred while fetching the project",
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