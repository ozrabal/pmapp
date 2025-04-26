import React from "react";
import { type FeedbackItemViewModel } from "./types";
import { Button } from "../ui/button";
import { AlertCircle, AlertTriangle, Info, ArrowRight } from "lucide-react";

interface FeedbackItemProps {
  feedback: FeedbackItemViewModel;
  onFieldFocus?: (field: string) => void;
}

export function FeedbackItem({
  feedback,
  onFieldFocus
}: FeedbackItemProps) {
  const { field, fieldLabel, message, severity } = feedback;
  
  // Different styling based on severity
  const getSeverityStyles = () => {
    switch (severity) {
      case 'error':
        return {
          containerClass: 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/30',
          iconColor: 'text-red-500',
          icon: <AlertCircle className="h-5 w-5" />
        };
      case 'warning':
        return {
          containerClass: 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/30',
          iconColor: 'text-amber-500',
          icon: <AlertTriangle className="h-5 w-5" />
        };
      case 'info':
      default:
        return {
          containerClass: 'border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30',
          iconColor: 'text-blue-500',
          icon: <Info className="h-5 w-5" />
        };
    }
  };
  
  const { containerClass, iconColor, icon } = getSeverityStyles();
  
  // Handler for focusing on the related field
  const handleFieldFocus = () => {
    if (onFieldFocus && field) {
      onFieldFocus(field);
    }
  };
  
  return (
    <div className={`rounded-md border p-3 flex items-start ${containerClass}`}>
      <div className={`flex-shrink-0 ${iconColor}`}>
        {icon}
      </div>
      <div className="ml-3 flex-grow">
        <div className="flex justify-between">
          <p className="text-sm font-medium">
            {fieldLabel || 'Ogólne'}
          </p>
          
          {field && onFieldFocus && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 -mr-1 text-xs"
              onClick={handleFieldFocus}
            >
              Przejdź <ArrowRight className="ml-1 h-3 w-3" />
            </Button>
          )}
        </div>
        <div className="mt-1 text-sm">
          {message}
        </div>
      </div>
    </div>
  );
}