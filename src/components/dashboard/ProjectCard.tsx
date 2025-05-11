import { useState } from "react";
import { useNavigate } from "@/lib/router";
import type { ProjectViewModel } from "./types";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, ClockIcon, CalendarIcon } from "lucide-react";

interface ProjectCardProps {
  project: ProjectViewModel;
  onDelete: (project: ProjectViewModel) => void;
}

export function ProjectCard({ project, onDelete }: ProjectCardProps) {
  const navigate = useNavigate();
  const [isHovering, setIsHovering] = useState(false);
  const [isFocused, setIsFocused] = useState(false);

  const handleClick = () => {
    navigate(`/projects/${project.id}`);
  };

  const handleEditClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    navigate(`/projects/${project.id}/descriptions`);
  };

  const handleDeleteClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onDelete(project);
  };

  // Show actions on hover, focus, or touch devices
  const showActions = isHovering || isFocused || window.matchMedia("(hover: none)").matches;

  return (
    <Card
      className="overflow-hidden transition-all duration-300 hover:shadow-md cursor-pointer group"
      onClick={handleClick}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onFocusCapture={() => setIsFocused(true)}
      onBlurCapture={() => setIsFocused(false)}
      tabIndex={0}
      role="article"
      aria-label={`Projekt: ${project.name}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium line-clamp-1 group-hover:text-primary transition-colors">
          {project.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-2">
        {project.description ? (
          <p className="text-muted-foreground text-sm line-clamp-2">{project.description}</p>
        ) : (
          <p className="text-muted-foreground text-sm italic">No description</p>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-0 text-xs text-muted-foreground">
        <div className="flex flex-col sm:flex-row sm:gap-3">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            <span>Created: {project.formattedCreatedAt}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>Updated: {project.formattedUpdatedAt}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${showActions ? "opacity-100 sm:opacity-100" : "opacity-100 sm:opacity-0"} transition-opacity duration-300`}
            onClick={handleEditClick}
            onKeyDown={(e) => e.key === "Enter" && handleEditClick(e)}
            aria-label={`Edytuj projekt ${project.name}`}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${showActions ? "opacity-100 sm:opacity-100" : "opacity-100 sm:opacity-0"} transition-opacity duration-300 text-destructive`}
            onClick={handleDeleteClick}
            onKeyDown={(e) => e.key === "Enter" && handleDeleteClick(e)}
            aria-label={`Usuń projekt ${project.name}`}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
