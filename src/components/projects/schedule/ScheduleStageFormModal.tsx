import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { type ScheduleStageViewModel } from "./types";
import { useStageValidation } from "./hooks/useStageValidation";
import { AlertCircle, AlertTriangle } from "lucide-react";

interface ScheduleStageFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  stage?: ScheduleStageViewModel;
  availableDependencies: ScheduleStageViewModel[];
  onSubmit: (stageData: Partial<ScheduleStageViewModel>) => Promise<void>;
}

const ScheduleStageFormModal: React.FC<ScheduleStageFormModalProps> = ({
  isOpen,
  onClose,
  stage,
  availableDependencies,
  onSubmit,
}) => {
  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [dependencies, setDependencies] = useState<string[]>([]);

  // Submission state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [showValidationFeedback, setShowValidationFeedback] = useState(false);

  // Use our validation hook
  const { errors, validateStage } = useStageValidation(availableDependencies, {
    requireName: true,
    checkDependencyCycles: true,
  });

  // Reset form when modal opens or stage changes
  useEffect(() => {
    if (isOpen) {
      if (stage) {
        // Editing existing stage
        setName(stage.name);
        setDescription(stage.description);
        setDependencies(stage.dependencies || []);
      } else {
        // Adding new stage
        setName("");
        setDescription("");
        setDependencies([]);
      }
      setServerError(null);
      setShowValidationFeedback(false);
    }
  }, [isOpen, stage]);

  // Validate form
  const runValidation = (): boolean => {
    // Create a temporary stage data object for validation
    const stageData: Partial<ScheduleStageViewModel> = {
      id: stage?.id,
      name,
      description,
      dependencies,
    };

    // Run validation through our hook
    const validationResult = validateStage(stageData, stage?.id);
    setShowValidationFeedback(true);

    return validationResult.isValid;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!runValidation()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setServerError(null);

      await onSubmit({
        id: stage?.id,
        name,
        description,
        dependencies,
      });

      onClose();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania etapu");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dependency selection
  const handleDependencySelect = (dependencyId: string) => {
    if (dependencies.includes(dependencyId)) {
      setDependencies(dependencies.filter((id) => id !== dependencyId));
    } else {
      setDependencies([...dependencies, dependencyId]);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !isSubmitting && !open && onClose()}>
      <DialogContent className="w-full !container ">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{stage ? "Edytuj etap" : "Dodaj nowy etap"}</DialogTitle>
            <DialogDescription>
              {stage
                ? "Zaktualizuj szczegóły wybranego etapu harmonogramu projektu."
                : "Utwórz nowy etap harmonogramu projektu."}
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            {/* Name input */}
            <div className="space-y-2">
              <Label htmlFor="stage-name" className="text-right">
                Nazwa etapu <span className="text-red-500">*</span>
              </Label>
              <Input
                id="stage-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={errors.name && showValidationFeedback ? "border-red-500" : ""}
                placeholder="np. Projektowanie interfejsu użytkownika"
                aria-invalid={errors.name && showValidationFeedback ? "true" : "false"}
                aria-describedby={errors.name && showValidationFeedback ? "name-error" : undefined}
              />
              {errors.name && showValidationFeedback && (
                <p id="name-error" className="text-sm text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  <span>{errors.name}</span>
                </p>
              )}
            </div>

            {/* Description textarea */}
            <div className="space-y-2">
              <Label htmlFor="stage-description" className="text-right">
                Opis
              </Label>
              <Textarea
                id="stage-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Opisz zakres i cele tego etapu"
                rows={4}
              />
            </div>

            {/* Dependencies select */}
            <div className="space-y-2">
              <Label htmlFor="stage-dependencies" className="text-right">
                Zależności
              </Label>

              {availableDependencies.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm text-muted-foreground mb-2">
                    Wybierz etapy, które muszą być ukończone przed rozpoczęciem tego etapu:
                  </div>
                  <div
                    className={`flex flex-wrap gap-2 p-2 border rounded-md ${
                      errors.dependencies && showValidationFeedback ? "bg-red-50 border-red-300" : "bg-muted/30"
                    }`}
                  >
                    {availableDependencies.map((dep) => (
                      <div
                        key={dep.id}
                        className={`
                          px-3 py-2 rounded-md cursor-pointer text-sm
                          ${
                            dependencies.includes(dep.id)
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted hover:bg-muted/70"
                          }
                        `}
                        onClick={() => handleDependencySelect(dep.id)}
                        role="checkbox"
                        aria-checked={dependencies.includes(dep.id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleDependencySelect(dep.id);
                          }
                        }}
                      >
                        {dep.name}
                      </div>
                    ))}
                  </div>
                  {errors.dependencies && showValidationFeedback && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      <span>{errors.dependencies}</span>
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">Kliknij, aby dodać lub usunąć zależność</div>
                </div>
              ) : (
                <div className="text-sm text-muted-foreground p-2 border rounded-md bg-muted/30">
                  {stage
                    ? "Brak dostępnych zależności dla tego etapu"
                    : "Brak istniejących etapów, które można dodać jako zależności"}
                </div>
              )}
            </div>

            {/* Server error message */}
            {serverError && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{serverError}</AlertDescription>
              </Alert>
            )}
          </div>

          <Separator className="my-4" />

          <DialogFooter className="flex justify-between">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Anuluj
            </Button>
            <Button type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
              {isSubmitting ? "Zapisywanie..." : stage ? "Zapisz zmiany" : "Dodaj etap"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ScheduleStageFormModal;
