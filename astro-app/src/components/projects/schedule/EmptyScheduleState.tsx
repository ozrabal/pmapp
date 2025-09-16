import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock, PlusCircle } from "lucide-react";

interface EmptyScheduleStateProps {
  onGenerateSchedule: () => Promise<void>;
  onAddStage: () => void;
}

const EmptyScheduleState: React.FC<EmptyScheduleStateProps> = ({ onGenerateSchedule, onAddStage }) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50 dark:bg-gray-900 dark:border-gray-800">
      <div className="mb-4 p-3 bg-primary/10 rounded-full">
        <CalendarClock className="h-10 w-10 text-primary" aria-hidden="true" />
      </div>
      <h3 className="text-xl font-medium text-gray-900 dark:text-gray-100 mb-2">No project schedule</h3>
      <p className="text-center text-gray-600 dark:text-gray-400 mb-6 max-w-md">
        The project schedule will help you plan development stages and monitor progress. You can generate the schedule
        automatically based on the project&apos;s functional blocks.
      </p>

      <div className="flex flex-col sm:flex-row gap-3">
        <Button variant="default" onClick={onGenerateSchedule} className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4" />
          Generate schedule
        </Button>
        <Button variant="outline" className="flex items-center gap-2" onClick={onAddStage}>
          <PlusCircle className="h-4 w-4" />
          Add stage manually
        </Button>
      </div>
    </div>
  );
};

export default EmptyScheduleState;
