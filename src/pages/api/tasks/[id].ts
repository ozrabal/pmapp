import type { APIContext } from "astro";
import { getTaskParamsSchema } from "../../../lib/schemas/task.schemas";
import { taskService } from "../../../lib/services/task/task.service";
import type { ErrorResponseDto } from "../../../types";
import { ZodError } from "zod";

export const prerender = false;

/**
 * GET endpoint for retrieving a specific task by ID
 * URL: /api/tasks/{id}
 *
 * @param context - APIContext from Astro
 * @returns Response with task details or error
 */
export async function GET({ params, locals }: APIContext) {
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
    try {
      const validatedParams = getTaskParamsSchema.parse(params);
      const { id: taskId } = validatedParams;

      // Get task by ID with ownership validation
      const task = await taskService.getTaskById(supabase, taskId, user.id);

      return new Response(JSON.stringify(task), {
        status: 200,
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
              message: "Invalid task ID format",
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

      throw error;
    }
  } catch (error) {
    // Catch-all error handler
    if (import.meta.env.DEV) {
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
