import { type FunctionalBlockDto } from "../../../types";

// View model for managing functional blocks
export interface FunctionalBlocksViewModel {
  blocks: FunctionalBlockDto[];
  isLoading: boolean;
  selectedBlockId: string | null;
  editMode: boolean;
  error: string | null;
}

// Form values for block editing
export interface FunctionalBlockFormValues {
  name: string;
  description: string;
  category: string;
  dependencies: string[];
}

// Block category definition
export interface BlockCategory {
  value: string;
  label: string;
  description?: string;
}

// Predefined block categories
export const BLOCK_CATEGORIES: BlockCategory[] = [
  {
    value: "auth",
    label: "Authentication",
    description: "Features related to login, registration, and user management",
  },
  {
    value: "core",
    label: "Core Functionality",
    description: "Main features defining the application's character",
  },
  {
    value: "ui",
    label: "User Interface",
    description: "User interface components and views",
  },
  {
    value: "data",
    label: "Data Management",
    description: "Features related to data storage and processing",
  },
  {
    value: "api",
    label: "API Integrations",
    description: "Integrations with external services and APIs",
  },
  {
    value: "admin",
    label: "Admin Panel",
    description: "Features related to application management",
  },
  {
    value: "other",
    label: "Other",
    description: "Features not fitting into other categories",
  },
];

// Drag state for drag & drop
export interface DragState {
  isDragging: boolean;
  draggedId: string | null;
  dragOverId: string | null;
}
