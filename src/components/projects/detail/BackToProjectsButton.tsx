import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import { useCallback } from "react";

const BackToProjectsButton = () => {
  const handleNavigateBack = useCallback(() => {
    window.location.href = "/dashboard";
  }, []);

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleNavigateBack}
      className="gap-1"
    >
      <ChevronLeft className="h-4 w-4" />
      <span>Back to Projects</span>
    </Button>
  );
};

export default BackToProjectsButton;