import type { APIContext } from "astro";
import { ProjectService } from "../../../lib/services/project.service";
import { projectIdSchema, updateProjectSchema } from "../../../lib/schemas/project.schema";
import type { ErrorResponseDto, UpdateProjectRequestDto, UpdateProjectResponseDto } from "../../../types";

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

    // Get the authenticated user
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
      // Get the project using the authenticated user's ID
      const project = await projectService.getProject(user.id, validationResult.data);

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
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
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

/**
 * PATCH handler for updating a project by ID
 *
 * @param context - The Astro API context containing request data and locals
 * @returns Response with updated project data or error
 */
export async function PATCH(context: APIContext): Promise<Response> {
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

    // Get the authenticated user
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

    // Parse and validate the request body
    let requestBody: UpdateProjectRequestDto;
    try {
      requestBody = await context.request.json();
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

    // Validate update data against schema
    const updateValidation = updateProjectSchema.safeParse(requestBody);
    if (!updateValidation.success) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: "invalid_input",
          message: "Invalid update data",
          details: updateValidation.error.format(),
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
      // Update the project using the authenticated user's ID
      const updatedProject: UpdateProjectResponseDto = await projectService.updateProject(
        user.id,
        validationResult.data,
        updateValidation.data
      );

      // Return updated project data
      return new Response(JSON.stringify(updatedProject), {
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
              message: "You don't have permission to update this project",
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
        message: "An error occurred while updating the project",
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
 * DELETE handler for soft-deleting a project by ID
 *
 * @param context - The Astro API context containing request data and locals
 * @returns Response with success message or error
 */
export async function DELETE({ params, locals }: APIContext): Promise<Response> {
  const { supabase } = locals;

  // Validate project ID format
  const result = projectIdSchema.safeParse(params.id);

  if (!result.success) {
    const errorResponse: ErrorResponseDto = {
      error: {
        code: "validation/invalid-id",
        message: "Invalid project ID format",
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

  try {
    // Get the authenticated user
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

    const projectService = new ProjectService(supabase);
    const response = await projectService.deleteProject(user.id, result.data);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    // Handle specific error types
    if (errorMessage.includes("not found") || errorMessage.includes("permission")) {
      const errorResponse: ErrorResponseDto = {
        error: {
          code: errorMessage.includes("not found") ? "project/not-found" : "auth/forbidden",
          message: errorMessage,
        },
      };

      return new Response(JSON.stringify(errorResponse), {
        status: errorMessage.includes("not found") ? 404 : 403,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Handle general server error
    const errorResponse: ErrorResponseDto = {
      error: {
        code: "server/error",
        message: "Failed to delete project",
        details: { originalError: errorMessage },
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
