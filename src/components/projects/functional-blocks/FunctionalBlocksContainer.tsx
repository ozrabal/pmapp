import React, { useState } from "react";
import { useFunctionalBlocks } from "./hooks/useFunctionalBlocks";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { GenerateBlocksButton } from "./GenerateBlocksButton";
import { FunctionalBlocksList } from "./FunctionalBlocksList";
import { FunctionalBlockFormDialog } from "./FunctionalBlockFormDialog";
import { type FunctionalBlockFormValues } from "./types";
import { type FunctionalBlockDto } from "../../../types";
import { Card } from "@/components/ui/card";

interface FunctionalBlocksContainerProps {
  projectId: string;
}

export default function FunctionalBlocksContainer({ projectId }: FunctionalBlocksContainerProps) {
  const { blocks, isLoading, error, generateBlocks, addBlock, updateBlock, deleteBlock, reorderBlocks, refreshBlocks } =
    useFunctionalBlocks(projectId);
  // Dialog state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBlock, setEditingBlock] = useState<FunctionalBlockDto | null>(null);

  // Handle generation of blocks
  const handleGenerateBlocks = async () => {
    try {
      await generateBlocks();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("Error generating blocks:", err);
    }
  };

  // Open form dialog for adding a new block
  const handleAddBlock = () => {
    setEditingBlock(null);
    setIsFormOpen(true);
  };

  // Open form dialog for editing an existing block
  const handleEditBlock = (blockId: string) => {
    const blockToEdit = blocks.find((block) => block.id === blockId);
    if (blockToEdit) {
      setEditingBlock(blockToEdit);
      setIsFormOpen(true);
    }
  };

  // Close form dialog
  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingBlock(null);
  };

  // Handle form submission
  const handleSaveBlock = (blockId: string | undefined, values: FunctionalBlockFormValues) => {
    if (blockId) {
      // Update existing block
      updateBlock(blockId, values);
    } else {
      // Create a new block with form values
      const newBlockData: Partial<FunctionalBlockDto> = {
        name: values.name,
        description: values.description,
        category: values.category,
        dependencies: values.dependencies,
      };

      addBlock(newBlockData);
    }

    // Close the dialog
    handleCloseForm();
  };

  // If loading initially
  if (isLoading && blocks.length === 0) {
    return <LoadingState message="Loading functional blocks..." />;
  }

  return (
    <Card className="p-6">
      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={refreshBlocks} className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium">
            Try again
          </button>
        </div>
      )}

      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-neutral-800">Functional Blocks</h2>
        <GenerateBlocksButton onClick={handleGenerateBlocks} isLoading={isLoading} />
      </div>

      {/* Content */}
      {blocks.length > 0 ? (
        <FunctionalBlocksList
          blocks={blocks}
          onReorder={reorderBlocks}
          onAddBlock={handleAddBlock}
          onEditBlock={handleEditBlock}
          onDeleteBlock={deleteBlock}
        />
      ) : (
        <EmptyState onGenerate={handleGenerateBlocks} isLoading={isLoading} />
      )}

      {/* Functional Block Form Dialog */}
      <FunctionalBlockFormDialog
        block={editingBlock}
        allBlocks={blocks}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSave={handleSaveBlock}
      />

      {/* Loading overlay for async operations */}
      {isLoading && blocks.length > 0 && (
        <div className="fixed inset-0 bg-black/5 flex items-center justify-center z-10">
          <LoadingState message="Processing..." />
        </div>
      )}
    </Card>
  );
}
