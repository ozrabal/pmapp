import React, { useState } from "react";
import { type FunctionalBlockDto } from "../../../types";
import { FunctionalBlockItem } from "./FunctionalBlockItem";
import { AddBlockButton } from "./AddBlockButton";
import type { DragState } from "./types";
import { FunctionalBlockForm } from "./FunctionalBlockForm";
import { type FunctionalBlockFormValues } from "./types";

interface FunctionalBlocksListProps {
  blocks: FunctionalBlockDto[];
  selectedBlockId: string | null;
  onReorder: (blocks: FunctionalBlockDto[]) => void;
  onAddBlock: () => void;
  onEditBlock: (blockId: string) => void;
  onDeleteBlock: (blockId: string) => void;
  onUpdateBlock: (blockId: string, values: FunctionalBlockFormValues) => void;
  onCancelEdit: () => void;
}

export function FunctionalBlocksList({
  blocks,
  selectedBlockId,
  onReorder,
  onAddBlock,
  onEditBlock,
  onDeleteBlock,
  onUpdateBlock,
  onCancelEdit,
}: FunctionalBlocksListProps) {
  // Stan przeciągania
  const [dragState, setDragState] = useState<DragState>({
    isDragging: false,
    draggedId: null,
    dragOverId: null,
  });

  // Obsługa rozpoczęcia przeciągania
  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, blockId: string) => {
    e.dataTransfer.setData("text/plain", blockId);
    setDragState({
      isDragging: true,
      draggedId: blockId,
      dragOverId: null,
    });
  };

  // Obsługa przeciągania nad innym elementem
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, blockId: string) => {
    e.preventDefault();
    if (dragState.draggedId !== blockId) {
      setDragState({
        ...dragState,
        dragOverId: blockId,
      });
    }
  };

  // Obsługa upuszczenia elementu
  const handleDrop = (e: React.DragEvent<HTMLDivElement>, targetId: string) => {
    e.preventDefault();

    const sourceId = e.dataTransfer.getData("text/plain");
    if (sourceId === targetId) {
      setDragState({
        isDragging: false,
        draggedId: null,
        dragOverId: null,
      });
      return;
    }

    // Znajdź indeksy przeciąganego i docelowego bloku
    const dragIndex = blocks.findIndex((block) => block.id === sourceId);
    const hoverIndex = blocks.findIndex((block) => block.id === targetId);

    if (dragIndex === -1 || hoverIndex === -1) {
      return;
    }

    // Utwórz nową tablicę z aktualizowaną kolejnością
    const reorderedBlocks = [...blocks];
    const [movedBlock] = reorderedBlocks.splice(dragIndex, 1);
    reorderedBlocks.splice(hoverIndex, 0, movedBlock);

    // Wywołaj callback z nową kolejnością bloków
    onReorder(reorderedBlocks);

    // Resetuj stan przeciągania
    setDragState({
      isDragging: false,
      draggedId: null,
      dragOverId: null,
    });
  };

  // Obsługa zakończenia przeciągania
  const handleDragEnd = () => {
    setDragState({
      isDragging: false,
      draggedId: null,
      dragOverId: null,
    });
  };

  // Obsługa zapisywania formularza
  const handleSaveBlock = (blockId: string | undefined, values: FunctionalBlockFormValues) => {
    if (blockId) {
      onUpdateBlock(blockId, values);
    }
  };

  // Znajdź zaznaczony blok
  const selectedBlock = selectedBlockId ? blocks.find((block) => block.id === selectedBlockId) : null;

  return (
    <div className="space-y-4">
      {selectedBlock && (
        <div className="mb-6">
          <FunctionalBlockForm
            block={selectedBlock}
            allBlocks={blocks}
            onSave={handleSaveBlock}
            onCancel={onCancelEdit}
          />
        </div>
      )}

      {blocks.map((block) => (
        <div
          key={block.id}
          draggable={!selectedBlockId}
          onDragStart={(e) => handleDragStart(e, block.id)}
          onDragOver={(e) => handleDragOver(e, block.id)}
          onDrop={(e) => handleDrop(e, block.id)}
          onDragEnd={handleDragEnd}
          className={`relative ${dragState.draggedId === block.id ? "opacity-50" : "opacity-100"} ${
            dragState.dragOverId === block.id ? "border-2 border-primary border-dashed" : ""
          } transition-opacity`}
        >
          <FunctionalBlockItem
            block={block}
            isSelected={selectedBlockId === block.id}
            onEdit={() => onEditBlock(block.id)}
            onDelete={() => onDeleteBlock(block.id)}
            allBlocks={blocks}
          />
          {dragState.dragOverId === block.id && (
            <div className="absolute inset-0 border-2 border-primary border-dashed rounded-lg pointer-events-none"></div>
          )}
        </div>
      ))}

      {/* Przycisk dodawania nowego bloku - wyświetlany tylko gdy nie ma aktywnej edycji */}
      {!selectedBlockId && (
        <div className="mt-6">
          <AddBlockButton onClick={onAddBlock} />
        </div>
      )}
    </div>
  );
}
