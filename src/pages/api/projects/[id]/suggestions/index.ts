import type { APIRoute } from "astro";
import { ZodError, z } from "zod";
import { assumptionsValidationRequestSchema } from "../../../../../lib/schemas/assumptions.schema";
import { ProjectService } from "../../../../../lib/services/project.service";
import { aiService } from "../../../../../lib/services/ai.service";
import { DEFAULT_USER_ID } from "../../../../../db/supabase.client";

// Schema for query parameters
const getSuggestionsQuerySchema = z.object({
  focus: z.string().optional()
});

export const GET: APIRoute = async ({ params, request, locals }) => {
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
    
    // Parse query parameters
    const url = new URL(request.url);
    const focusParam = url.searchParams.get('focus');
    
    const queryParams = getSuggestionsQuerySchema.safeParse({
      focus: focusParam || undefined
    });
    
    if (!queryParams.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: "INVALID_QUERY_PARAMETERS",
            message: "Nieprawidłowe parametry zapytania",
            details: queryParams.error.format()
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
    
    // Generate suggestions using AI service
    const suggestionsResult = await aiService.generateProjectSuggestions(
      {
        id: project.id,
        name: project.name,
        description: project.description,
        assumptions: project.assumptions,
        functionalBlocks: project.functionalBlocks,
        schedule: project.schedule
      },
      queryParams.data.focus
    );
    
    return new Response(
      JSON.stringify(suggestionsResult),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
    
  } catch (error) {
    console.error("Error generating project suggestions:", error);
    
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