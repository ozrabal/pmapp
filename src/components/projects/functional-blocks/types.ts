import { type FunctionalBlockDto } from "../../../types";

// Model widoku dla zarządzania blokami funkcjonalnymi
export interface FunctionalBlocksViewModel {
  blocks: FunctionalBlockDto[];
  isLoading: boolean;
  selectedBlockId: string | null;
  editMode: boolean;
  error: string | null;
}

// Wartości formularza dla edycji bloku
export interface FunctionalBlockFormValues {
  name: string;
  description: string;
  category: string;
  dependencies: string[];
}

// Definicja kategorii bloku
export interface BlockCategory {
  value: string;
  label: string;
  description?: string;
}

// Predefiniowane kategorie bloków
export const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    value: "auth",
    label: "Autentykacja",
    description: "Funkcjonalności związane z logowaniem, rejestracją i zarządzaniem użytkownikami",
  },
  {
    value: "core",
    label: "Funkcjonalności podstawowe",
    description: "Główne funkcjonalności definiujące charakter aplikacji",
  },
  {
    value: "ui",
    label: "Interfejs użytkownika",
    description: "Komponenty i widoki interfejsu użytkownika",
  },
  {
    value: "data",
    label: "Zarządzanie danymi",
    description: "Funkcjonalności związane z przechowywaniem i przetwarzaniem danych",
  },
  {
    value: "api",
    label: "Integracje API",
    description: "Integracje z zewnętrznymi usługami i API",
  },
  {
    value: "admin",
    label: "Panel administracyjny",
    description: "Funkcjonalności związane z zarządzaniem aplikacją",
  },
  {
    value: "other",
    label: "Inne",
    description: "Funkcjonalności niepasujące do pozostałych kategorii",
  },
];

// Stan przeciągania dla drag & drop
export interface DragState {
  isDragging: boolean;
  draggedId: string | null;
  dragOverId: string | null;
}
