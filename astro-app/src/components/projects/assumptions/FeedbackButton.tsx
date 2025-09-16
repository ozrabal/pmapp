import React from "react";
import { Button } from "../../ui/button";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import type { FeedbackButtonProps } from "./types";

/**
 * Component for providing feedback on AI suggestions
 */
export function FeedbackButton({ onFeedbackSubmit, isSubmitted, selectedFeedback, className }: FeedbackButtonProps) {
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {isSubmitted ? (
        <p className="text-xs text-muted-foreground italic">Thank you for your feedback</p>
      ) : (
        <>
          <span className="text-xs text-muted-foreground">Was this helpful?</span>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onFeedbackSubmit(true)}
            aria-label="This suggestion was helpful"
            disabled={isSubmitted}
            className="h-6 w-6 rounded-full"
            data-selected={selectedFeedback === true}
          >
            <ThumbsUp className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => onFeedbackSubmit(false)}
            aria-label="This suggestion was not helpful"
            disabled={isSubmitted}
            className="h-6 w-6 rounded-full"
            data-selected={selectedFeedback === false}
          >
            <ThumbsDown className="h-3.5 w-3.5 text-muted-foreground hover:text-primary" />
          </Button>
        </>
      )}
    </div>
  );
}
