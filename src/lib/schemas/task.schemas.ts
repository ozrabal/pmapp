import { z } from "zod";

/**
 * Schema for validating task creation request body
 * Validates input according to the API specification and database constraints
 */
export const createTaskSchema = z.object({
  name: z.string().min(1).max(200, {
    message: "Task name must be between 1 and 200 characters",
  }),
  description: z.string().nullable().optional(),
  priority: z
    .enum(["low", "medium", "high"] as const, {
      required_error: "Task priority is required",
    })
    .nullable()
    .optional(),
  estimatedValue: z.number().nullable().optional(),
  metadata: z.record(z.unknown()).nullable().optional(),
});

/**
 * Schema for validating UUID format
 * Used for project ID validation
 */
export const uuidSchema = z.string().uuid({
  message: "Invalid UUID format",
});

/**
 * Type definitions based on the validation schemas
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
