import React from "react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";

interface TaskEstimationDisplayProps {
  estimatedValue: number | null;
  estimatedByAI?: boolean;
  aiConfidenceScore?: number | null;
  unit?: string;
}

/**
 * Component that displays a task's estimation value with optional AI confidence indication
 */
const TaskEstimationDisplay: React.FC<TaskEstimationDisplayProps> = ({
  estimatedValue,
  estimatedByAI = false,
  aiConfidenceScore = null,
  unit = "hours",
}) => {
  if (estimatedValue === null) {
    return <span className="text-gray-400 text-sm">Brak estymacji</span>;
  }

  // Format the display value
  const formattedValue = `${estimatedValue} ${unit === "hours" ? "godz." : "pkt"}`;

  // Render the confidence level if estimated by AI
  const getConfidenceLabel = (score: number | null) => {
    if (score === null) return "Nieznana";
    if (score >= 0.8) return "Wysoka";
    if (score >= 0.5) return "Średnia";
    return "Niska";
  };

  const getConfidenceColor = (score: number | null) => {
    if (score === null) return "text-gray-500";
    if (score >= 0.8) return "text-emerald-500";
    if (score >= 0.5) return "text-amber-500";
    return "text-red-500";
  };

  return (
    <div className="flex items-center gap-1">
      <span className="font-medium">{formattedValue}</span>

      {estimatedByAI && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <span className="cursor-help">
                <Sparkles className="h-4 w-4 text-indigo-500" />
              </span>
            </TooltipTrigger>
            <TooltipContent side="top">
              <div className="text-xs">
                <p>Estymacja wygenerowana przez AI</p>
                <p>
                  Pewność:{" "}
                  <span className={getConfidenceColor(aiConfidenceScore)}>{getConfidenceLabel(aiConfidenceScore)}</span>
                </p>
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
};

export default TaskEstimationDisplay;
