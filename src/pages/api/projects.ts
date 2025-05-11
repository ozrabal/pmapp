import type { APIRoute } from "astro";
import { z } from "zod";
import { ProjectService } from "../../lib/services/project.service";
import type {
  CreateProjectRequestDto,
  CreateProjectResponseDto,
  ListProjectsResponseDto,
  ErrorResponseDto,
} from "../../types";

// Mark this endpoint as non-prerendered (dynamic)
export const prerender = false;

/**
 * GET handler to list projects with optional filtering
 *
 * @param param0 Object containing request data
 * @returns Response with list of projects or error
 */
export const GET: APIRoute = async ({ url, locals }) => {
  // Get Supabase client from locals
  const { supabase } = locals;

  try {
    // Define the schema for query parameters
    const querySchema = z.object({
      limit: z.coerce.number().int().positive().default(10),
      page: z.coerce.number().int().min(1).default(1),
      sort: z.string().default("createdAt:desc"),
      status: z.enum(["not_started", "in_progress", "completed", "all", "archived", "active"]).optional(),
      search: z.string().optional(),
    });

    // Parse the query parameters
    const queryParams = Object.fromEntries(url.searchParams);
    const result = querySchema.safeParse(queryParams);

    if (!result.success) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "validation_error",
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

    // Create the project service
    const projectService = new ProjectService(supabase);

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

    // Get projects for the authenticated user
    const response: ListProjectsResponseDto = await projectService.listProjects(user.id, result.data);

    // Return the list of projects
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    // Return a 500 error response
    const errorResponse: ErrorResponseDto = {
      error: {
        code: "server_error",
        message: "An error occurred while listing projects",
      },
    };

    return new Response(JSON.stringify(errorResponse), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
};

/**
 * POST handler to create a new project
 *
 * @param param0 Object containing request data
 * @returns Response with created project data or error
 */
export const POST: APIRoute = async ({ request, locals }) => {
  // Get Supabase client from locals
  const { supabase } = locals;

  try {
    // Parse the request body
    const body = await request.json();

    // Define schema for creating a project
    const createProjectSchema = z.object({
      name: z.string().min(1, "Project name cannot be empty").max(100, "Project name is too long"),
      description: z.string().max(500, "Description is too long").optional(),
      status: z.enum(["not_started", "in_progress", "completed"]).default("not_started"),
      due_date: z
        .string()
        .refine((val) => !isNaN(Date.parse(val)), "Invalid date format")
        .optional(),
      tag_ids: z.array(z.string().uuid("Invalid tag ID format")).optional(),
    });

    // Validate request body against schema
    const result = createProjectSchema.safeParse(body);

    if (!result.success) {
      // Return validation errors
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "validation_error",
          message: "Invalid project data",
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

    // Create the project using the authenticated user's ID
    const createProjectRequestDto: CreateProjectRequestDto = result.data;
    const response: CreateProjectResponseDto = await projectService.createProject(user.id, createProjectRequestDto);

    // Return the created project data
    return new Response(JSON.stringify(response), {
      status: 201,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("project limit")) {
        // User has reached their project limit
        const errorResponse: ErrorResponseDto = {
          error: {
            code: "project_limit_exceeded",
            message: "You have reached your project limit",
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

    // Return a 500 error response for other errors
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
};
