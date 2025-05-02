import { useState, useEffect, useCallback, useMemo } from "react";
import type { FunctionalBlockDto, ProjectDto, GenerateFunctionalBlocksResponseDto } from "../../../../types";

/**
 * Hook managing the state of functional blocks
 */
export function useFunctionalBlocks(projectId: string) {
  // Block state
  const [blocks, setBlocks] = useState<FunctionalBlockDto[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch blocks from project
  const fetchBlocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Fetching project
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error("Nie udało się pobrać danych projektu");
      }

      const project: ProjectDto = await response.json();

      // Convert functionalBlocks from JSON to array
      const functionalBlocksData = project.functionalBlocks
        ? (project.functionalBlocks as unknown as { blocks: FunctionalBlockDto[] }).blocks || []
        : [];

      setBlocks(functionalBlocksData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas pobierania danych");
    } finally {
      setIsLoading(false);
    }
  }, [projectId]);

  // Update blocks in project
  const updateBlocks = useCallback(
    async (updatedBlocks: FunctionalBlockDto[]) => {
      setIsLoading(true);
      setError(null);

      try {
        // Update project
        const response = await fetch(`/api/projects/${projectId}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            functionalBlocks: { blocks: updatedBlocks },
          }),
        });

        if (!response.ok) {
          throw new Error("Nie udało się zapisać zmian");
        }

        setBlocks(updatedBlocks);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Wystąpił błąd podczas zapisywania zmian");
      } finally {
        setIsLoading(false);
      }
    },
    [projectId]
  );

  // Generate blocks with AI
  const generateBlocks = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Call endpoint to generate blocks
      const response = await fetch(`/api/projects/${projectId}/functional-blocks/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Nie udało się wygenerować bloków funkcjonalnych");
      }

      const data: GenerateFunctionalBlocksResponseDto = await response.json();

      // Update blocks after generation
      await updateBlocks(data.functionalBlocks.blocks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Wystąpił błąd podczas generowania bloków");
    } finally {
      setIsLoading(false);
    }
  }, [projectId, updateBlocks]);

  // Add new block
  const addBlock = useCallback(
    (blockData?: Partial<FunctionalBlockDto>) => {
      // Create new block with unique id
      const newBlock: FunctionalBlockDto = {
        id: crypto.randomUUID(),
        name: blockData?.name || "Nowy blok funkcjonalny",
        description: blockData?.description || "Opis bloku funkcjonalnego",
        category: blockData?.category || "other",
        dependencies: blockData?.dependencies || [],
        order: blocks.length,
      };

      const updatedBlocks = [...blocks, newBlock];
      updateBlocks(updatedBlocks);
      return newBlock.id;
    },
    [blocks, updateBlocks]
  );

  // Update existing block
  const updateBlock = useCallback(
    (blockId: string, values: Partial<FunctionalBlockDto>) => {
      const updatedBlocks = blocks.map((block) => (block.id === blockId ? { ...block, ...values } : block));

      updateBlocks(updatedBlocks);
    },
    [blocks, updateBlocks]
  );

  // Delete block
  const deleteBlock = useCallback(
    (blockId: string) => {
      // Filter blocks and update dependencies
      const updatedBlocks = blocks
        .filter((block) => block.id !== blockId)
        .map((block) => ({
          ...block,
          dependencies: block.dependencies.filter((dep) => dep !== blockId),
        }));

      updateBlocks(updatedBlocks);
    },
    [blocks, updateBlocks]
  );

  // Reorder blocks
  const reorderBlocks = useCallback(
    (reorderedBlocks: FunctionalBlockDto[]) => {
      // Assign new order values based on array position
      const updatedBlocks = reorderedBlocks.map((block, index) => ({
        ...block,
        order: index,
      }));

      updateBlocks(updatedBlocks);
    },
    [updateBlocks]
  );

  // Effect to fetch blocks when component mounts
  useEffect(() => {
    fetchBlocks();
  }, [fetchBlocks]);

  return {
    blocks: useMemo(() => [...blocks].sort((a, b) => a.order - b.order), [blocks]),
    isLoading,
    error,
    generateBlocks,
    addBlock,
    updateBlock,
    deleteBlock,
    reorderBlocks,
    refreshBlocks: fetchBlocks,
  };
}
