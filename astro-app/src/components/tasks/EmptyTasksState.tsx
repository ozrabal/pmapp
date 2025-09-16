import React from "react";
import { Button } from "@/components/ui/button";
import { ClipboardList, Plus, Sparkles } from "lucide-react";

interface EmptyTasksStateProps {
  onAddTask: () => void;
  onGenerateTasksWithAI: () => void;
}

/**
 * Component to display when there are no tasks in a functional block
 */
const EmptyTasksState: React.FC<EmptyTasksStateProps> = ({ onAddTask, onGenerateTasksWithAI }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border border-dashed border-slate-300 rounded-lg bg-slate-50 dark:border-slate-700 dark:bg-slate-900/50">
      <div className="rounded-full bg-slate-100 p-3 dark:bg-slate-800 mb-4">
        <ClipboardList className="h-6 w-6 text-slate-500" />
      </div>

      <h3 className="font-medium text-base mb-1">Brak zadań</h3>

      <p className="text-sm text-slate-500 text-center mb-4 max-w-md">
        Ten blok funkcjonalny nie ma jeszcze żadnych zadań. Dodaj zadania ręcznie lub wygeneruj je przy pomocy AI.
      </p>

      <div className="flex flex-wrap justify-center gap-3">
        <Button variant="outline" onClick={onAddTask}>
          <Plus className="h-4 w-4 mr-1" /> Dodaj zadanie
        </Button>

        <Button
          variant="secondary"
          onClick={onGenerateTasksWithAI}
          className="bg-indigo-100 text-indigo-800 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-300 dark:hover:bg-indigo-900/70"
        >
          <Sparkles className="h-4 w-4 mr-1" /> Generuj zadania z AI
        </Button>
      </div>
    </div>
  );
};

export default EmptyTasksState;
