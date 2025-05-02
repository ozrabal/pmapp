import React from "react";
import { type FunctionalBlockDto } from "../../../types";
import { type FunctionalBlockFormValues } from "./types";
import { FunctionalBlockForm } from "./FunctionalBlockForm";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../../ui/dialog";

interface FunctionalBlockFormDialogProps {
  block?: FunctionalBlockDto | null;
  allBlocks: FunctionalBlockDto[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (blockId: string | undefined, values: FunctionalBlockFormValues) => void;
}

export function FunctionalBlockFormDialog({
  block,
  allBlocks,
  isOpen,
  onClose,
  onSave,
}: FunctionalBlockFormDialogProps) {
  const isNewBlock = !block;

  const handleSave = (blockId: string | undefined, values: FunctionalBlockFormValues) => {
    onSave(blockId, values);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isNewBlock ? "Dodaj nowy blok funkcjonalny" : "Edytuj blok funkcjonalny"}</DialogTitle>
          <DialogDescription>
            {isNewBlock
              ? "Wypełnij formularz, aby utworzyć nowy blok funkcjonalny."
              : "Zmodyfikuj właściwości bloku funkcjonalnego."}
          </DialogDescription>
        </DialogHeader>

        <div className="py-2">
          <FunctionalBlockForm
            block={block}
            allBlocks={allBlocks}
            onSave={handleSave}
            onCancel={onClose}
            inModal={true}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
