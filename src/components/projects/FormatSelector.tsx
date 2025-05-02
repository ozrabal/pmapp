import React from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { ExportFormat } from "../../types";

export interface FormatSelectorProps {
  value: ExportFormat;
  onChange: (value: ExportFormat) => void;
  availableFormats: ExportFormat[];
  disabled?: boolean;
}

/**
 * Component for selecting the export format
 */
export const FormatSelector: React.FC<FormatSelectorProps> = ({
  value,
  onChange,
  availableFormats,
  disabled = false,
}) => {
  // Guard clause - if no formats available, render nothing
  if (!availableFormats.length) {
    return null;
  }

  const handleValueChange = (selected: string) => {
    onChange(selected as ExportFormat);
  };

  return (
    <div className="space-y-2">
      <label htmlFor="export-format" className="text-sm font-medium">
        Format eksportu
      </label>
      <Select value={value} onValueChange={handleValueChange} disabled={disabled || availableFormats.length <= 1}>
        <SelectTrigger id="export-format" className="w-full" aria-label="Wybierz format eksportu">
          <SelectValue placeholder="Wybierz format" />
        </SelectTrigger>
        <SelectContent>
          {availableFormats.map((format) => (
            <SelectItem key={format} value={format}>
              {format.toUpperCase()}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
