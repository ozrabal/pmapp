import { useId } from "react";
import type { ProjectViewModel } from "./types";
import { ProjectCard } from "./ProjectCard";
import { ProjectsEmptyState } from "./ProjectsEmptyState";

interface ProjectsListProps {
  projects: ProjectViewModel[];
  onDelete: (project: ProjectViewModel) => void;
}

export function ProjectsList({ projects, onDelete }: ProjectsListProps) {
  const listId = useId();

  // If no projects, show empty state
  if (projects.length === 0) {
    return <ProjectsEmptyState />;
  }

  return (
    <div role="region" aria-labelledby={`${listId}-heading`} className="space-y-4">
      <h2 id={`${listId}-heading`} className="sr-only">
        Lista projektów
      </h2>

      <ul className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4" aria-label="Projekty">
        {projects.map((project) => (
          <li key={project.id} className="col-span-1">
            <ProjectCard project={project} onDelete={onDelete} />
          </li>
        ))}
      </ul>
    </div>
  );
}
