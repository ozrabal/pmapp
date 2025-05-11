import React from "react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";
import type { BackToProjectsButtonProps } from "./types";

export const BackToProjectsButton: React.FC<BackToProjectsButtonProps> = ({ className }) => {
  return (
    <Button
      variant="outline"
      size="sm"
      className={cn("flex items-center gap-1", className)}
      onClick={() => (window.location.href = "/dashboard")}
      aria-label="Return to projects list"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="mr-1"
        aria-hidden="true"
      >
        <path d="m15 18-6-6 6-6" />
      </svg>
      Back to Projects
    </Button>
  );
};
