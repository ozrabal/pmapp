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
  DeleteProjectResponseDto
} from "../../types";
import type { ListProjectsQueryParams } from "../schemas/project.schema";

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
    const { status, page, limit, sort } = filters;

    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Parse sort parameter
    const [sortField, sortDirection] = sort.split(":");
    
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
}

/**
 * Client service for interacting with the project-related API endpoints
 */
export class ProjectClientService {
  private static readonly API_BASE_PATH = '/api/projects';

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
    
    const queryString = queryParams.toString() ? `?${queryParams.toString()}` : '';
    
    // Make the API request
    const response = await fetch(`${this.API_BASE_PATH}${queryString}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'Failed to fetch projects');
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
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(projectData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || 'Failed to create project');
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
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
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
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData?.error?.message || `Failed to delete project with ID: ${id}`);
    }
    
    return response.json();
  }
}
