import type { APIContext } from "astro";

import { ProjectService } from "../../lib/services/project.service";
import { listProjectsSchema, createProjectSchema } from "../../lib/schemas/project.schema";
import type { 
  ErrorResponseDto, 
  ListProjectsResponseDto,
  CreateProjectRequestDto,
  CreateProjectResponseDto
} from "../../types";
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

/**
 * POST handler for creating a new project
 *
 * @param context - The Astro API context containing request data and locals
 * @returns Response with created project data or error
 */
export async function POST(context: APIContext): Promise<Response> {
  // Get Supabase client from locals
  const { locals } = context;
  const { supabase } = locals;

  try {
    // Parse and validate the request body
    let requestData: CreateProjectRequestDto;
    try {
      requestData = await context.request.json();
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

    // Validate request data against schema
    const validationResult = createProjectSchema.safeParse(requestData);
    if (!validationResult.success) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "invalid_input",
          message: "Nieprawidłowe dane wejściowe",
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
      // Create the project (using DEFAULT_USER_ID for now, no authentication check)
      const createdProject: CreateProjectResponseDto = await projectService.createProject(
        DEFAULT_USER_ID,
        validationResult.data
      );
      
      // Return successful response with created project data
      return new Response(JSON.stringify(createdProject), {
        status: 201, // Created
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      // Check if it's a limit exceeded error
      if (error instanceof Error && error.message.includes('Przekroczono limit projektów')) {
        const errorResponse: ErrorResponseDto = {
          error: {
            code: "limit_exceeded",
            message: "Osiągnięto limit projektów dla tego konta",
          },
        };
        
        return new Response(JSON.stringify(errorResponse), {
          status: 403, // Forbidden
          headers: {
            "Content-Type": "application/json",
          },
        });
      }
      
      // Re-throw other errors to be caught by the outer catch block
      throw error;
    }
  } catch (error) {
    // Log the error for debugging
    console.error("Error creating project:", error);
    
    // Return 500 Internal Server Error
    const errorResponse: ErrorResponseDto = {
      error: {
        code: "server_error",
        message: "An error occurred while creating the project",
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
