import { useEffect, useRef } from "react";
import type { ProjectViewModel } from "./types";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteProjectModalProps {
  isOpen: boolean;
  project: ProjectViewModel | null;
  isDeleting: boolean;
  error: Error | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export function DeleteProjectModal({
  isOpen,
  project,
  isDeleting,
  error,
  onConfirm,
  onCancel,
}: DeleteProjectModalProps) {
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Focus cancel button when modal opens
  useEffect(() => {
    if (isOpen && !isDeleting && cancelButtonRef.current) {
      setTimeout(() => {
        cancelButtonRef.current?.focus();
      }, 50);
    }
  }, [isOpen, isDeleting]);

  if (!project) {
    return null;
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isDeleting) onCancel();
      }}
    >
      <DialogContent className="sm:max-w-md" aria-describedby="delete-project-description">
        <DialogHeader>
          <DialogTitle>Usuń projekt</DialogTitle>
          <DialogDescription id="delete-project-description">
            Czy na pewno chcesz usunąć projekt <strong>{project.name}</strong>? Tej operacji nie można cofnąć.
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive" className="mt-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error.message || "Wystąpił błąd podczas usuwania projektu."}</AlertDescription>
          </Alert>
        )}

        <DialogFooter className="flex sm:justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isDeleting} ref={cancelButtonRef}>
            Anuluj
          </Button>
          <Button type="button" variant="destructive" onClick={onConfirm} disabled={isDeleting} className="gap-2">
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Usuwanie...</span>
              </>
            ) : (
              <span>Usuń</span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
