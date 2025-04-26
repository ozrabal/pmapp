import React from "react";
import type { SuggestionViewModel } from "./types";
import { Button } from "../ui/button";
import { CheckCircle, XCircle, Lightbulb } from "lucide-react";
import { SuggestionFeedback } from "./SuggestionFeedback";

interface SuggestionItemProps {
  suggestion: SuggestionViewModel;
  onAccept: () => void;
  onReject: () => void;
  onFeedback: (isHelpful: boolean) => void;
}

export function SuggestionItem({
  suggestion,
  onAccept,
  onReject,
  onFeedback
}: SuggestionItemProps) {
  const { content, reason, isAccepted, isFeedbackGiven } = suggestion;
  
  return (
    <div className={`border rounded-md p-4 transition-colors ${
      isAccepted 
        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30' 
        : 'border-blue-100 bg-blue-50/50 dark:border-blue-900 dark:bg-blue-950/20'
    }`}>
      <div className="flex items-start gap-3">
        <div className="text-blue-500 flex-shrink-0 mt-1">
          <Lightbulb className="h-5 w-5" />
        </div>
        
        <div className="flex-grow space-y-3">
          {/* Suggestion Content */}
          <div>
            <p className="text-sm">{content}</p>
          </div>
          
          {/* Suggestion Reason */}
          {reason && (
            <div className="text-xs text-muted-foreground border-t pt-2 mt-2">
              <p><span className="font-medium">Uzasadnienie:</span> {reason}</p>
            </div>
          )}
          
          {/* Action Buttons - show only if not already accepted */}
          {!isAccepted && (
            <div className="flex justify-between items-center pt-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-green-500 hover:bg-green-100 text-green-700 dark:hover:bg-green-900"
                  onClick={onAccept}
                >
                  <CheckCircle className="mr-1 h-4 w-4" />
                  Zastosuj
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-muted-foreground"
                  onClick={onReject}
                >
                  <XCircle className="mr-1 h-4 w-4" />
                  Odrzuć
                </Button>
              </div>
              
              {/* Feedback component for rating suggestion quality */}
              <SuggestionFeedback 
                onFeedback={onFeedback}
                isFeedbackGiven={isFeedbackGiven}
              />
            </div>
          )}
          
          {/* Show acceptance status if applied */}
          {isAccepted && (
            <div className="text-green-600 text-sm flex items-center">
              <CheckCircle className="h-4 w-4 mr-1" />
              Zastosowano sugestię
            </div>
          )}
        </div>
      </div>
    </div>
  );
}