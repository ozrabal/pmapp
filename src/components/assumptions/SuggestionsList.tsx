import React from "react";
import type { SuggestionViewModel } from "./types";
import { SuggestionItem } from "./SuggestionItem";
import { Loader2 } from "lucide-react";

interface SuggestionsListProps {
  suggestions: SuggestionViewModel[];
  isLoading: boolean;
  onAccept: (suggestionId: string) => void;
  onReject: (suggestionId: string) => void;
  onFeedback: (suggestionId: string, isHelpful: boolean) => void;
}

export function SuggestionsList({
  suggestions,
  isLoading,
  onAccept,
  onReject,
  onFeedback
}: SuggestionsListProps) {
  // Filter out rejected suggestions and sort by field
  const visibleSuggestions = suggestions
    .filter(suggestion => !suggestion.isRejected)
    .sort((a, b) => {
      if (!a.field) return 1;
      if (!b.field) return -1;
      return a.field.localeCompare(b.field);
    });
  
  // Group suggestions by field for better organization
  const groupedSuggestions: Record<string, SuggestionViewModel[]> = {};
  
  visibleSuggestions.forEach(suggestion => {
    const key = suggestion.field || 'general';
    if (!groupedSuggestions[key]) {
      groupedSuggestions[key] = [];
    }
    groupedSuggestions[key].push(suggestion);
  });
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-10">
        <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
        <p className="text-muted-foreground">Generowanie sugestii...</p>
      </div>
    );
  }
  
  if (visibleSuggestions.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground mb-2">Brak sugestii poprawy założeń.</p>
        <p className="text-sm text-muted-foreground">
          To dobry znak! Twoje założenia projektu są już dobrze opisane.
        </p>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      {Object.entries(groupedSuggestions).map(([field, fieldSuggestions]) => (
        <div key={field} className="space-y-4">
          {field !== 'general' && (
            <h4 className="font-medium">
              {fieldSuggestions[0].fieldLabel || 'Ogólne sugestie'}
            </h4>
          )}
          <div className="space-y-4">
            {fieldSuggestions.map((suggestion) => (
              <SuggestionItem
                key={suggestion.id}
                suggestion={suggestion}
                onAccept={() => onAccept(suggestion.id)}
                onReject={() => onReject(suggestion.id)}
                onFeedback={(isHelpful) => onFeedback(suggestion.id, isHelpful)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}