import React from "react";
import { AlertCircle, AlertTriangle, Info } from "lucide-react";
import { Alert, AlertDescription } from "../../ui/alert";
import type { FeedbackItemProps } from "./types";

/**
 * Component for displaying individual feedback items from assumption validation
 */
export function FeedbackItem({ feedback, onFieldFocus, className }: FeedbackItemProps) {
  // Determine the appropriate variant and icon based on severity
  const getSeverityProps = () => {
    switch (feedback.severity) {
      case "error":
        return {
          variant: "destructive" as const,
          icon: <AlertCircle className="h-4 w-4" />,
        };
      case "warning":
        return {
          variant: "warning" as const,
          icon: <AlertTriangle className="h-4 w-4" />,
        };
      case "info":
      default:
        return {
          variant: "info" as const,
          icon: <Info className="h-4 w-4" />,
        };
    }
  };

  const { variant, icon } = getSeverityProps();

  return (
    <Alert variant={variant} className={`py-2 ${className}`}>
      {icon}
      <div className="flex gap-2">
        <AlertDescription className="text-sm">
          <span className="font-medium">{feedback.fieldLabel}:</span> {feedback.message}
          {onFieldFocus && (
            <button
              type="button"
              onClick={() => onFieldFocus(feedback.field)}
              className="ml-2 text-xs underline hover:no-underline focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1 rounded-sm"
              aria-label={`Focus on ${feedback.fieldLabel} field`}
            >
              Edit field
            </button>
          )}
        </AlertDescription>
      </div>
    </Alert>
  );
}
