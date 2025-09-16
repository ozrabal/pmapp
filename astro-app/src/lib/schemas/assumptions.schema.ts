import { z } from "zod";

/**
 * Schema for project assumptions validation
 * Defines the expected structure of the project assumptions JSON data
 */
export const ProjectAssumptionsSchema = z.object({
  projectGoals: z.string().optional(),
  targetAudience: z.string().optional(),
  keyFeatures: z.string().optional(),
  technologyStack: z.string().optional(),
  constraints: z.string().optional(),
});

/**
 * Type representing the structure of project assumptions
 * Inferred from the Zod schema for type safety
 */
export type ProjectAssumptions = z.infer<typeof ProjectAssumptionsSchema>;
