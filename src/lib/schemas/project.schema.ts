import { z } from "zod";

/**
 * Validation schema for project ID parameter
 */
export const projectIdSchema = z.string().uuid({
  message: "Invalid project ID format. Must be a valid UUID",
});

export type ProjectIdParam = z.infer<typeof projectIdSchema>;

/**
 * Validation schema for list projects query parameters
 */
export const listProjectsSchema = z.object({
  // Optional status filter
  status: z.string().optional(),

  // Pagination page number - convert from string to number
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive().default(1)),

  // Results per page - convert from string to number with maximum limit
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(z.number().int().positive().max(100).default(10)),

  // Sort parameter - validate format and valid fields
  sort: z
    .string()
    .optional()
    .refine(
      (val) => {
        if (!val) return true;
        const [field, direction] = val.split(":");
        const validFields = ["name", "createdAt", "updatedAt"];
        const validDirections = ["asc", "desc"];
        return validFields.includes(field) && (!direction || validDirections.includes(direction));
      },
      {
        message: "Sort must be in format: field:direction with valid field and direction values",
      }
    )
    .default("created_at:desc"),
});

export type ListProjectsQueryParams = z.infer<typeof listProjectsSchema>;

/**
 * Validation schema for project creation
 */
export const createProjectSchema = z.object({
  // Project name - required, with maximum length of 200 characters
  name: z
    .string()
    .trim()
    .min(1, { message: "Project name is required" })
    .max(200, { message: "Project name must be 200 characters or less" }),
  
  // Project description - optional, can be null
  description: z
    .string()
    .trim()
    .max(2000, { message: "Description must be 2000 characters or less" })
    .nullable()
    .optional(),
});

export type CreateProjectInput = z.infer<typeof createProjectSchema>;

/**
 * Validation schema for project updates
 */
export const updateProjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, { message: "Project name is required" })
    .max(200, { message: "Project name must be 200 characters or less" })
    .optional(),
  
  description: z
    .string()
    .trim()
    .max(2000, { message: "Description must be 2000 characters or less" })
    .nullable()
    .optional(),
  
  assumptions: z.any().optional(),
  functionalBlocks: z.any().optional(),
  schedule: z.any().optional(),
});

export type UpdateProjectInput = z.infer<typeof updateProjectSchema>;

/**
 * Validation schema for project suggestions request
 */
export const projectSuggestionsSchema = z.object({
  // Optional focus parameter to specify the area for suggestions
  focus: z
    .string()
    .trim()
    .max(100, { message: "Focus parameter must be 100 characters or less" })
    .optional(),
});

export type ProjectSuggestionsInput = z.infer<typeof projectSuggestionsSchema>;
