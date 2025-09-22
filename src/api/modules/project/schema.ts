import { z } from "zod";

const STATUSES = ["not_started", "in_progress", "completed", "all", "archived", "active"] as const;
const SORT_FIELDS = ["createdAt", "updatedAt", "name"];

export const projectsSchema = z
  .object({
    limit: z.coerce.number().int().positive().default(10),
    page: z.coerce.number().int().min(1).default(1),
    sort: z
      .string()
      .refine(
        (val) => {
          if (!val) return false;
          const [field, order] = val.split(":");
          return SORT_FIELDS.includes(field) && ["asc", "desc"].includes(order);
        },
        {
          message: `Sort must be in format: field:order where field is one of ${SORT_FIELDS.join(", ")} and order is 'asc' or 'desc'`,
        }
      )
      .default("createdAt:desc"),
    status: z.enum(STATUSES).optional(),
    search: z.string().optional(),
  })
  .strict();
