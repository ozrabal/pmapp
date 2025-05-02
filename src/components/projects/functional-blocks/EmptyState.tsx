import React from "react";
import { Button } from "../../../components/ui/button";

interface EmptyStateProps {
  onGenerate: () => void;
  isLoading: boolean;
}

export function EmptyState({ onGenerate, isLoading }: EmptyStateProps) {
  return (
    <div className="bg-neutral-50 border border-dashed border-neutral-200 rounded-lg p-8 text-center">
      <div className="mx-auto mb-4 w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-8 h-8 text-neutral-400"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 6.042A8.967 8.967 0 0 0 6 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 0 1 6 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 0 1 6-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0 0 18 18a8.967 8.967 0 0 0-6 2.292m0-14.25v14.25"
          />
        </svg>
      </div>
      <h3 className="text-lg font-semibold mb-2 text-neutral-800">Brak bloków funkcjonalnych</h3>
      <p className="text-neutral-600 mb-6 max-w-md mx-auto">
        Bloki funkcjonalne pomagają podzielić projekt na mniejsze, łatwiejsze do zarządzania komponenty. Wygeneruj bloki
        automatycznie lub dodaj je ręcznie.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onGenerate} disabled={isLoading} className="flex items-center gap-2">
          {isLoading ? (
            <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-5 h-5"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 18.75h-9.75a2.25 2.25 0 0 1-2.25-2.25v-9.75a2.25 2.25 0 0 1 2.25-2.25h9.75a2.25 2.25 0 0 1 2.25 2.25v9.75a2.25 2.25 0 0 1-2.25 2.25Z"
              />
            </svg>
          )}
          Generuj bloki funkcjonalne z AI
        </Button>
      </div>
    </div>
  );
}
