import type z from "zod";
import type { ChatActorRole, CompletionStatus, PlanningStep } from "../modules/planning/consts";

export interface Message {
  role: Omit<ChatActorRole, "system">; // Exclude system role for messages
  content: string;
  timestamp: Date;
}

export interface StepPrompt {
  message: string;
  nextAction: string;
  requiredFields?: (keyof ProjectData)[];
  extractData?: string;
  extractDataSchema?: z.ZodSchema;
}

export type StepPrompts = Record<PlanningStep, StepPrompt>;

export interface ChatSession {
  id: string;
  userId: string;
  currentStep: PlanningStep;
  collectedData: ProjectData;
  conversationHistory: Message[];
  completionStatus: CompletionStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectData {
  projectType?: string;
  projectName?: string;
  description?: string;
  coreFeatures?: string[];
  technicalStack?: string[];
  uiUxRequirements?: string;
  userPersonas?: string[];
  timeline?: string;
  budget?: string;
  integrations?: string[];
  additionalRequirements?: string[];
}

export interface ValidationResult {
  isComplete: boolean;
  missingFields: string[];
  incompleteFields: string[];
  completionPercentage: number;
}

export interface StepValidator {
  requiredFields: string[];
  validate(data: ProjectData): ValidationResult;
}

export type StepValidators = Record<PlanningStep, StepValidator>;

export interface ChatResponse {
  message: string;
  sessionId: string;
  currentStep: PlanningStep;
  progress: {
    currentStep: number;
    totalSteps: number;
    completionPercentage: number;
  };
  nextActions: string[];
  isComplete: boolean;
  projectData?: ProjectData;
}
