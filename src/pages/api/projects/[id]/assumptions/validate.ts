import type { APIRoute } from 'astro';
import { z } from 'zod';
import { ProjectService } from '../../../../../lib/services/project.service';
import { DEFAULT_USER_ID } from '@/db/supabase.client';
export const prerender = false;

// Mock user ID for development purposes


// Schema for validating URL parameters
const paramsSchema = z.object({
  id: z.string().uuid('Project ID must be a valid UUID')
});

/**
 * POST handler for validating project assumptions
 * Endpoint: /api/projects/{id}/assumptions/validate
 */
export const POST: APIRoute = async ({ params, request, locals }) => {
  try {
    // Step 1: Setup mock authentication
    // In a production environment, we would use the session
    // const { data: { session } } = await locals.supabase.auth.getSession();
    // if (!session) { return 401 error }
    
    const supabase = locals.supabase;
    const userId = DEFAULT_USER_ID; // Using mock user ID instead of session.user.id
    
    // Step 2: Validate URL parameters
    const validatedParams = paramsSchema.safeParse(params);
    
    if (!validatedParams.success) {
      return new Response(
        JSON.stringify({
          error: {
            code: 'invalid_parameter',
            message: 'Invalid project ID format',
            details: validatedParams.error.format()
          }
        }),
        { 
          status: 400,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
    
    const projectId = validatedParams.data.id;
    
    // Step 3: Process the request using the ProjectService
    const projectService = new ProjectService(supabase);
    
    try {
      // Validate the project assumptions
      const validationResult = await projectService.validateProjectAssumptions(
        projectId,
        userId
      );
      
      // Return the validation result
      return new Response(
        JSON.stringify(validationResult),
        { 
          status: 200,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    } catch (error: any) {
      // Handle specific error cases
      if (error.message === 'Project not found or access denied') {
        return new Response(
          JSON.stringify({
            error: {
              code: 'not_found',
              message: 'Project not found or you do not have access to it'
            }
          }),
          { 
            status: 404,
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (error.message === 'Project assumptions not defined') {
        return new Response(
          JSON.stringify({
            error: {
              code: 'unprocessable_content',
              message: 'Project does not have any assumptions to validate'
            }
          }),
          { 
            status: 422,
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
      
      if (error.message === 'Invalid assumptions format') {
        return new Response(
          JSON.stringify({
            error: {
              code: 'invalid_format',
              message: 'Project assumptions have an invalid format'
            }
          }),
          { 
            status: 400,
            headers: { 'Content-Type': 'application/json' } 
          }
        );
      }
      
      // Log the error for debugging
      console.error('Error in assumptions validation:', error);
      
      // Return a generic error response
      return new Response(
        JSON.stringify({
          error: {
            code: 'internal_server_error',
            message: 'An unexpected error occurred while validating assumptions'
          }
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' } 
        }
      );
    }
  } catch (error) {
    // Catch any uncaught errors
    console.error('Uncaught error in assumptions validation endpoint:', error);
    
    return new Response(
      JSON.stringify({
        error: {
          code: 'internal_server_error',
          message: 'An unexpected server error occurred'
        }
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
};