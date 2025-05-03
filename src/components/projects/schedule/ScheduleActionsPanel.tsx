import React, { useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { CalendarClock } from "lucide-react";
import LoadingSpinner from "./LoadingSpinner";
import ExportScheduleDialog from "./ExportScheduleDialog";
import { useSchedule } from "./ScheduleContext";
import dayjs from "dayjs";

interface ScheduleActionsPanelProps {
  isScheduleEmpty: boolean;
  isGenerating: boolean;
  onGenerateSchedule: () => Promise<void>;
}

const ScheduleActionsPanel: React.FC<ScheduleActionsPanelProps> = ({
  isScheduleEmpty,
  isGenerating,
  onGenerateSchedule,
}) => {
  const [isExportDialogOpen, setIsExportDialogOpen] = useState(false);
  const { schedule } = useSchedule();
  const lastUpdatedDate = useMemo(
    () => (schedule?.lastUpdated ? dayjs(schedule?.lastUpdated).format("YYYY-MM-DD HH:mm:ss") : undefined),
    [schedule?.lastUpdated]
  );

  // Handle export dialog opening
  // const handleExportClick = () => {
  //   if (!schedule) return;
  //   setIsExportDialogOpen(true);
  // };

  return (
    <>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-lg bg-muted/50 border border-border">
        <div className="flex-1">
          <h2 className="text-lg font-medium">Harmonogram projektu</h2>
          <div className="flex flex-col gap-1 text-sm text-muted-foreground">
            <p>
              {isScheduleEmpty
                ? "Generuj harmonogram lub dodaj etapy ręcznie"
                : "Zarządzaj etapami projektu i ich kolejnością"}
            </p>
            {schedule?.isGeneratedByAI && (
              <span className="bg-secondary text-secondary-foreground text-xs px-2 py-1 rounded">
                Wygenerowano przez AI
              </span>
            )}
            {lastUpdatedDate && <span>Ostatnia aktualizacja: {lastUpdatedDate}</span>}
            <span>Liczba etapów: {schedule?.stages.length}</span>
          </div>
        </div>

        <div className="flex gap-2 self-end sm:self-auto">
          <Button
            variant="default"
            size="sm"
            onClick={onGenerateSchedule}
            disabled={isGenerating}
            className="flex items-center gap-2"
          >
            {isGenerating ? (
              <>
                <LoadingSpinner size="sm" />
                <span>Generowanie...</span>
              </>
            ) : (
              <>
                <CalendarClock className="h-4 w-4" />
                <span>{isScheduleEmpty ? "Generuj harmonogram" : "Regeneruj"}</span>
              </>
            )}
          </Button>

          {/* {!isScheduleEmpty && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={true} // Disabled as per implementation plan
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      <span>Eksportuj</span>
                    </Button>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p className="text-sm">Funkcja eksportu będzie dostępna w przyszłej wersji</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )} */}
        </div>
      </div>

      {/* Export Dialog - will be enabled in future version */}
      {schedule && (
        <ExportScheduleDialog
          isOpen={isExportDialogOpen}
          onClose={() => setIsExportDialogOpen(false)}
          schedule={schedule}
        />
      )}
    </>
  );
};

export default ScheduleActionsPanel;
