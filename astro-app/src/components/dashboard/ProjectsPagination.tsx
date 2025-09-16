import type { PaginationDto } from "../../types";
import { Button } from "@/components/ui/button";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useId } from "react";

interface ProjectsPaginationProps {
  pagination: PaginationDto;
  onPageChange: (page: number) => void;
}

export function ProjectsPagination({ pagination, onPageChange }: ProjectsPaginationProps) {
  const { page, pages } = pagination;
  const paginationId = useId();

  // Don't render pagination if we have only one page
  if (pages <= 1) {
    return null;
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent, targetPage: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onPageChange(targetPage);
    }
  };

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pageNumbers: (number | string)[] = [];
    const maxVisible = 5; // Maximum visible page buttons

    // Always show first page
    pageNumbers.push(1);

    // Calculate range around current page
    let rangeStart = Math.max(2, page - 1);
    let rangeEnd = Math.min(pages - 1, page + 1);

    // Adjust range to show up to maxVisible pages
    while (rangeEnd - rangeStart + 1 < Math.min(maxVisible - 2, pages - 2) && rangeEnd < pages - 1) {
      rangeEnd++;
    }

    while (rangeEnd - rangeStart + 1 < Math.min(maxVisible - 2, pages - 2) && rangeStart > 2) {
      rangeStart--;
    }

    // Add ellipsis if needed
    if (rangeStart > 2) {
      pageNumbers.push("...");
    }

    // Add range pages
    for (let i = rangeStart; i <= rangeEnd; i++) {
      pageNumbers.push(i);
    }

    // Add ellipsis if needed
    if (rangeEnd < pages - 1) {
      pageNumbers.push("...");
    }

    // Always show last page if we have more than one page
    if (pages > 1) {
      pageNumbers.push(pages);
    }

    return pageNumbers;
  };

  const pageNumbers = getPageNumbers();

  return (
    <nav
      className="flex flex-col items-center justify-between sm:flex-row gap-4 mt-6"
      role="navigation"
      aria-label="Paginacja projektów"
      aria-describedby={`${paginationId}-description`}
    >
      <div id={`${paginationId}-description`} className="text-sm text-muted-foreground">
        Wyświetlanie {pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1}-
        {Math.min(pagination.page * pagination.limit, pagination.total)} z {pagination.total} projektów
      </div>

      <div className="flex items-center gap-1" role="group" aria-label="Przyciski paginacji">
        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page - 1)}
          onKeyDown={(e) => handleKeyDown(e, page - 1)}
          disabled={page <= 1}
          aria-label="Poprzednia strona"
          aria-disabled={page <= 1}
        >
          <ChevronLeftIcon className="h-4 w-4" />
        </Button>

        {pageNumbers.map((pageNum, idx) =>
          typeof pageNum === "number" ? (
            <Button
              key={idx}
              variant={pageNum === page ? "default" : "outline"}
              size="sm"
              onClick={() => onPageChange(pageNum)}
              onKeyDown={(e) => handleKeyDown(e, pageNum)}
              aria-label={`Strona ${pageNum}`}
              aria-current={pageNum === page ? "page" : undefined}
              aria-disabled={pageNum === page}
              disabled={pageNum === page}
            >
              {pageNum}
            </Button>
          ) : (
            <span key={idx} className="px-2 text-muted-foreground" aria-hidden="true">
              {pageNum}
            </span>
          )
        )}

        <Button
          variant="outline"
          size="icon"
          onClick={() => onPageChange(page + 1)}
          onKeyDown={(e) => handleKeyDown(e, page + 1)}
          disabled={page >= pages}
          aria-label="Następna strona"
          aria-disabled={page >= pages}
        >
          <ChevronRightIcon className="h-4 w-4" />
        </Button>
      </div>
    </nav>
  );
}
