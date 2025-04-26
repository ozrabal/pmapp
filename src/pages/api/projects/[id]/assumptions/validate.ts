import type { APIRoute } from "astro";
import { ZodError } from "zod";
import { assumptionsValidationRequestSchema } from "../../../../../lib/schemas/assumptions.schema";
import { ProjectService } from "../../../../../lib/services/project.service";
import { aiService } from "../../../../../lib/services/ai.service";
import { DEFAULT_USER_ID } from "../../../../../db/supabase.client";

export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    // Validate request parameters
    const validatedParams = assumptionsValidationRequestSchema.safeParse({ 
      projectId: params.id 
    });
    
    if (!validatedParams.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_PARAMETERS",
            message: "Nieprawidłowe parametry żądania",
            details: validatedParams.error.format()
          }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create ProjectService instance with the Supabase client
    const projectService = new ProjectService(locals.supabase);
    
    // Get project from database
    const project = await projectService.getProject(DEFAULT_USER_ID, params.id!);
    
    if (!project) {
      return new Response(
        JSON.stringify({
          error: {
            code: "PROJECT_NOT_FOUND",
            message: "Nie znaleziono projektu o podanym identyfikatorze"
          }
        }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Check if project has assumptions defined
    if (!project.assumptions) {
      return new Response(
        JSON.stringify({
          error: {
            code: "NO_ASSUMPTIONS",
            message: "Projekt nie zawiera zdefiniowanych założeń"
          }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    // Validate assumptions using AI service
    const validationResult = await aiService.validateProjectAssumptions(
      project.id, 
      project.assumptions
    );
    
    return new Response(
      JSON.stringify(validationResult),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error validating project assumptions:", error);
    
    if (error instanceof ZodError) {
      return new Response(
        JSON.stringify({
          error: {
            code: "VALIDATION_ERROR",
            message: "Błąd walidacji danych",
            details: error.format()
          }
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
    
    return new Response(
      JSON.stringify({
        error: {
          code: "SERVER_ERROR",
          message: error instanceof Error ? error.message : "Wystąpił nieoczekiwany błąd"
        }
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
};