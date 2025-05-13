import type { SupabaseClient } from "../../db/supabase.client";
import type {
  ListProjectsResponseDto,
  PaginationDto,
  ProjectSummaryDto,
  ProjectDto,
  CreateProjectRequestDto,
  CreateProjectResponseDto,
  UpdateProjectRequestDto,
  UpdateProjectResponseDto,
  DeleteProjectResponseDto,
  ValidateProjectAssumptionsResponseDto,
  SuggestionDto,
  GetProjectSuggestionsResponseDto,
  FunctionalBlockDto,
  ScheduleStageDto,
  GenerateScheduleResponseDto,
} from "../../types";
import type { ListProjectsQueryParams } from "../schemas/project.schema";
import { ProjectAssumptionsSchema } from "../schemas/assumptions.schema";

/**
 * Service for handling project-related database operations
 */
export class ProjectService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Get a list of projects for a user with optional filtering and pagination
   *
   * @param userId - The ID of the user whose projects to retrieve
   * @param filters - Optional query parameters for filtering and pagination
   * @returns A promise that resolves to a ListProjectsResponseDto
   */
  async listProjects(userId: string, filters: ListProjectsQueryParams): Promise<ListProjectsResponseDto> {
    // Set defaults for required parameters if they're not provided
    const { limit = 10, status, sort = "createdAt:desc", page = 1 } = filters || {};

    // Calculate offset for pagination
    const offset = ((page || 1) - 1) * (limit || 10);

    // Parse sort parameter with fallback to default
    const [sortField, sortDirection] = (sort || "createdAt:desc").split(":");

    // Map frontend sort field names to database column names
    let dbSortField: string;
    switch (sortField) {
      case "name":
        dbSortField = "name";
        break;
      case "createdAt":
        dbSortField = "created_at";
        break;
      case "updatedAt":
        dbSortField = "updated_at";
        break;
      default:
        dbSortField = "created_at";
    }

    const ascending = sortDirection === "asc";

    // Start building the query
    let query = this.supabase
      .from("projects")
      .select("id, name, description, created_at, updated_at", { count: "exact" })
      .eq("user_id", userId)
      .is("deleted_at", null);

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Apply sorting
    query = query.order(dbSortField, { ascending });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    // Execute the query
    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch projects: ${error.message}`);
    }

    // Transform database records to DTOs
    const projects: ProjectSummaryDto[] = data.map((project) => ({
      id: project.id,
      name: project.name,
      description: project.description,
      createdAt: project.created_at,
      updatedAt: project.updated_at,
    }));

    // Create pagination data
    const totalPages = count ? Math.ceil(count / limit) : 0;
    const pagination: PaginationDto = {
      total: count || 0,
      page,
      limit,
      pages: totalPages,
    };

    return {
      data: projects,
      pagination,
    };
  }

  /**
   * Get a single project by ID
   *
   * @param userId - The ID of the user who owns the project
   * @param projectId - The ID of the project to retrieve
   * @returns A promise that resolves to a ProjectDto
   */
  async getProject(userId: string, projectId: string): Promise<ProjectDto> {
    const { data, error } = await this.supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();
    if (error) {
      throw new Error(`Failed to fetch project: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      assumptions: data.assumptions,
      functionalBlocks: data.functional_blocks,
      schedule: data.schedule,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Create a new project
   *
   * @param userId - The ID of the user creating the project
   * @param project - The project data to create
   * @returns A promise that resolves to a CreateProjectResponseDto
   */
  async createProject(userId: string, project: CreateProjectRequestDto): Promise<CreateProjectResponseDto> {
    // When using RLS, we need to ensure we're in the security context of the user
    // First check if the current Supabase client has an active auth session
    const { data: sessionData } = await this.supabase.auth.getSession();

    if (!sessionData?.session) {
      // If there's no session, we need to use the admin API to bypass RLS
      // This requires setting user_id explicitly as we're doing

      // Create project using BYPASSRLS capability (available to service_role)
      const { data, error } = await this.supabase
        .from("projects")
        .insert([
          {
            user_id: userId,
            name: project.name,
            description: project.description || null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create project: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: data.created_at,
      };
    } else {
      // If there's an active session, the RLS policies will be applied automatically
      // Make sure the authenticated user matches the userId parameter
      if (sessionData.session.user.id !== userId) {
        throw new Error("User ID mismatch: Cannot create project for another user");
      }

      const { data, error } = await this.supabase
        .from("projects")
        .insert([
          {
            // No need to set user_id explicitly as RLS will handle this
            user_id: userId,
            name: project.name,
            description: project.description || null,
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to create project: ${error.message}`);
      }

      return {
        id: data.id,
        name: data.name,
        description: data.description,
        createdAt: data.created_at,
      };
    }
  }

  /**
   * Update an existing project
   *
   * @param userId - The ID of the user who owns the project
   * @param projectId - The ID of the project to update
   * @param updates - The project data to update
   * @returns A promise that resolves to an UpdateProjectResponseDto
   */
  async updateProject(
    userId: string,
    projectId: string,
    updates: UpdateProjectRequestDto
  ): Promise<UpdateProjectResponseDto> {
    const updateData: Record<string, unknown> = {};

    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.assumptions !== undefined) updateData.assumptions = updates.assumptions;
    if (updates.functionalBlocks !== undefined) updateData.functional_blocks = updates.functionalBlocks;
    if (updates.schedule !== undefined) updateData.schedule = updates.schedule;

    const { data, error } = await this.supabase
      .from("projects")
      .update(updateData)
      .eq("id", projectId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update project: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      assumptions: data.assumptions,
      functionalBlocks: data.functional_blocks,
      schedule: data.schedule,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Delete a project (soft delete)
   *
   * @param userId - The ID of the user who owns the project
   * @param projectId - The ID of the project to delete
   * @returns A promise that resolves to a DeleteProjectResponseDto
   */
  async deleteProject(userId: string, projectId: string): Promise<DeleteProjectResponseDto> {
    // Check if project exists and if user is the owner
    const { data: existingProject, error: fetchError } = await this.supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (fetchError || !existingProject) {
      throw new Error(`Project not found or you don't have permission to delete it`);
    }

    // Update the deleted_at field instead of removing the record
    const { error: updateError } = await this.supabase
      .from("projects")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", projectId)
      .eq("user_id", userId);

    if (updateError) {
      throw new Error(`Failed to delete project: ${updateError.message}`);
    }

    return {
      message: "Project deleted successfully",
    };
  }

  /**
   * Validate project assumptions using AI
   *
   * @param projectId - The ID of the project whose assumptions to validate
   * @param userId - The ID of the user who owns the project
   * @returns A promise that resolves to a ValidateProjectAssumptionsResponseDto
   * @throws Error if project is not found, user doesn't have access, or assumptions are not defined
   */
  async validateProjectAssumptions(projectId: string, userId: string): Promise<ValidateProjectAssumptionsResponseDto> {
    // Get project with assumptions
    const { data: project, error } = await this.supabase
      .from("projects")
      .select("assumptions")
      .eq("id", projectId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (error) {
      throw new Error("Project not found or access denied");
    }

    if (!project.assumptions) {
      throw new Error("Project assumptions not defined");
    }

    // Validate assumptions schema
    const parsedAssumptions = ProjectAssumptionsSchema.safeParse(project.assumptions);

    if (!parsedAssumptions.success) {
      throw new Error("Invalid assumptions format");
    }

    // Use API endpoint to validate assumptions
    const validationResult = await ProjectClientService.validateProjectAssumptions(projectId);

    // Return the validation result
    return validationResult;
  }

  /**
   * Generate AI-powered suggestions for a project
   *
   * @param projectId - The ID of the project to generate suggestions for
   * @param userId - The ID of the user who owns the project
   * @param focus - Optional focus area for suggestions
   * @returns A promise that resolves to an array of SuggestionDto
   * @throws Error if project is not found or user doesn't have access
   */
  async getProjectSuggestions(projectId: string, userId: string, focus?: string): Promise<SuggestionDto[]> {
    // Check if project exists and user has access
    const { error } = await this.supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (error) {
      throw new Error("Project not found or access denied");
    }

    // Use API endpoint to generate suggestions
    const response = await ProjectClientService.getProjectSuggestions(projectId, focus);
    return response.suggestions;
  }

  /**
   * Generate functional blocks for a project using AI
   *
   * @param projectId - The ID of the project to generate functional blocks for
   * @param userId - The ID of the user who owns the project
   * @returns A promise that resolves to an array of FunctionalBlockDto
   * @throws Error if project is not found or user doesn't have access
   */
  async generateFunctionalBlocks(projectId: string, userId: string): Promise<{ blocks: FunctionalBlockDto[] }> {
    // Check if project exists and user has access
    const { error } = await this.supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (error) {
      throw new Error("Project not found or access denied");
    }

    const project = await this.getProject(userId, projectId);

    // Use API endpoint to generate functional blocks
    const functionalBlocks = await ProjectClientService.generateFunctionalBlocks(projectId, project);

    // Update the project with the generated functional blocks
    await this.updateProject(userId, projectId, {
      functionalBlocks: JSON.parse(JSON.stringify({ blocks: functionalBlocks.blocks })),
    });

    return functionalBlocks;
  }

  /**
   * Generate a project schedule using AI
   *
   * @param projectId - The ID of the project to generate schedule for
   * @param userId - The ID of the user who owns the project
   * @returns A promise that resolves to a schedule with stages
   * @throws Error if project is not found or user doesn't have access
   */
  async generateProjectSchedule(projectId: string, userId: string): Promise<{ stages: ScheduleStageDto[] }> {
    // Check if project exists and user has access
    const { error } = await this.supabase
      .from("projects")
      .select("id")
      .eq("id", projectId)
      .eq("user_id", userId)
      .is("deleted_at", null)
      .single();

    if (error) {
      throw new Error("Project not found or access denied");
    }

    // Use API endpoint to generate schedule
    const response = await ProjectClientService.generateProjectSchedule(projectId);

    // Update the project with the generated schedule
    await this.updateProject(userId, projectId, {
      schedule: JSON.parse(JSON.stringify(response.schedule)),
    });

    return response.schedule;
  }
}

/**
 * Client service for interacting with the project-related API endpoints
 */

// eslint-disable-next-line @typescript-eslint/no-extraneous-class
export class ProjectClientService {
  private static readonly API_BASE_PATH = "/api/projects";

  /**
   * Get a list of projects with optional filtering and pagination
   *
   * @param params - Optional query parameters for filtering and pagination
   * @returns A promise that resolves to a ListProjectsResponseDto
   */
  static async listProjects(params: Record<string, string | number> = {}): Promise<ListProjectsResponseDto> {
    // Build query string from parameters
    const queryParams = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        queryParams.append(key, String(value));
      }
    });

    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : "";

    // Make the API request
    const response = await fetch(`${this.API_BASE_PATH}${queryString}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || "Failed to fetch projects");
    }

    return response.json();
  }

  /**
   * Get a single project by ID
   *
   * @param id - The ID of the project to retrieve
   * @returns A promise that resolves to a ProjectDto
   */
  static async getProject(id: string): Promise<ProjectDto> {
    const response = await fetch(`${this.API_BASE_PATH}/${id}`);
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || `Failed to fetch project with ID: ${id}`);
    }

    return response.json();
  }

  /**
   * Create a new project
   *
   * @param projectData - The project data to create
   * @returns A promise that resolves to a CreateProjectResponseDto
   */
  static async createProject(projectData: CreateProjectRequestDto): Promise<CreateProjectResponseDto> {
    const response = await fetch(this.API_BASE_PATH, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || "Failed to create project");
    }

    return response.json();
  }

  /**
   * Update an existing project
   *
   * @param id - The ID of the project to update
   * @param projectData - The project data to update
   * @returns A promise that resolves to an UpdateProjectResponseDto
   */
  static async updateProject(id: string, projectData: UpdateProjectRequestDto): Promise<UpdateProjectResponseDto> {
    const response = await fetch(`${this.API_BASE_PATH}/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(projectData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || `Failed to update project with ID: ${id}`);
    }

    return response.json();
  }

  /**
   * Delete a project
   *
   * @param id - The ID of the project to delete
   * @returns A promise that resolves to a DeleteProjectResponseDto
   */
  static async deleteProject(id: string): Promise<DeleteProjectResponseDto> {
    const response = await fetch(`${this.API_BASE_PATH}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || `Failed to delete project with ID: ${id}`);
    }

    return response.json();
  }

  /**
   * Validate the assumptions of a project using AI
   *
   * @param id - The ID of the project to validate assumptions for
   * @returns A promise that resolves to a ValidateProjectAssumptionsResponseDto
   */
  static async validateProjectAssumptions(id: string): Promise<ValidateProjectAssumptionsResponseDto> {
    const project = await this.getProject(id);
    if (!project.assumptions) {
      throw new Error("Project assumptions not defined");
    }

    const response = await fetch(`/api/ai/validate-assumptions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ projectId: id, assumptions: project.assumptions }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || `Failed to validate project assumptions for project with ID: ${id}`);
    }

    return response.json();
  }

  /**
   * Get AI-powered suggestions for a project
   *
   * @param id - The ID of the project to get suggestions for
   * @param focus - Optional focus area for suggestions
   * @returns A promise that resolves to a GetProjectSuggestionsResponseDto
   */
  static async getProjectSuggestions(id: string, focus?: string): Promise<GetProjectSuggestionsResponseDto> {
    const requestBody = focus ? { focus } : {};

    const response = await fetch(`${this.API_BASE_PATH}/${id}/suggestions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || `Failed to get suggestions for project with ID: ${id}`);
    }

    return response.json();
  }

  /**
   * Generate a project schedule using AI
   *
   * @param id - The ID of the project to generate schedule for
   * @returns A promise that resolves to a GenerateScheduleResponseDto
   */
  static async generateProjectSchedule(id: string): Promise<GenerateScheduleResponseDto> {
    const response = await fetch(`${this.API_BASE_PATH}/${id}/schedule/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || `Failed to generate schedule for project with ID: ${id}`);
    }

    return response.json();
  }

  /**
   * Generate functional blocks for a project using AI
   *
   * @param id - The ID of the project to generate functional blocks for
   * @returns A promise that resolves to an object with functional blocks
   */
  static async generateFunctionalBlocks(id: string, project: ProjectDto): Promise<{ blocks: FunctionalBlockDto[] }> {
    try {
      const requestBody = {
        id: project.id,
        context: {
          id: project.id,
          name: project.name,
          description: project.description,
          assumptions: project.assumptions,
        },
      };
      const response = await fetch(`/ai/generate-functional-blocks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || `Failed to generate functional blocks for project with ID: ${id}`);
      }

      return response.json();
    } catch (error) {
      throw new Error(
        `Failed to generate functional blocks: ${error instanceof Error ? error.message : "Unknown error"}`
      );
    }
  }
}
