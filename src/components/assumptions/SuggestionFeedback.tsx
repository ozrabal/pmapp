import React from "react";
import { Button } from "../ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";

interface SuggestionFeedbackProps {
  onFeedback: (isHelpful: boolean) => void;
  isFeedbackGiven: boolean;
}

export function SuggestionFeedback({
  onFeedback,
  isFeedbackGiven
}: SuggestionFeedbackProps) {
  if (isFeedbackGiven) {
    return (
      <div className="text-xs text-muted-foreground">
        Dziękujemy za opinię
      </div>
    );
  }
  
  return (
    <div className="flex items-center gap-1">
      <span className="text-xs text-muted-foreground mr-1">
        Przydatne?
      </span>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => onFeedback(true)}
        aria-label="Ta sugestia jest przydatna"
      >
        <ThumbsUp className="h-3 w-3" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6"
        onClick={() => onFeedback(false)}
        aria-label="Ta sugestia nie jest przydatna"
      >
        <ThumbsDown className="h-3 w-3" />
      </Button>
    </div>
  );
}