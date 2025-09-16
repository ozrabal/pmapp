import React from "react";

interface ProjectNameInputProps {
  value: string;
  error: string | null;
  onChange: (value: string) => void;
  onBlur: () => void;
  id: string;
  disabled?: boolean;
}

export const ProjectNameInput: React.FC<ProjectNameInputProps> = ({
  value,
  error,
  onChange,
  onBlur,
  id,
  disabled = false,
}) => {
  // Counter for real-time character tracking
  const maxLength = 200;
  const charsRemaining = maxLength - value.length;
  const isNearLimit = value.length > maxLength * 0.9;
  const isAtLimit = value.length >= maxLength;

  // Handle Enter key to proceed to the next field
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onBlur(); // Validate on enter
      // Find the next focusable element and focus it
      const form = e.currentTarget.form;
      if (form) {
        const formElements = Array.from(form.elements) as HTMLElement[];
        const currentIndex = formElements.indexOf(e.currentTarget);
        const nextElement = formElements[currentIndex + 1];
        if (nextElement) {
          nextElement.focus();
        }
      }
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <label htmlFor={id} className="block text-sm font-medium">
          Project name{" "}
          <span className="text-red-500" aria-hidden="true">
            *
          </span>
          <span className="sr-only"> (required)</span>
        </label>

        {/* Character counter for screen readers */}
        <span
          className={`text-xs ${
            isAtLimit ? "text-red-500 font-semibold" : isNearLimit ? "text-amber-600" : "text-muted-foreground"
          }`}
          aria-live="polite"
          aria-atomic="true"
        >
          {charsRemaining} {charsRemaining === 1 ? "character" : "characters"}
        </span>
      </div>

      <input
        type="text"
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        placeholder="Enter project name"
        maxLength={maxLength}
        autoComplete="off"
        spellCheck="true"
        required
        aria-required="true"
        className={`w-full rounded-md border px-3 py-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 ${
          error
            ? "border-red-300 focus-visible:border-red-500 focus-visible:ring-red-500"
            : "border-gray-300 focus-visible:border-blue-500 focus-visible:ring-blue-500"
        } ${disabled ? "bg-gray-100 text-gray-500 cursor-not-allowed" : "bg-white"}`}
        aria-invalid={error ? "true" : "false"}
        aria-describedby={error ? `${id}-error` : undefined}
      />

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

export default ProjectNameInput;
