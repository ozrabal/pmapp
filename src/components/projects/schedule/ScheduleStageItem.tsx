import React, { useState } from "react";
import { type ScheduleStageViewModel } from "./types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronDown, ChevronUp, Edit, Trash2, GripVertical, AlertTriangle, AlertCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface ScheduleStageItemProps {
  stage: ScheduleStageViewModel;
  dependencies: ScheduleStageViewModel[];
  dependentStages: ScheduleStageViewModel[];
  onEdit: () => void;
  onDelete: () => void;
}

const ScheduleStageItem: React.FC<ScheduleStageItemProps> = ({
  stage,
  dependencies,
  dependentStages,
  onEdit,
  onDelete,
}) => {
  const [isExpanded, setIsExpanded] = useState(stage.isExpanded || false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Format stage dependencies for display
  const hasDependencies = dependencies.length > 0;
  const hasDependents = dependentStages.length > 0;

  // Toggle expand/collapse state
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    setShowDeleteConfirm(false); // Hide delete confirmation when toggling
  };

  // Handle delete button click
  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation();

    if (hasDependents) {
      // Don't allow delete if there are dependent stages
      return;
    }

    setShowDeleteConfirm(true);
  };

  // Handle cancel delete
  const handleCancelDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
  };

  // Handle confirm delete
  const handleConfirmDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowDeleteConfirm(false);
    onDelete();
  };

  // Handle edit click
  const handleEditClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
  };

  return (
    <Card
      className={cn(
        "transition-all duration-200",
        isExpanded ? "shadow-md border-primary/40" : "hover:shadow-sm",
        "group relative"
      )}
    >
      {/* Drag handle icon */}
      <div
        className="absolute left-2 inset-y-0 flex items-center text-muted-foreground/60 cursor-move"
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-5 w-5" />
      </div>

      <CardHeader className="flex flex-row items-center justify-between p-4 pl-8 cursor-pointer" onClick={toggleExpand}>
        <div>
          <h3 className="text-lg font-medium flex items-center">{stage.name}</h3>

          <div className="flex flex-wrap gap-2 mt-1">
            {/* Dependencies badge */}
            {hasDependencies && (
              <Badge variant="outline" className="text-xs font-normal">
                {dependencies.length} {dependencies.length === 1 ? "dependency" : "dependencies"}
              </Badge>
            )}

            {/* Dependent stages badge */}
            {hasDependents && (
              <Badge
                variant="outline"
                className="text-xs font-normal bg-amber-50 text-amber-800 hover:bg-amber-100 border-amber-200"
              >
                {dependentStages.length} {dependentStages.length === 1 ? "dependent stage" : "dependent stages"}
              </Badge>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
            onClick={handleEditClick}
            aria-label="Edit stage"
          >
            <Edit className="h-4 w-4" />
          </Button>

          {isExpanded && (
            <>
              {/* Show icon if there are dependent stages */}
              {hasDependents ? (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div>
                        <span className="inline-flex ml-2">
                          <AlertTriangle className="h-4 w-4 text-amber-500" aria-hidden="true" />
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          className={cn(
                            "h-8 w-8 p-0 opacity-70 hover:opacity-100",
                            hasDependents && "opacity-40 cursor-not-allowed"
                          )}
                          onClick={handleDeleteClick}
                          disabled={hasDependents}
                          aria-label={hasDependents ? "Cannot delete a stage with dependent stages" : "Delete stage"}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>This stage has dependent stages. It cannot be deleted.</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn(
                    "h-8 w-8 p-0 opacity-70 hover:opacity-100",
                    hasDependents && "opacity-40 cursor-not-allowed"
                  )}
                  onClick={handleDeleteClick}
                  disabled={hasDependents}
                  aria-label={hasDependents ? "Cannot delete a stage with dependent stages" : "Delete stage"}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 opacity-70 hover:opacity-100"
            onClick={toggleExpand}
            aria-label={isExpanded ? "Collapse details" : "Expand details"}
            aria-expanded={isExpanded}
          >
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </Button>
        </div>
      </CardHeader>

      {/* Expanded content */}
      {isExpanded && (
        <>
          <CardContent className="px-8 pt-0 pb-3">
            <div className="mb-3">
              {stage.description ? (
                <p className="text-sm text-gray-700 whitespace-pre-wrap">{stage.description}</p>
              ) : (
                <p className="text-sm text-muted-foreground italic">No stage description</p>
              )}
            </div>

            {/* Dependencies section */}
            {hasDependencies && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Dependencies:</h4>
                <div className="flex flex-wrap gap-2">
                  {dependencies.map((dep) => (
                    <Badge key={dep.id} variant="secondary" className="text-xs">
                      {dep.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Dependent stages section */}
            {hasDependents && (
              <div className="mt-4">
                <h4 className="text-sm font-medium mb-2">Dependent stages:</h4>
                <div className="flex flex-wrap gap-2">
                  {dependentStages.map((dep) => (
                    <Badge key={dep.id} variant="secondary" className="text-xs">
                      {dep.name}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>

          {/* Delete confirmation */}
          {showDeleteConfirm && (
            <CardFooter className="flex justify-between p-4 pt-0 border-t">
              <div className="flex items-center text-red-600 gap-2">
                <AlertCircle className="h-4 w-4" />
                <p className="text-sm font-medium">Are you sure you want to delete this stage?</p>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleCancelDelete}>
                  Cancel
                </Button>
                <Button variant="destructive" size="sm" onClick={handleConfirmDelete}>
                  Delete
                </Button>
              </div>
            </CardFooter>
          )}
        </>
      )}
    </Card>
  );
};

export default ScheduleStageItem;
