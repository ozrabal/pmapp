import { z } from "zod";
import { nanoid } from "nanoid";

/**
 * Schema for feedback items in assumption validation responses
 * Represents a single piece of feedback about a specific field
 */
export const feedbackItemSchema = z.object({
  field: z.string(),
  message: z.string(),
  severity: z.enum(["error", "warning", "info"]),
});

/**
 * Schema for suggestions provided by AI
 * Each suggestion contains field-specific advice and reasoning
 */
export const suggestionSchema = z.object({
  id: z
    .string()
    .optional()
    .default(() => nanoid()),
  field: z.string(),
  suggestion: z.string(),
  reason: z.string(),
});

/**
 * Schema for the complete assumptions validation response
 * Includes overall validity assessment, feedback items, and suggestions
 */
export const assumptionsValidationSchema = z.object({
  isValid: z.boolean(),
  feedback: z.array(feedbackItemSchema),
  suggestions: z.array(suggestionSchema),
});

/**
 * Schema for project suggestion responses
 * Structure for AI-generated suggestions for project improvements
 */
export const suggestionResponseSchema = z.object({
  suggestions: z.array(
    z.object({
      id: z
        .string()
        .optional()
        .default(() => nanoid()),
      type: z.string(),
      content: z.string(),
      reason: z.string(),
    })
  ),
});

/**
 * Schema for functional blocks generation output
 */
export const functionalBlockSchema = z.object({
  id: z
    .string()
    .optional()
    .default(() => nanoid()),
  name: z.string(),
  description: z.string(),
  category: z.string(),
  dependencies: z.array(z.string()).default([]),
  order: z.number(),
});

export const functionalBlocksResponseSchema = z.object({
  functionalBlocks: z.object({
    blocks: z.array(functionalBlockSchema),
  }),
});

/**
 * Schema for schedule stage generation output
 */
export const scheduleStageSchema = z.object({
  id: z
    .string()
    .optional()
    .default(() => nanoid()),
  name: z.string(),
  description: z.string(),
  dependencies: z.array(z.string()).default([]),
  relatedBlocks: z.array(z.string()).default([]),
  order: z.number(),
});

export const scheduleResponseSchema = z.object({
  schedule: z.object({
    stages: z.array(scheduleStageSchema),
  }),
});

/**
 * Types inferred from the schemas for use in TypeScript code
 */
export type FeedbackItem = z.infer<typeof feedbackItemSchema>;
export type Suggestion = z.infer<typeof suggestionSchema>;
export type AssumptionsValidationResult = z.infer<typeof assumptionsValidationSchema>;
export type SuggestionResponse = z.infer<typeof suggestionResponseSchema>;
export type FunctionalBlock = z.infer<typeof functionalBlockSchema>;
export type FunctionalBlocksResponse = z.infer<typeof functionalBlocksResponseSchema>;
export type ScheduleStage = z.infer<typeof scheduleStageSchema>;
export type ScheduleResponse = z.infer<typeof scheduleResponseSchema>;
