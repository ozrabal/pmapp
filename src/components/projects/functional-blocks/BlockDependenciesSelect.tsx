import React, { useState, useEffect, useRef } from "react";
import { type FunctionalBlockDto } from "../../../types";
import { Check, X, ChevronDown } from "lucide-react";
import { Button } from "../../ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "../../ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "../../ui/popover";
import { Badge } from "../../ui/badge";
import { cn } from "../../../lib/utils";

interface BlockDependenciesSelectProps {
  values: string[];
  onChange: (values: string[]) => void;
  availableBlocks: FunctionalBlockDto[];
  currentBlockId?: string;
  error?: string;
  disabled?: boolean;
}

export function BlockDependenciesSelect({
  values,
  onChange,
  availableBlocks,
  currentBlockId,
  error,
  disabled = false,
}: BlockDependenciesSelectProps) {
  const [open, setOpen] = useState(false);
  const [selectedValues, setSelectedValues] = useState<string[]>(values);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Synchronize external values with internal state
  useEffect(() => {
    setSelectedValues(values);
  }, [values]);

  // Function to handle selection
  const handleSelect = (blockId: string) => {
    const newValues = selectedValues.includes(blockId)
      ? selectedValues.filter((v) => v !== blockId)
      : [...selectedValues, blockId];

    setSelectedValues(newValues);
    onChange(newValues);
  };

  // Filter out the current block and get available dependencies
  const filteredBlocks = availableBlocks.filter((block) => block.id !== currentBlockId);

  // Find block names for selected values
  const selectedBlocks = selectedValues
    .map((id) => availableBlocks.find((block) => block.id === id))
    .filter((block): block is FunctionalBlockDto => !!block);

  return (
    <div className="space-y-1">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            ref={triggerRef}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            aria-label="Wybierz zależności"
            disabled={disabled}
            className={cn(
              "w-full justify-between h-auto min-h-10 py-2",
              error ? "border-red-300 focus:border-red-500" : "",
              !selectedValues.length && "text-neutral-500"
            )}
            onClick={() => setOpen(!open)}
          >
            <div className="flex flex-wrap gap-1">
              {selectedBlocks.length > 0 ? (
                selectedBlocks.map((block) => (
                  <Badge key={block.id} variant="secondary" className="mr-1 mb-1">
                    {block.name}
                    <button
                      className="ml-1 rounded-full outline-none focus:ring-2 focus:ring-neutral-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(block.id);
                      }}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              ) : (
                <span>Wybierz zależności</span>
              )}
            </div>
            <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 max-h-[300px] overflow-auto">
          <Command>
            <CommandInput placeholder="Szukaj bloków..." />
            <CommandEmpty>Nie znaleziono bloków</CommandEmpty>
            <CommandGroup>
              {filteredBlocks.map((block) => (
                <CommandItem key={block.id} value={block.name} onSelect={() => handleSelect(block.id)}>
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedValues.includes(block.id) ? "opacity-100" : "opacity-0")}
                  />
                  {block.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
