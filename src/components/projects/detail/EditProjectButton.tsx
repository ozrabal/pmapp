import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import { useCallback } from "react";

interface EditProjectButtonProps {
  projectId: string;
  disabled?: boolean;
}

const EditProjectButton = ({ projectId, disabled = false }: EditProjectButtonProps) => {
  const handleNavigateToEdit = useCallback(() => {
    window.location.href = `/projects/${projectId}/edit`;
  }, [projectId]);

  return (
    <Button 
      size="sm"
      onClick={handleNavigateToEdit}
      disabled={disabled}
      className="gap-1"
    >
      <Pencil className="h-4 w-4" />
      <span>Edit Project</span>
    </Button>
  );
};

export default EditProjectButton;