import React, { useState } from "react";
import { type FunctionalBlockDto } from "../../../types";
import { BLOCK_CATEGORIES } from "./types";
import { Button } from "../../ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "../../ui/card";

interface FunctionalBlockItemProps {
  block: FunctionalBlockDto;
  isSelected: boolean;
  onEdit: () => void;
  onDelete: () => void;
  allBlocks: FunctionalBlockDto[];
}

export function FunctionalBlockItem({ block, isSelected, onEdit, onDelete, allBlocks }: FunctionalBlockItemProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Znajdź kategorię dla wyświetlenia etykiety
  const category = BLOCK_CATEGORIES.find((cat) => cat.value === block.category) || {
    value: block.category,
    label: block.category,
  };

  // Pobierz nazwy zależności do wyświetlenia
  const dependencies = block.dependencies
    .map((depId) => allBlocks.find((b) => b.id === depId)?.name || "Nieznana zależność")
    .filter(Boolean);

  // Handle expansion toggle
  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
  };

  // Confirm block deletion
  const handleDelete = () => {
    if (window.confirm("Czy na pewno chcesz usunąć ten blok funkcjonalny?")) {
      onDelete();
    }
  };

  // Get block color based on category
  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      auth: "bg-blue-100 text-blue-800",
      core: "bg-purple-100 text-purple-800",
      ui: "bg-pink-100 text-pink-800",
      data: "bg-green-100 text-green-800",
      api: "bg-orange-100 text-orange-800",
      admin: "bg-yellow-100 text-yellow-800",
      other: "bg-neutral-100 text-neutral-800",
    };

    return colors[category] || colors.other;
  };

  return (
    <Card
      className={`mb-4 transition-all ${isExpanded ? "shadow-md" : "shadow-sm"} ${
        isSelected ? "ring-2 ring-primary" : ""
      }`}
    >
      <CardHeader className="px-4 py-3 flex flex-row justify-between items-start space-y-0">
        <div className="flex-1 cursor-pointer" onClick={toggleExpand}>
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs px-2 py-0.5 rounded font-medium ${getCategoryColor(block.category)}`}>
              {category.label}
            </span>
            {block.dependencies.length > 0 && (
              <span className="text-xs bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">
                {block.dependencies.length} zależności
              </span>
            )}
          </div>
          <CardTitle className="text-lg flex items-center gap-3">
            <span className="flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className={`w-4 h-4 transition-transform ${isExpanded ? "rotate-90" : ""}`}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
              </svg>
              {block.name}
            </span>
          </CardTitle>
        </div>
        <div className="flex gap-1 items-start self-start">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={onEdit} aria-label="Edytuj blok">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125"
              />
            </svg>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
            onClick={handleDelete}
            aria-label="Usuń blok"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
              />
            </svg>
          </Button>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="px-4 py-3 border-t">
          <CardDescription className="mb-4 whitespace-pre-wrap">{block.description}</CardDescription>

          {dependencies.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2 text-neutral-700">Zależności:</p>
              <ul className="space-y-1">
                {dependencies.map((dep, index) => (
                  <li key={index} className="text-sm text-neutral-600 flex items-center gap-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="w-4 h-4 text-neutral-400"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M12.75 15l3-3m0 0l-3-3m3 3h-7.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    {dep}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}
