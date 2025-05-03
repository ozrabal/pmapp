import React, { createContext, useContext, type ReactNode } from "react";
import { useScheduleState } from "./hooks/useScheduleState";
import type { ProjectDto } from "@/types";
import type { ScheduleContextValue } from "./types";

// Create context with a default undefined value
const ScheduleContext = createContext<ScheduleContextValue | undefined>(undefined);

interface ScheduleProviderProps {
  children: ReactNode;
  projectId: string;
  project: ProjectDto;
}

/**
 * Provider component that wraps schedule-related components and provides
 * centralized state management
 */
export const ScheduleProvider: React.FC<ScheduleProviderProps> = ({ children, projectId, project }) => {
  // Use our custom hook to manage schedule state
  const scheduleState = useScheduleState(projectId, project);

  return <ScheduleContext.Provider value={scheduleState}>{children}</ScheduleContext.Provider>;
};

/**
 * Custom hook to access schedule context
 * Throws an error if used outside of ScheduleProvider
 */
export const useSchedule = (): ScheduleContextValue => {
  const context = useContext(ScheduleContext);

  if (context === undefined) {
    throw new Error("useSchedule must be used within a ScheduleProvider");
  }

  return context;
};
