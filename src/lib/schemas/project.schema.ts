import { z } from "zod";

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
