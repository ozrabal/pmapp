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
 * Schema for validating list tasks endpoint parameters
 */
export const listTasksParamsSchema = z.object({
  id: z.string().uuid("Invalid project ID format"),
  blockId: z.string().min(1, "Block ID is required"),
});

/**
 * Schema for validating list tasks query parameters
 */
export const listTasksQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  priority: z.enum(["low", "medium", "high"]).optional(),
  sort: z
    .string()
    .regex(/^[a-zA-Z]+:(asc|desc)$/)
    .optional(),
});

/**
 * Schema for validating get task endpoint parameters
 */
export const getTaskParamsSchema = z.object({
  id: z.string().uuid("Invalid task ID format"),
});

/**
 * Type definitions based on the validation schemas
 */
export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type ListTasksParams = z.infer<typeof listTasksParamsSchema>;
export type ListTasksQuery = z.infer<typeof listTasksQuerySchema>;
export type GetTaskParams = z.infer<typeof getTaskParamsSchema>;
