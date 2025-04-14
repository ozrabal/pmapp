import type { SupabaseClient } from "../../db/supabase.client";
import type { ListProjectsResponseDto, PaginationDto, ProjectSummaryDto } from "../../types";
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
    const order = sortField || "created_at";
    const ascending = sortDirection === "asc";

    // Start building the query
    let query = this.supabase
      .from("projects")
      .select("id, name, description, created_at, updated_at", { count: "exact" })
      .eq("user_id", userId);

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Apply sorting
    query = query.order(order, { ascending });

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
}
