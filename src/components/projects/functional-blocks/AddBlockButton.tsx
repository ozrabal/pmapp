import React from "react";
import { Button } from "../../ui/button";

interface AddBlockButtonProps {
  onClick: () => void;
}

export function AddBlockButton({ onClick }: AddBlockButtonProps) {
  return (
    <Button
      onClick={onClick}
      variant="outline"
      className="w-full border-dashed border-neutral-300 bg-neutral-50 hover:bg-neutral-100 flex items-center justify-center gap-2 h-16"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        strokeWidth={1.5}
        stroke="currentColor"
        className="w-5 h-5"
      >
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
      Dodaj nowy blok funkcjonalny
    </Button>
  );
}
