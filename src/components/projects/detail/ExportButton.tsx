import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { Download, ChevronDown } from 'lucide-react';
import { useExportProject } from "./hooks/useExportProject";
import type { ExportFormat } from './types';

interface ExportButtonProps {
  projectId: string;
  formats: ExportFormat[];
  disabled?: boolean;
}

const ExportButton = ({ 
  projectId, 
  formats, 
  disabled = false 
}: ExportButtonProps) => {
  const { exportProject, isExporting, exportError } = useExportProject(projectId);
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleExport = (format: ExportFormat) => {
    exportProject(format);
    setShowDropdown(false);
  };

  // If only one format is supported, don't show dropdown
  if (formats.length === 1) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isExporting}
        onClick={() => handleExport(formats[0])}
        className="gap-2"
      >
        {isExporting ? (
          <span className="animate-spin">
            <ChevronDown className="h-4 w-4" />
          </span>
        ) : (
          <Download className="h-4 w-4" />
        )}
        Export
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={disabled || isExporting}
          className="gap-2"
        >
          {isExporting ? (
            <span className="animate-spin">
              <ChevronDown className="h-4 w-4" />
            </span>
          ) : (
            <>
              <Download className="h-4 w-4" />
              Export
              <ChevronDown className="h-4 w-4" />
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {formats.map((format) => (
          <DropdownMenuItem 
            key={format} 
            onClick={() => handleExport(format)}
          >
            Export as {format.toUpperCase()}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;