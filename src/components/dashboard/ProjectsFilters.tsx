import { useId } from "react";
import type { ProjectFiltersState } from "./types";
import { ProjectStatusType, ProjectSortOption } from "./types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcwIcon } from "lucide-react";

const statusOptions = [
  { value: ProjectStatusType.ALL, label: "All projects" },
  { value: ProjectStatusType.ACTIVE, label: "Active" },
  { value: ProjectStatusType.ARCHIVED, label: "Archived" },
  { value: ProjectStatusType.COMPLETED, label: "Completed" },
];

const sortOptions = [
  { value: ProjectSortOption.NEWEST, label: "Newest" },
  { value: ProjectSortOption.OLDEST, label: "Oldest" },
  { value: ProjectSortOption.NAME_ASC, label: "Name (A-Z)" },
  { value: ProjectSortOption.NAME_DESC, label: "Name (Z-A)" },
  { value: ProjectSortOption.UPDATED, label: "Recently updated" },
];

interface ProjectsFiltersProps {
  filters: ProjectFiltersState;
  onUpdateFilters: (newFilters: Partial<ProjectFiltersState>) => void;
  onResetFilters: () => void;
}

export function ProjectsFilters({ filters, onUpdateFilters, onResetFilters }: ProjectsFiltersProps) {
  const filtersId = useId();

  const handleStatusChange = (value: string) => {
    onUpdateFilters({ status: value as ProjectStatusType });
  };

  const handleSortChange = (value: string) => {
    onUpdateFilters({ sort: value as ProjectSortOption });
  };

  // Check if any non-default filters are applied
  const hasActiveFilters = filters.status !== ProjectStatusType.ALL || filters.sort !== ProjectSortOption.NEWEST;

  return (
    <div
      className="mb-6 border-b pb-6 flex flex-row gap-1 sm:gap-4 justify-between items-center"
      role="search"
      aria-labelledby={`${filtersId}-heading`}
    >
      <h2 id={`${filtersId}-heading`} className="sr-only">
        Project Filters
      </h2>

      <div className="flex xs:flex-row gap-4">
        <div className="w-full xs:w-48">
          <Select value={filters.status} onValueChange={handleStatusChange} aria-label="Filter by status">
            <SelectTrigger>
              <SelectValue placeholder="Project status" />
            </SelectTrigger>
            <SelectContent>
              {statusOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full xs:w-56">
          <Select value={filters.sort} onValueChange={handleSortChange} aria-label="Sort projects">
            <SelectTrigger>
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Button
        variant="outline"
        onClick={onResetFilters}
        disabled={!hasActiveFilters}
        aria-disabled={!hasActiveFilters}
        className="gap-2 whitespace-nowrap"
      >
        <RotateCcwIcon className="h-4 w-4" />
        <span className="hidden sm:inline">Reset filters</span>
      </Button>
    </div>
  );
}
