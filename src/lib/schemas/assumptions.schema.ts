import { z } from 'zod';

/**
 * Schema for project assumptions validation
 * Defines the expected structure of the project assumptions JSON data
 */
export const ProjectAssumptionsSchema = z.object({
  marketAssumptions: z.object({
    targetAudience: z.string().optional(),
    marketSize: z.string().optional(),
    competitors: z.array(z.string()).optional()
  }).optional(),
  technicalAssumptions: z.object({
    platforms: z.array(z.string()).optional(),
    technologies: z.array(z.string()).optional(),
    architecture: z.string().optional()
  }).optional(),
  businessAssumptions: z.object({
    revenue: z.string().optional(),
    costs: z.string().optional(),
    timeline: z.string().optional()
  }).optional()
});

/**
 * Type representing the structure of project assumptions
 * Inferred from the Zod schema for type safety
 */
export type ProjectAssumptions = z.infer<typeof ProjectAssumptionsSchema>;