import { useId } from "react";
import type { ProjectFiltersState } from "./types";
import { ProjectStatusType, ProjectSortOption } from "./types";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RotateCcwIcon } from "lucide-react";

const statusOptions = [
  { value: ProjectStatusType.ALL, label: "Wszystkie projekty" },
  { value: ProjectStatusType.ACTIVE, label: "Aktywne" },
  { value: ProjectStatusType.ARCHIVED, label: "Zarchiwizowane" },
  { value: ProjectStatusType.COMPLETED, label: "Ukończone" },
];

const sortOptions = [
  { value: ProjectSortOption.NEWEST, label: "Najnowsze" },
  { value: ProjectSortOption.OLDEST, label: "Najstarsze" },
  { value: ProjectSortOption.NAME_ASC, label: "Nazwa (A-Z)" },
  { value: ProjectSortOption.NAME_DESC, label: "Nazwa (Z-A)" },
  { value: ProjectSortOption.UPDATED, label: "Ostatnio aktualizowane" },
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
        Filtry projektów
      </h2>

      <div className="flex xs:flex-row gap-4">
        <div className="w-full xs:w-48">
          <Select value={filters.status} onValueChange={handleStatusChange} aria-label="Filtruj według statusu">
            <SelectTrigger>
              <SelectValue placeholder="Status projektu" />
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
          <Select value={filters.sort} onValueChange={handleSortChange} aria-label="Sortuj projekty">
            <SelectTrigger>
              <SelectValue placeholder="Sortowanie" />
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
        <span className="hidden sm:inline">Resetuj filtry</span>
      </Button>
    </div>
  );
}
