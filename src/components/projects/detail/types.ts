import type { 
  FunctionalBlockDto, 
  ProjectDto, 
  ScheduleStageDto,  
} from "../../../types";

// Types for tab navigation
export type TabType = 'assumptions' | 'functionalBlocks' | 'schedule';

export interface ProjectTabProps {
  id: TabType;
  label: string;
  isActive: boolean;
  onClick: () => void;
  disabled?: boolean;
}

// Extended view model types
export interface ProjectViewModel extends ProjectDto {
  isLoading: boolean;
  error: Error | null;
  selectedTab: TabType;
}

// Types for sections
export interface AssumptionsViewModel {
  projectGoals?: string[];
  targetAudience?: string[];
  keyFeatures?: string[];
  technicalRequirements?: {
    frontend?: string[];
    backend?: string[];
    infrastructure?: string[];
  };
  constraints?: string[];
}

export interface FunctionalBlocksViewModel {
  blocks: FunctionalBlockDto[];
}

export interface ScheduleViewModel {
  stages: ScheduleStageDto[];
}

// Export related types
export type ExportFormat = "json";

export interface ExportOptions {
  format: ExportFormat;
  includeComments?: boolean;
}