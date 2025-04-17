import { useNavigate } from "@/lib/router";
import { Button } from "@/components/ui/button";
import { PlusIcon, FolderPlusIcon } from "lucide-react";

interface ProjectsEmptyStateProps {
  onCreateNew?: () => void;
}

export function ProjectsEmptyState({ onCreateNew }: ProjectsEmptyStateProps) {
  const navigate = useNavigate();
  
  const handleCreateNewClick = () => {
    if (onCreateNew) {
      onCreateNew();
    } else {
      navigate('/projects/new');
    }
  };

  return (
    <div 
      className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/20 text-center my-8"
      role="region"
      aria-label="Brak projektów"
    >
      <div className="flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 mb-4">
        <FolderPlusIcon className="h-10 w-10 text-primary" />
      </div>
      
      <h3 className="font-semibold text-lg mb-2">
        Nie masz jeszcze żadnych projektów
      </h3>
      
      <p className="text-muted-foreground max-w-md mb-6">
        Utwórz swój pierwszy projekt, aby rozpocząć pracę nad swoim pomysłem. Możesz tworzyć, edytować i zarządzać wieloma projektami.
      </p>
      
      <Button 
        onClick={handleCreateNewClick} 
        className="gap-2"
      >
        <PlusIcon className="h-4 w-4" />
        <span>Utwórz pierwszy projekt</span>
      </Button>
    </div>
  );
}