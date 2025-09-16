import { useState, useCallback } from "react";

interface UseDragOptions<T> {
  onDragEnd?: (sourceIndex: number, targetIndex: number, items: T[]) => void;
  onOrderChange?: (reorderedItems: T[]) => Promise<void>;
}

interface DragProps {
  draggable: boolean;
  onDragStart: (e: React.DragEvent<HTMLElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLElement>) => void;
  onDragEnter?: (e: React.DragEvent<HTMLElement>) => void;
  onDragLeave?: (e: React.DragEvent<HTMLElement>) => void;
  onDrop: (e: React.DragEvent<HTMLElement>) => void;
}

/**
 * Custom hook for implementing drag and drop functionality
 * @param items The array of items to be draggable
 * @param idField The field name that represents the unique identifier in each item
 * @param options Optional configuration options
 */
export function useDrag<T extends Record<string, unknown>>(
  items: T[],
  idField: keyof T,
  options: UseDragOptions<T> = {}
) {
  const [draggedItemId, setDraggedItemId] = useState<unknown | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Create a map of IDs to indices for quick lookup
  const idToIndexMap = items.reduce<Record<string, number>>((map, item, index) => {
    const id = String(item[idField]);
    map[id] = index;
    return map;
  }, {});

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent<HTMLElement>, itemId: unknown) => {
    // Set data transfer
    e.dataTransfer.setData("text/plain", String(itemId));
    e.dataTransfer.effectAllowed = "move";

    // Update state
    setDraggedItemId(itemId);
    setIsDragging(true);

    // Add styling to dragged element
    if (e.target instanceof HTMLElement) {
      e.target.classList.add("opacity-50");
    }
  }, []);

  // Handle drag end
  const handleDragEnd = useCallback((e: React.DragEvent<HTMLElement>) => {
    // Update state
    setDraggedItemId(null);
    setIsDragging(false);

    // Remove styling from dragged element
    if (e.target instanceof HTMLElement) {
      e.target.classList.remove("opacity-50");
    }
  }, []);

  // Handle drag over
  const handleDragOver = useCallback((e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  }, []);

  // Handle drop
  const handleDrop = useCallback(
    async (e: React.DragEvent<HTMLElement>, targetItemId: unknown) => {
      e.preventDefault();
      const sourceItemId = e.dataTransfer.getData("text/plain");

      // Don't do anything if dropped on itself
      if (sourceItemId === targetItemId || !sourceItemId) {
        return;
      }

      // Get indices
      const sourceIndex = idToIndexMap[sourceItemId];
      const targetIndex = idToIndexMap[String(targetItemId)];

      if (sourceIndex === undefined || targetIndex === undefined) {
        return;
      }

      // Create a copy of the items array
      const newItems = [...items];

      // Remove the source item
      const [sourceItem] = newItems.splice(sourceIndex, 1);

      // Insert at the target position
      newItems.splice(targetIndex, 0, sourceItem);

      // Call onDragEnd if provided
      options.onDragEnd?.(sourceIndex, targetIndex, newItems);

      // Call onOrderChange if provided
      if (options.onOrderChange) {
        await options.onOrderChange(newItems);
      }
    },
    [items, idToIndexMap, options]
  );

  // Provide props to be spread onto draggable elements
  const getDragProps = useCallback(
    (itemId: unknown): DragProps => ({
      draggable: true,
      onDragStart: (e) => handleDragStart(e, itemId),
      onDragEnd: handleDragEnd,
      onDragOver: handleDragOver,
      onDrop: (e) => handleDrop(e, itemId),
    }),
    [handleDragStart, handleDragEnd, handleDragOver, handleDrop]
  );

  return {
    draggedItemId,
    isDragging,
    getDragProps,
  };
}
