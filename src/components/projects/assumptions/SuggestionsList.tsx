import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";
import { SuggestionItem } from "./SuggestionItem";
import { Sparkles } from "lucide-react";
import type { SuggestionsListProps } from "./types";

/**
 * Component for displaying a list of AI suggestions
 */
export function SuggestionsList({
  suggestions,
  onAccept,
  onReject,
  onFeedbackSubmit,
  isLoading,
  className,
}: SuggestionsListProps) {
  // Filter out rejected suggestions for initial display
  const [showRejected, setShowRejected] = useState(false);

  // Filter and sort suggestions
  const activeSuggestions = suggestions
    .filter((s) => !s.isRejected || showRejected)
    .sort((a, b) => {
      // Show non-rejected/accepted first
      if (!a.isRejected && !a.isAccepted && (b.isRejected || b.isAccepted)) return -1;
      if ((a.isRejected || a.isAccepted) && !b.isRejected && !b.isAccepted) return 1;
      return 0;
    });

  const rejectedCount = suggestions.filter((s) => s.isRejected).length;

  if (suggestions.length === 0 && !isLoading) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-blue-500" />
          <CardTitle className="text-lg">AI Suggestions</CardTitle>
        </div>
        <CardDescription>
          {isLoading
            ? "Analyzing your assumptions..."
            : `${suggestions.length} suggestion${suggestions.length !== 1 ? "s" : ""} to improve your project assumptions`}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center py-6">
            <div className="animate-pulse flex flex-col space-y-4 w-full">
              <div className="h-20 bg-muted rounded-md w-full"></div>
              <div className="h-20 bg-muted rounded-md w-full"></div>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {activeSuggestions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No suggestions available.</p>
            ) : (
              <>
                {activeSuggestions.map((suggestion) => (
                  <SuggestionItem
                    key={suggestion.id}
                    suggestion={suggestion}
                    onAccept={() => onAccept(suggestion.id)}
                    onReject={() => onReject(suggestion.id)}
                    onFeedbackSubmit={(isHelpful) => onFeedbackSubmit(suggestion.id, isHelpful)}
                  />
                ))}

                {rejectedCount > 0 && (
                  <div className="flex justify-center pt-2">
                    <button
                      onClick={() => setShowRejected(!showRejected)}
                      className="text-xs text-muted-foreground hover:text-foreground underline hover:no-underline"
                    >
                      {showRejected ? "Hide" : "Show"} {rejectedCount} rejected suggestion
                      {rejectedCount !== 1 ? "s" : ""}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
