import { relations } from "drizzle-orm/relations";
import {
  profiles,
  userActivities,
  aiSuggestionFeedbacks,
  userSessions,
  usersInAuth,
  projects,
  tasks,
  taskDependencies,
} from "./schema";

export const userActivitiesRelations = relations(userActivities, ({ one }) => ({
  profile: one(profiles, {
    fields: [userActivities.userId],
    references: [profiles.id],
  }),
}));

export const profilesRelations = relations(profiles, ({ one, many }) => ({
  userActivities: many(userActivities),
  aiSuggestionFeedbacks: many(aiSuggestionFeedbacks),
  userSessions: many(userSessions),
  usersInAuth: one(usersInAuth, {
    fields: [profiles.id],
    references: [usersInAuth.id],
  }),
  projects: many(projects),
}));

export const aiSuggestionFeedbacksRelations = relations(aiSuggestionFeedbacks, ({ one }) => ({
  profile: one(profiles, {
    fields: [aiSuggestionFeedbacks.userId],
    references: [profiles.id],
  }),
}));

export const userSessionsRelations = relations(userSessions, ({ one }) => ({
  profile: one(profiles, {
    fields: [userSessions.userId],
    references: [profiles.id],
  }),
}));

export const usersInAuthRelations = relations(usersInAuth, ({ many }) => ({
  profiles: many(profiles),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  profile: one(profiles, {
    fields: [projects.userId],
    references: [profiles.id],
  }),
  tasks: many(tasks),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  taskDependencies_predecessorTaskId: many(taskDependencies, {
    relationName: "taskDependencies_predecessorTaskId_tasks_id",
  }),
  taskDependencies_successorTaskId: many(taskDependencies, {
    relationName: "taskDependencies_successorTaskId_tasks_id",
  }),
}));

export const taskDependenciesRelations = relations(taskDependencies, ({ one }) => ({
  task_predecessorTaskId: one(tasks, {
    fields: [taskDependencies.predecessorTaskId],
    references: [tasks.id],
    relationName: "taskDependencies_predecessorTaskId_tasks_id",
  }),
  task_successorTaskId: one(tasks, {
    fields: [taskDependencies.successorTaskId],
    references: [tasks.id],
    relationName: "taskDependencies_successorTaskId_tasks_id",
  }),
}));
