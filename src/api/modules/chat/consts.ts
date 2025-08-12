import type { StepPrompts } from "@/api/types/chat";

export enum PlanningStep {
  INTRODUCTION = "introduction",
  PROJECT_TYPE = "project_type",
  CORE_FEATURES = "core_features",
  TECHNICAL_REQUIREMENTS = "technical_requirements",
  USER_PERSONAS = "user_personas",
  UI_UX_PREFERENCES = "ui_ux_preferences",
  TIMELINE_BUDGET = "timeline_budget",
  INTEGRATION_REQUIREMENTS = "integration_requirements",
  VALIDATION = "validation",
  COMPLETION = "completion",
}

export enum CompletionStatus {
  IN_PROGRESS = "in_progress",
  COMPLETED = "completed",
  ABANDONED = "abandoned",
}

export enum ChatActorRole {
  USER = "user",
  ASSISTANT = "assistant",
  SYSTEM = "system",
}

export enum AiModel {
  GPT_4O = "gpt-4o",
  GPT_4O_MINI = "gpt-4o-mini",
  GPT_3_5_TURBO = "gpt-3.5-turbo",
}

export const STEP_ORDER: PlanningStep[] = [
  PlanningStep.INTRODUCTION,
  PlanningStep.PROJECT_TYPE,
  PlanningStep.CORE_FEATURES,
  PlanningStep.TECHNICAL_REQUIREMENTS,
  PlanningStep.USER_PERSONAS,
  PlanningStep.UI_UX_PREFERENCES,
  PlanningStep.TIMELINE_BUDGET,
  PlanningStep.INTEGRATION_REQUIREMENTS,
  PlanningStep.VALIDATION,
  PlanningStep.COMPLETION,
];

export const STEP_PROMPTS: StepPrompts = {
  [PlanningStep.INTRODUCTION]: {
    message: `Welcome! I'm here to help you create a detailed plan for your application. Let's start by understanding what you want to build. What type of application do you have in mind?`,
    nextAction: "Tell me about your application idea",
  },

  [PlanningStep.PROJECT_TYPE]: {
    message: `Let's define your project basics. I need to understand:
1. What type of application is this? (web app, mobile app, desktop, etc.)
2. What would you like to name your project?
3. Can you provide a brief description of what your application will do?`,
    nextAction: "Define your project type and details",
    requiredFields: ["projectType", "projectName", "description"],
  },

  [PlanningStep.CORE_FEATURES]: {
    message: `Now let's dive into the core features. What are the main functionalities your users will interact with? Please describe at least 3-5 key features that are essential to your application.`,
    nextAction: "List your core features",
    requiredFields: ["coreFeatures"],
  },

  [PlanningStep.TECHNICAL_REQUIREMENTS]: {
    message: `Let's discuss the technical stack. Based on your project type and features, what technologies are you considering for:
- Frontend (React, Vue, Angular, etc.)
- Backend (Node.js, Python, Java, etc.)
- Database (PostgreSQL, MongoDB, etc.)
- Any specific APIs or services?`,
    nextAction: "Specify your technical requirements",
    requiredFields: ["technicalStack"],
  },

  [PlanningStep.USER_PERSONAS]: {
    message: `Who will be using your application? Please describe your target users, including their roles, goals, and any pain points your app will solve for them.`,
    nextAction: "Define your user personas",
    requiredFields: ["userPersonas"],
  },

  [PlanningStep.UI_UX_PREFERENCES]: {
    message: `Let's talk about the user interface and experience:
- What design style do you prefer? (modern, minimalist, corporate, etc.)
- Should it be responsive for mobile devices?
- Are there accessibility requirements?
- Any design inspirations or examples?`,
    nextAction: "Specify your UI/UX requirements",
    requiredFields: ["uiUxRequirements"],
  },

  [PlanningStep.TIMELINE_BUDGET]: {
    message: `Let's discuss project constraints:
- What's your target timeline for completion?
- Do you have a budget range in mind?
- Are there any critical deadlines or milestones?`,
    nextAction: "Provide your timeline and budget",
    requiredFields: ["timeline", "budget"],
  },

  [PlanningStep.INTEGRATION_REQUIREMENTS]: {
    message: `Are there any external systems, APIs, or services your application needs to integrate with? (payment systems, authentication providers, third-party APIs, etc.)`,
    nextAction: "Specify your integration requirements",
    requiredFields: ["integrations"],
  },

  [PlanningStep.VALIDATION]: {
    message: `Let me review what we've discussed and identify any gaps that need clarification before creating your project specification.`,
    nextAction: "Validate your project details",
  },

  [PlanningStep.COMPLETION]: {
    message: `Perfect! I have all the information needed to create your comprehensive project specification.`,
    nextAction: "Complete the project setup",
  },
};

export const PROJEST_SPECIFICATION_PROMPT = {
  prompt: `Generate a project specification for the following data: `,
  model: AiModel.GPT_4O_MINI,
  temperature: 0.5,
};
