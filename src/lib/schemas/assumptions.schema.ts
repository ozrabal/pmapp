import { z } from "zod";

/**
 * Schema for validating project assumptions
 */
export const assumptionsSchema = z.object({
  projectGoal: z.string()
    .min(10, { message: "Cel projektu musi zawierać co najmniej 10 znaków" })
    .max(1000, { message: "Cel projektu nie może przekraczać 1000 znaków" }),
    
  targetAudience: z.string()
    .min(10, { message: "Grupa docelowa musi zawierać co najmniej 10 znaków" })
    .max(500, { message: "Grupa docelowa nie może przekraczać 500 znaków" }),
    
  functionalities: z.array(
    z.string()
      .min(3, { message: "Funkcjonalność musi zawierać co najmniej 3 znaki" })
      .max(200, { message: "Funkcjonalność nie może przekraczać 200 znaków" })
  )
  .min(1, { message: "Projekt musi zawierać co najmniej jedną funkcjonalność" })
  .max(10, { message: "Projekt nie może zawierać więcej niż 10 funkcjonalności" }),
  
  constraints: z.array(
    z.string()
      .min(3, { message: "Ograniczenie musi zawierać co najmniej 3 znaki" })
      .max(200, { message: "Ograniczenie nie może przekraczać 200 znaków" })
  )
  .max(5, { message: "Projekt nie może zawierać więcej niż 5 ograniczeń" })
});

/**
 * Schema for validating project assumptions in API requests
 */
export const assumptionsApiRequestSchema = z.object({
  assumptions: assumptionsSchema.nullable().optional()
});

/**
 * Schema for assumptions validation parameters
 */
export const assumptionsValidationRequestSchema = z.object({
  projectId: z.string().uuid({ message: "Nieprawidłowy identyfikator projektu" }),
});

/**
 * Type for assumptions data
 */
export type AssumptionsData = z.infer<typeof assumptionsSchema>;

/**
 * Default empty assumptions object
 */
export const emptyAssumptions: AssumptionsData = {
  projectGoal: "",
  targetAudience: "",
  functionalities: [],
  constraints: []
};