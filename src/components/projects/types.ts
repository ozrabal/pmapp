import type { ReactNode } from 'react';
import type {
  ProjectDto,
  FunctionalBlockDto,
  ScheduleStageDto,
  ExportFormat,
} from '../../types';

// Types related to tabs
export type TabType = 'descriptions' | 'assumptions' | 'functionalBlocks' | 'schedule';

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

// Types for individual sections
export interface ProjectDescriptionViewModel {
  description: string;
}

export interface AssumptionsViewModel {
  projectGoals?: string;
  targetAudience?: string;
  keyFeatures?: string;
  technologyStack?: string;
  constraints?: string;
  [key: string]: string | undefined; // To allow for dynamic assumption fields
}

export interface FunctionalBlocksViewModel {
  blocks: FunctionalBlockDto[];
}

export interface ScheduleViewModel {
  stages: ScheduleStageDto[];
}

// Types for export operations
export interface ExportOptions {
  format: ExportFormat;
  includeComments?: boolean;
}

// Props for various components
export interface ProjectDetailsContentProps {
  projectId: string;
  initialTab?: TabType;
}

export interface ProjectHeaderProps {
  projectId: string;
  projectName?: string;
  isLoading?: boolean;
}

export interface BackToProjectsButtonProps {
  className?: string;
}

export interface EditProjectButtonProps {
  projectId: string;
  disabled?: boolean;
  className?: string;
}

export interface ExportButtonProps {
  projectId: string;
  formats: ExportFormat[];
  disabled?: boolean;
  className?: string;
}

export interface ProjectTabsNavigationProps {
  tabs: ProjectTabProps[];
  activeTab: TabType;
  onSelectTab: (tab: TabType) => void;
  isLoading?: boolean;
  className?: string;
}

export interface PanelProps {
  isLoading?: boolean;
  className?: string;
}

export interface ProjectDescriptionsPanelProps extends PanelProps {
  description: ProjectDescriptionViewModel | null;
}

export interface ProjectAssumptionsPanelProps extends PanelProps {
  assumptions: AssumptionsViewModel | null;
}

export interface ProjectFunctionalBlocksPanelProps extends PanelProps {
  functionalBlocks: FunctionalBlocksViewModel | null;
}

export interface ProjectSchedulePanelProps extends PanelProps {
  schedule: ScheduleViewModel | null;
}

export interface LoadingSkeletonProps {
  type: TabType;
  className?: string;
}

export interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode | ((error: Error) => ReactNode);
}