import React from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import type { EditProjectButtonProps } from './types';

export const EditProjectButton: React.FC<EditProjectButtonProps> = ({ 
  projectId, 
  disabled = false,
  className 
}) => {
  return (
    <Button
      variant="default"
      size="sm"
      disabled={disabled}
      className={cn('flex items-center gap-1', className)}
      onClick={() => window.location.href = `/projects/${projectId}/edit`}
      aria-label="Edit this project"
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
        <path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
      </svg>
      Edit Project
    </Button>
  );
};