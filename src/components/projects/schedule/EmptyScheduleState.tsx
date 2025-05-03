import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock, PlusCircle } from "lucide-react";

interface EmptyScheduleStateProps {
  onGenerateSchedule: () => Promise<void>;
}

const EmptyScheduleState: React.FC<EmptyScheduleStateProps> = ({ onGenerateSchedule }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="mb-4 p-3 bg-primary/10 rounded-full">
        <CalendarClock className="h-10 w-10 text-primary" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">Brak harmonogramu projektu</h3>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        Harmonogram projektu pomoże Ci zaplanować etapy rozwoju i monitorować postęp prac. Możesz wygenerować
        harmonogram automatycznie w oparciu o bloki funkcjonalne projektu.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="default" onClick={onGenerateSchedule} className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          Generuj harmonogram
        </Button>
        <Button variant="outline" className="flex items-center gap-2">
          <PlusCircle className="h-4 w-4" />
          Dodaj etap ręcznie
        </Button>
      </div>
    </div>
  );
};

export default EmptyScheduleState;
