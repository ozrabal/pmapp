import React from 'react';
import { Button } from '../../ui/button';
import { Sparkles } from 'lucide-react';
import type { ValidateAssumptionsButtonProps } from './types';

/**
 * Button component for triggering AI validation of project assumptions
 */
export function ValidateAssumptionsButton({
  onValidate,
  isLoading,
  disabled,
  className
}: ValidateAssumptionsButtonProps) {
  return (
    <Button 
      onClick={onValidate}
      variant="secondary"
      size="sm"
      disabled={isLoading || disabled}
      className={className}
    >
      {isLoading ? (
        <>
          <span className="animate-spin mr-2">⏳</span>
          Validating...
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4 mr-1.5" />
          Validate Assumptions with AI
        </>
      )}
    </Button>
  );
}