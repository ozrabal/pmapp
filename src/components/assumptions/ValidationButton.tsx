import React from "react";
import { Button } from "../ui/button";
import { Wand2, Loader2 } from "lucide-react";

interface ValidationButtonProps {
  onClick: () => void;
  isLoading: boolean;
  isDisabled: boolean;
}

export function ValidationButton({
  onClick,
  isLoading,
  isDisabled
}: ValidationButtonProps) {
  return (
    <Button
      onClick={onClick}
      disabled={isLoading || isDisabled}
      className="min-w-[180px]"
    >
      {isLoading ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          <span>Walidowanie...</span>
        </>
      ) : (
        <>
          <Wand2 className="h-4 w-4 mr-2" />
          <span>Waliduj założenia</span>
        </>
      )}
    </Button>
  );
}