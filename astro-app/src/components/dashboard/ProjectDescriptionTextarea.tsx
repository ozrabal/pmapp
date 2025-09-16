import React from "react";

interface ProjectDescriptionTextareaProps {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onBlur: () => void;
  id: string;
  maxLength: number;
  disabled?: boolean;
}

export const ProjectDescriptionTextarea: React.FC<ProjectDescriptionTextareaProps> = ({
  value,
  error,
  onChange,
  onBlur,
  id,
  maxLength,
  disabled = false,
}) => {
  const charCount = value.length;
  const charsRemaining = maxLength - charCount;
  const isNearLimit = charCount > maxLength * 0.9;
  const isAtLimit = charCount >= maxLength;

  // Handle Ctrl+Enter or Cmd+Enter to submit the form
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Allow tab to work normally for keyboard navigation
    if (e.key === "Tab") {
      return;
    }

    // Submit form with Ctrl/Cmd + Enter
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      const form = e.currentTarget.form;
      if (form) {
        // Find and click the submit button
        const submitButton = form.querySelector('button[type="submit"]') as HTMLButtonElement;
        if (submitButton && !submitButton.disabled) {
          submitButton.click();
        }
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label htmlFor={id} className="block text-sm font-medium">
          Project description <span className="text-muted-foreground text-xs">(optional)</span>
        </label>

        {/* Character counter */}
        <span
          id={`${id}-counter`}
          className={`text-xs ${
            isAtLimit ? "text-red-500 font-semibold" : isNearLimit ? "text-amber-600" : "text-muted-foreground"
          }`}
          aria-live="polite"
          aria-atomic="true"
        >
          {charsRemaining} {charsRemaining === 1 ? "character" : "characters"}
        </span>
      </div>

      <div className="relative">
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Describe your project (optional)"
          rows={4}
          maxLength={maxLength}
          spellCheck="true"
          className={`w-full rounded-md border px-3 py-2 text-sm resize-y transition-colors focus-visible:outline-none focus-visible:ring-2 ${
            error
              ? "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500"
              : "border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500"
          } ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"}`}
          aria-invalid={error ? "true" : "false"}
          aria-describedby={`${id}-hint ${error ? `${id}-error` : ""}`}
        />

        <p id={`${id}-hint`} className="mt-1.5 text-xs text-muted-foreground">
          Briefly describe what your project is about. You can add details later.
          <span className="ml-1 inline-block">
            {isAtLimit ? <span className="text-red-500">(Character limit reached)</span> : null}
          </span>
        </p>
      </div>

      {error && (
        <p id={`${id}-error`} className="text-sm text-red-500 flex items-start gap-1" role="alert">
          <svg
            className="h-4 w-4 mt-0.5 flex-shrink-0"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span>{error}</span>
        </p>
      )}
    </div>
  );
};

export default ProjectDescriptionTextarea;
