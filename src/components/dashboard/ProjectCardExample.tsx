import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PencilIcon, TrashIcon, ClockIcon, CalendarIcon } from "lucide-react";

interface ProjectCardExampleProps {
  variant?: "normal" | "hover";
}

export function ProjectCardExample({ variant = "normal" }: ProjectCardExampleProps) {
  const projectExample = {
    id: "example-proj-1",
    name: "Przykładowy Projekt",
    description: "To jest przykładowy projekt pokazujący, jak wygląda karta projektu w dashboardzie.",
    formattedCreatedAt: "15 kwi 2025",
    formattedUpdatedAt: "17 kwi 2025",
  };

  const showActions = variant === "hover";

  return (
    <Card
      className={`group hover:shadow-md transition-all duration-300 border-border/40 hover:border-border/80 h-full`}
      tabIndex={0}
      role="article"
      aria-label={`Projekt: ${projectExample.name}`}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium line-clamp-1 group-hover:text-primary transition-colors">
          {projectExample.name}
        </CardTitle>
      </CardHeader>

      <CardContent className="pb-2">
        {projectExample.description ? (
          <p className="text-muted-foreground text-sm line-clamp-2">{projectExample.description}</p>
        ) : (
          <p className="text-muted-foreground text-sm italic">Brak opisu</p>
        )}
      </CardContent>

      <CardFooter className="flex justify-between items-center pt-0 text-xs text-muted-foreground">
        <div className="flex flex-col sm:flex-row sm:gap-3">
          <div className="flex items-center gap-1">
            <ClockIcon className="h-3 w-3" />
            <span>Utworzono: {projectExample.formattedCreatedAt}</span>
          </div>
          <div className="flex items-center gap-1">
            <CalendarIcon className="h-3 w-3" />
            <span>Aktualizacja: {projectExample.formattedUpdatedAt}</span>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${showActions ? "opacity-100 sm:opacity-100" : "opacity-100 sm:opacity-0"} transition-opacity duration-300 group-hover:opacity-100`}
            aria-label={`Edytuj projekt ${projectExample.name}`}
          >
            <PencilIcon className="h-4 w-4" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            className={`p-1 h-auto ${showActions ? "opacity-100 sm:opacity-100" : "opacity-100 sm:opacity-0"} transition-opacity duration-300 group-hover:opacity-100`}
            aria-label={`Usuń projekt ${projectExample.name}`}
          >
            <TrashIcon className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
