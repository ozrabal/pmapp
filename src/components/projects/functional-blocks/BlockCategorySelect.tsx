import React from "react";
import { BLOCK_CATEGORIES } from "./types";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "../../ui/select";

interface BlockCategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  disabled?: boolean;
}

export function BlockCategorySelect({ value, onChange, error, disabled = false }: BlockCategorySelectProps) {
  return (
    <div className="space-y-1">
      <Select value={value} onValueChange={onChange} disabled={disabled}>
        <SelectTrigger className={`w-full ${error ? "border-red-300 focus:border-red-500" : ""}`}>
          <SelectValue placeholder="Select category" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {BLOCK_CATEGORIES.map((category) => (
              <SelectItem key={category.value} value={category.value}>
                <div className="flex flex-col">
                  <span>{category.label}</span>
                  {category.description && (
                    <span className="text-xs text-neutral-500 mt-1">{category.description}</span>
                  )}
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
}
