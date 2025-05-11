import React from "react";
import { Card, CardContent } from "../../ui/card";
import { Button } from "../../ui/button";
import { Lightbulb, Check, X } from "lucide-react";
import { FeedbackButton } from "./FeedbackButton";
import type { SuggestionItemProps } from "./types";

/**
 * Component for displaying an individual AI suggestion with actions
 */
export function SuggestionItem({
  suggestion,
  onAccept,
  onReject,
  onFeedbackSubmit,
  disabled = false,
  className,
}: SuggestionItemProps) {
  const isDisabled = disabled || suggestion.isAccepted || suggestion.isRejected || suggestion.outdated;
  const getStatusBadge = () => {
    if (suggestion.isAccepted) {
      return (
        <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 rounded-full">
          Applied
        </span>
      );
    }
    if (suggestion.isRejected) {
      return (
        <span className="text-xs px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 rounded-full">
          Rejected
        </span>
      );
    }
    if (suggestion.outdated) {
      return (
        <span className="text-xs px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-full">
          Outdated
        </span>
      );
    }
    return null;
  };

  return (
    <Card
      className={`border-l-4 ${suggestion.isAccepted ? "border-l-green-500" : suggestion.isRejected ? "border-l-gray-300" : "border-l-blue-500"} ${className}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-2">
          <Lightbulb className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="font-medium text-sm">
                {suggestion.field && (
                  <span className="text-muted-foreground">
                    {suggestion.field.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase())}:{" "}
                  </span>
                )}
                {getStatusBadge()}
              </div>
            </div>

            <div className="text-sm">
              <p className="mb-1.5">{suggestion.suggestion}</p>
              <p className="text-xs text-muted-foreground italic">Reason: {suggestion.reason}</p>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onAccept}
                  disabled={isDisabled}
                  aria-label="Accept suggestion"
                  className="h-7 px-2 text-xs"
                >
                  <Check className="w-3.5 h-3.5 mr-1" />
                  Accept
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={onReject}
                  disabled={isDisabled}
                  aria-label="Reject suggestion"
                  className="h-7 px-2 text-xs"
                >
                  <X className="w-3.5 h-3.5 mr-1" />
                  Dismiss
                </Button>
              </div>

              <FeedbackButton
                onFeedbackSubmit={onFeedbackSubmit}
                isSubmitted={suggestion.isFeedbackGiven}
                selectedFeedback={suggestion.isHelpful}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
