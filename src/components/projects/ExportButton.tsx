import React, { useState } from 'react';
import { Button } from '../ui/button';
import { cn } from '../../lib/utils';
import { useExportProject } from './hooks';
import type { ExportButtonProps } from './types';
import type { ExportFormat } from '@/types';

export const ExportButton: React.FC<ExportButtonProps> = ({ 
  projectId, 
  formats,
  disabled = false,
  className 
}) => {
  const { exportProject, isExporting, exportError } = useExportProject(projectId);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownId = `export-dropdown-${projectId}`;

  const handleExport = async (format: ExportFormat) => {
    setShowDropdown(false);
    await exportProject(format);
  };

  // If only one format is available, show a simple button
  if (formats.length === 1) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isExporting}
        className={cn('flex items-center gap-1', className)}
        onClick={() => handleExport(formats[0])}
        aria-label={`Export project as ${formats[0].toUpperCase()}`}
        aria-busy={isExporting}
      >
        {isExporting ? (
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4 text-current"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="mr-1"
            aria-hidden="true"
          >
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
        )}
        <span>
          {isExporting ? 'Exporting...' : `Export as ${formats[0].toUpperCase()}`}
        </span>
      </Button>
    );
  }

  // If multiple formats are available, show a dropdown
  return (
    <div className="relative">
      <Button
        variant="outline"
        size="sm"
        disabled={disabled || isExporting}
        className={cn('flex items-center gap-1', className)}
        onClick={() => setShowDropdown(!showDropdown)}
        aria-haspopup="true"
        aria-expanded={showDropdown}
        aria-controls={dropdownId}
        aria-label="Export project menu"
        aria-busy={isExporting}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="mr-1"
          aria-hidden="true"
        >
          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
          <polyline points="7 10 12 15 17 10" />
          <line x1="12" y1="15" x2="12" y2="3" />
        </svg>
        <span>{isExporting ? 'Exporting...' : 'Export'}</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="ml-1"
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </Button>

      {showDropdown && (
        <div 
          id={dropdownId}
          className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10"
          role="menu"
          aria-orientation="vertical"
          aria-labelledby="export-button"
        >
          <div className="py-1">
            {formats.map((format) => (
              <button
                key={format}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                role="menuitem"
                onClick={() => handleExport(format)}
              >
                Export as {format.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {showDropdown && (
        <div 
          className="fixed inset-0 z-0" 
          onClick={() => setShowDropdown(false)}
          aria-hidden="true"
        />
      )}

      {exportError && (
        <div 
          className="absolute right-0 mt-2 p-2 bg-red-100 text-red-800 text-xs rounded"
          role="alert"
          aria-live="assertive"
        >
          {exportError.message}
        </div>
      )}
    </div>
  );
};