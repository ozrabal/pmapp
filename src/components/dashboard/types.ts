// Enum for project statuses
export enum ProjectStatusType {
  ALL = "all",
  ACTIVE = "active",
  ARCHIVED = "archived",
  COMPLETED = "completed",
}

// Enum opcji sortowania
export enum ProjectSortOption {
  NEWEST = "createdAt:desc",
  OLDEST = "createdAt:asc",
  NAME_ASC = "name:asc",
  NAME_DESC = "name:desc",
  UPDATED = "updatedAt:desc",
}

// Extended project model for UI purposes
export interface ProjectViewModel {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatusType;
  createdAt: string;
  formattedCreatedAt: string; // np. "12 kwi 2025"
  updatedAt: string;
  formattedUpdatedAt: string; // np. "12 kwi 2025"
}

// Stan filtrów i paginacji
export interface ProjectFiltersState {
  status: ProjectStatusType;
  sort: ProjectSortOption;
  page: number;
  limit: number;
}

// Parametry zapytania API
export interface ProjectApiQueryParams {
  status?: string;
  page?: number;
  limit?: number;
  sort?: string;
}
