import React from "react";
import type { ValidationResultViewModel } from "./types";
import { FeedbackItem } from "./FeedbackItem";
import { CheckCircle2, AlertCircle } from "lucide-react";

interface ValidationResultsProps {
  validation: ValidationResultViewModel;
  onFieldFocus?: (field: string) => void;
}

export function ValidationResults({
  validation,
  onFieldFocus
}: ValidationResultsProps) {
  const { isValid, feedbackItems, timestamp } = validation;
  
  // Format the validation timestamp
  const formattedDate = new Intl.DateTimeFormat('pl-PL', {
    year: 'numeric',
    month: 'numeric',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(timestamp instanceof Date ? timestamp : new Date(timestamp));
  
  // Display message based on validation result
  const validationMessage = isValid 
    ? "Twoje założenia projektu są kompletne i poprawne."
    : "Twoje założenia projektu wymagają dopracowania.";
  
  // Group feedback items by severity
  const errorItems = feedbackItems.filter(item => item.severity === 'error');
  const warningItems = feedbackItems.filter(item => item.severity === 'warning');
  const infoItems = feedbackItems.filter(item => item.severity === 'info');
  
  return (
    <div className="space-y-4">
      {/* Validation Status */}
      <div className={`p-4 rounded-md ${isValid ? 'bg-green-50 dark:bg-green-950/30' : 'bg-amber-50 dark:bg-amber-950/30'}`}>
        <div className="flex">
          <div className="flex-shrink-0">
            {isValid ? (
              <CheckCircle2 className="h-5 w-5 text-green-500" />
            ) : (
              <AlertCircle className="h-5 w-5 text-amber-500" />
            )}
          </div>
          <div className="ml-3">
            <h3 className={`text-sm font-medium ${isValid ? 'text-green-800 dark:text-green-200' : 'text-amber-800 dark:text-amber-200'}`}>
              {validationMessage}
            </h3>
            <div className={`mt-2 text-sm ${isValid ? 'text-green-700 dark:text-green-300' : 'text-amber-700 dark:text-amber-300'}`}>
              <p>Walidacja wykonana: {formattedDate}</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Feedback Items */}
      {feedbackItems.length > 0 ? (
        <div className="space-y-6 mt-4">
          {/* Errors Section */}
          {errorItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-red-600 dark:text-red-400">
                Problemy wymagające poprawy ({errorItems.length})
              </h4>
              <div className="space-y-2">
                {errorItems.map((item, index) => (
                  <FeedbackItem
                    key={`error-${index}`}
                    feedback={item}
                    onFieldFocus={onFieldFocus}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Warnings Section */}
          {warningItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-amber-600 dark:text-amber-400">
                Sugerowane zmiany ({warningItems.length})
              </h4>
              <div className="space-y-2">
                {warningItems.map((item, index) => (
                  <FeedbackItem
                    key={`warning-${index}`}
                    feedback={item}
                    onFieldFocus={onFieldFocus}
                  />
                ))}
              </div>
            </div>
          )}
          
          {/* Info Section */}
          {infoItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-blue-600 dark:text-blue-400">
                Dodatkowe informacje ({infoItems.length})
              </h4>
              <div className="space-y-2">
                {infoItems.map((item, index) => (
                  <FeedbackItem
                    key={`info-${index}`}
                    feedback={item}
                    onFieldFocus={onFieldFocus}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 text-muted-foreground">
          <p>Brak szczegółowych uwag dla założeń projektu.</p>
        </div>
      )}
    </div>
  );
}