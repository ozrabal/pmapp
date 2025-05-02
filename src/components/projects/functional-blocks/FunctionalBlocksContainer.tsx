import React from "react";
import { useFunctionalBlocks } from "./hooks/useFunctionalBlocks";
import { LoadingState } from "./LoadingState";
import { EmptyState } from "./EmptyState";
import { GenerateBlocksButton } from "./GenerateBlocksButton";
import { FunctionalBlocksList } from "./FunctionalBlocksList";
import { type FunctionalBlockFormValues } from "./types";

interface FunctionalBlocksContainerProps {
  projectId: string;
}

export default function FunctionalBlocksContainer({ projectId }: FunctionalBlocksContainerProps) {
  const {
    blocks,
    isLoading,
    error,
    selectedBlockId,
    setSelectedBlockId,
    generateBlocks,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    refreshBlocks,
  } = useFunctionalBlocks(projectId);

  // Handle generation of blocks
  const handleGenerateBlocks = async () => {
    try {
      await generateBlocks();
    } catch (err) {
      console.error("Error generating blocks:", err);
    }
  };

  // Handle block update from form
  const handleUpdateBlock = (blockId: string, values: FunctionalBlockFormValues) => {
    updateBlock(blockId, values);
  };

  // Cancel edit mode
  const handleCancelEdit = () => {
    setSelectedBlockId(null);
  };

  // If loading initially
  if (isLoading && blocks.length === 0) {
    return <LoadingState message="Ładowanie bloków funkcjonalnych..." />;
  }

  return (
    <div className="p-6">
      {/* Error display */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-lg">
          <p className="text-red-600 font-medium">{error}</p>
          <button onClick={refreshBlocks} className="mt-2 text-sm text-red-700 hover:text-red-800 font-medium">
            Spróbuj ponownie
          </button>
        </div>
      )}

      {/* Header with actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-xl font-semibold text-neutral-800">Bloki funkcjonalne</h2>
        <GenerateBlocksButton
          onClick={handleGenerateBlocks}
          isLoading={isLoading}
          disabled={selectedBlockId !== null}
        />
      </div>

      {/* Content */}
      {blocks.length > 0 ? (
        <FunctionalBlocksList
          blocks={blocks}
          selectedBlockId={selectedBlockId}
          onReorder={reorderBlocks}
          onAddBlock={addBlock}
          onEditBlock={setSelectedBlockId}
          onDeleteBlock={deleteBlock}
          onUpdateBlock={handleUpdateBlock}
          onCancelEdit={handleCancelEdit}
        />
      ) : (
        <EmptyState onGenerate={handleGenerateBlocks} isLoading={isLoading} />
      )}

      {/* Loading overlay for async operations */}
      {isLoading && blocks.length > 0 && (
        <div className="fixed inset-0 bg-black/5 flex items-center justify-center z-10">
          <LoadingState message="Przetwarzanie..." />
        </div>
      )}
    </div>
  );
}
