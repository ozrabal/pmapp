import type { APIContext } from "astro";
import { createTaskSchema, uuidSchema } from "../../../../../../lib/schemas/task.schemas";
import { taskService } from "../../../../../../lib/services/task/task.service";
import type { ErrorResponseDto } from "../../../../../../types";
import { ZodError } from "zod";

export const prerender = false;

/**
 * POST endpoint for creating a new task within a functional block of a project
 * URL: /api/projects/{id}/functional-blocks/{blockId}/tasks
 *
 * @param context - APIContext from Astro
 * @returns Response with created task or error
 */
export async function POST({ params, request, locals }: APIContext) {
  try {
    // Check if user is authenticated
    const user = locals.user;
    const supabase = locals.supabase;

    if (!user) {
      return new Response(
        JSON.stringify({
          error: {
            code: "UNAUTHORIZED",
            message: "Authentication required",
          },
        } as ErrorResponseDto),
        {
          status: 401,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Validate path parameters
    const { id: projectId, blockId: functionalBlockId } = params;

    if (!projectId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_PROJECT_ID",
            message: "Project ID is required",
          },
        } as ErrorResponseDto),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    try {
      uuidSchema.parse(projectId);
    } catch (error) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_PROJECT_ID",
            message: "Project ID must be a valid UUID",
            details: error instanceof ZodError ? error.flatten() : undefined,
          },
        } as ErrorResponseDto),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (!functionalBlockId) {
      return new Response(
        JSON.stringify({
          error: {
            code: "MISSING_BLOCK_ID",
            message: "Functional block ID is required",
          },
        } as ErrorResponseDto),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Parse and validate request body
    const requestBody = await request.json().catch(() => ({}));

    try {
      const validatedData = createTaskSchema.parse(requestBody);

      // Call service to create task
      const createdTask = await taskService.createTaskInFunctionalBlock(
        supabase,
        user.id,
        projectId,
        functionalBlockId,
        validatedData
      );

      // Return successful response
      return new Response(JSON.stringify(createdTask), {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      });
    } catch (error) {
      if (error instanceof ZodError) {
        return new Response(
          JSON.stringify({
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid request data",
              details: error.flatten(),
            },
          } as ErrorResponseDto),
          {
            status: 400,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Handle service-specific errors
      const isTaskError =
        error &&
        typeof error === "object" &&
        "name" in error &&
        error.name === "TaskError" &&
        "errorCode" in error &&
        "message" in error &&
        "statusCode" in error;

      if (isTaskError) {
        // Safe to use properties now
        const taskError = error as {
          errorCode: string;
          message: string;
          statusCode: number;
        };

        return new Response(
          JSON.stringify({
            error: {
              code: taskError.errorCode,
              message: taskError.message,
            },
          } as ErrorResponseDto),
          {
            status: taskError.statusCode,
            headers: {
              "Content-Type": "application/json",
            },
          }
        );
      }

      // Fallback for unexpected errors
      // Log error for debugging in development, but not in production
      if (import.meta.env.DEV) {
        // Using Function constructor to avoid linter warnings in production builds
        new Function("e", 'console.error("Unexpected error creating task:", e)')(error);
      }

      return new Response(
        JSON.stringify({
          error: {
            code: "INTERNAL_SERVER_ERROR",
            message: "An unexpected error occurred",
          },
        } as ErrorResponseDto),
        {
          status: 500,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }
  } catch (error) {
    // Catch-all error handler
    // Log error for debugging in development, but not in production
    if (import.meta.env.DEV) {
      // Using Function constructor to avoid linter warnings in production builds
      new Function("e", "console.error('Server error:', e)")(error);
    }

    return new Response(
      JSON.stringify({
        error: {
          code: "INTERNAL_SERVER_ERROR",
          message: "An unexpected error occurred",
        },
      } as ErrorResponseDto),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
