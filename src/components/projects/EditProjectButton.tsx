import React from "react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import type { EditProjectButtonProps } from "./types";
import { PenSquare } from "lucide-react";

export const EditProjectButton: React.FC<EditProjectButtonProps> = ({ projectId, disabled = false, className }) => {
  return (
    <Button
      variant="default"
      size="sm"
      disabled={disabled}
      className={cn("flex items-center gap-1", className)}
      onClick={() => (window.location.href = `/projects/${projectId}/edit`)}
      aria-label="Edit this project"
    >
      <PenSquare className="h-4 w-4" />
      Edit Project
    </Button>
  );
};
