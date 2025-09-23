import {
  pgTable,
  index,
  foreignKey,
  pgPolicy,
  uuid,
  varchar,
  integer,
  jsonb,
  timestamp,
  boolean,
  text,
  numeric,
  unique,
  check,
  pgEnum,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { authUsers as users } from "drizzle-orm/supabase";
export const estimationUnitEnum = pgEnum("estimation_unit_enum", ["hours", "storypoints"]);
export const taskDependencyTypeEnum = pgEnum("task_dependency_type_enum", [
  "finish_to_start",
  "start_to_start",
  "finish_to_finish",
  "start_to_finish",
]);
export const taskPriorityEnum = pgEnum("task_priority_enum", ["low", "medium", "high"]);

export const userActivities = pgTable(
  "user_activities",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id").notNull(),
    activityType: varchar("activity_type", { length: 50 }).notNull(),
    durationSeconds: integer("duration_seconds"),
    metadata: jsonb(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("user_activities_activity_type_idx").using("btree", table.activityType.asc().nullsLast().op("text_ops")),
    index("user_activities_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "user_activities_user_id_fkey",
    }),
    pgPolicy("anon users cannot access user_activities", {
      as: "permissive",
      for: "all",
      to: ["anon"],
      using: sql`false`,
    }),
    pgPolicy("authenticated users can read own activities", { as: "permissive", for: "select", to: ["authenticated"] }),
    pgPolicy("authenticated users can insert own activities", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
  ]
);

export const aiSuggestionFeedbacks = pgTable(
  "ai_suggestion_feedbacks",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id").notNull(),
    suggestionContext: varchar("suggestion_context", { length: 100 }).notNull(),
    suggestionHash: varchar("suggestion_hash", { length: 64 }).notNull(),
    isHelpful: boolean("is_helpful").notNull(),
    feedbackText: text("feedback_text"),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("ai_suggestion_feedbacks_context_hash_idx").using(
      "btree",
      table.suggestionContext.asc().nullsLast().op("text_ops"),
      table.suggestionHash.asc().nullsLast().op("text_ops")
    ),
    index("ai_suggestion_feedbacks_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "ai_suggestion_feedbacks_user_id_fkey",
    }),
    pgPolicy("anon users cannot access ai_suggestion_feedbacks", {
      as: "permissive",
      for: "all",
      to: ["anon"],
      using: sql`false`,
    }),
    pgPolicy("authenticated users can read own feedbacks", { as: "permissive", for: "select", to: ["authenticated"] }),
    pgPolicy("authenticated users can create own feedbacks", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("authenticated users can update own feedbacks", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
    }),
  ]
);

export const userSessions = pgTable(
  "user_sessions",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id").notNull(),
    startTime: timestamp("start_time", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    endTime: timestamp("end_time", { withTimezone: true, mode: "string" }),
    totalDurationSeconds: integer("total_duration_seconds"),
    isActive: boolean("is_active").default(true).notNull(),
  },
  (table) => [
    index("user_sessions_is_active_idx").using("btree", table.isActive.asc().nullsLast().op("bool_ops")),
    index("user_sessions_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "user_sessions_user_id_fkey",
    }),
    pgPolicy("anon users cannot access user_sessions", {
      as: "permissive",
      for: "all",
      to: ["anon"],
      using: sql`false`,
    }),
    pgPolicy("authenticated users can read own sessions", { as: "permissive", for: "select", to: ["authenticated"] }),
    pgPolicy("authenticated users can insert own sessions", { as: "permissive", for: "insert", to: ["authenticated"] }),
    pgPolicy("authenticated users can update own sessions", { as: "permissive", for: "update", to: ["authenticated"] }),
  ]
);

export const profiles = pgTable(
  "profiles",
  {
    id: uuid().primaryKey().notNull(),
    firstName: varchar("first_name", { length: 100 }).notNull(),
    lastName: varchar("last_name", { length: 100 }),
    timezone: varchar({ length: 50 }).default("UTC").notNull(),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true, mode: "string" }),
    projectsLimit: integer("projects_limit").default(5).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    defaultEstimationUnit: estimationUnitEnum("default_estimation_unit").default("hours").notNull(),
  },
  (table) => [
    index("idx_profiles_default_estimation_unit").using(
      "btree",
      table.defaultEstimationUnit.asc().nullsLast().op("enum_ops")
    ),
    foreignKey({
      columns: [table.id],
      foreignColumns: [users.id],
      name: "profiles_id_fkey",
    }),
    pgPolicy("anon users cannot access profiles", { as: "permissive", for: "all", to: ["anon"], using: sql`false` }),
    pgPolicy("authenticated users can read own profile", { as: "permissive", for: "select", to: ["authenticated"] }),
    pgPolicy("authenticated users can update own profile", { as: "permissive", for: "update", to: ["authenticated"] }),
  ]
);

export const projects = pgTable(
  "projects",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    userId: uuid("user_id").notNull(),
    name: varchar({ length: 200 }).notNull(),
    description: text(),
    assumptions: jsonb(),
    functionalBlocks: jsonb("functional_blocks"),
    schedule: jsonb(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
    status: varchar({ length: 50 }).default("active").notNull(),
    estimationUnit: estimationUnitEnum("estimation_unit").default("hours").notNull(),
  },
  (table) => [
    index("gin_projects_functional_blocks").using("gin", table.functionalBlocks.asc().nullsLast().op("jsonb_ops")),
    index("gin_projects_schedule").using("gin", table.schedule.asc().nullsLast().op("jsonb_ops")),
    index("idx_projects_estimation_unit").using("btree", table.estimationUnit.asc().nullsLast().op("enum_ops")),
    index("idx_projects_status").using("btree", table.status.asc().nullsLast().op("text_ops")),
    index("projects_deleted_at_idx").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")),
    index("projects_user_id_idx").using("btree", table.userId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.userId],
      foreignColumns: [profiles.id],
      name: "projects_user_id_fkey",
    }),
    pgPolicy("anon users cannot access projects", { as: "permissive", for: "all", to: ["anon"], using: sql`false` }),
    pgPolicy("authenticated users can read own projects", { as: "permissive", for: "select", to: ["authenticated"] }),
    pgPolicy("authenticated users can insert own projects", { as: "permissive", for: "insert", to: ["authenticated"] }),
    pgPolicy("authenticated users can update own projects", { as: "permissive", for: "update", to: ["authenticated"] }),
  ]
);

export const tasks = pgTable(
  "tasks",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    projectId: uuid("project_id").notNull(),
    functionalBlockId: varchar("functional_block_id", { length: 100 }).notNull(),
    name: varchar({ length: 200 }).notNull(),
    description: text(),
    priority: taskPriorityEnum().default("medium").notNull(),
    estimatedValue: numeric("estimated_value", { precision: 10, scale: 2 }),
    estimatedByAi: boolean("estimated_by_ai").default(false).notNull(),
    aiConfidenceScore: numeric("ai_confidence_score", { precision: 3, scale: 2 }),
    aiSuggestionContext: varchar("ai_suggestion_context", { length: 100 }),
    aiSuggestionHash: varchar("ai_suggestion_hash", { length: 64 }),
    metadata: jsonb(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
    deletedAt: timestamp("deleted_at", { withTimezone: true, mode: "string" }),
  },
  (table) => [
    index("gin_tasks_metadata").using("gin", table.metadata.asc().nullsLast().op("jsonb_ops")),
    index("idx_tasks_deleted_at").using("btree", table.deletedAt.asc().nullsLast().op("timestamptz_ops")),
    index("idx_tasks_estimated_by_ai").using("btree", table.estimatedByAi.asc().nullsLast().op("bool_ops")),
    index("idx_tasks_functional_block_id").using("btree", table.functionalBlockId.asc().nullsLast().op("text_ops")),
    index("idx_tasks_priority").using("btree", table.priority.asc().nullsLast().op("enum_ops")),
    index("idx_tasks_project_functional_block").using(
      "btree",
      table.projectId.asc().nullsLast().op("text_ops"),
      table.functionalBlockId.asc().nullsLast().op("text_ops")
    ),
    index("idx_tasks_project_id").using("btree", table.projectId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.projectId],
      foreignColumns: [projects.id],
      name: "tasks_project_id_fkey",
    }).onDelete("cascade"),
    pgPolicy("anon users cannot access tasks", { as: "permissive", for: "select", to: ["anon"], using: sql`false` }),
    pgPolicy("authenticated users can read own project tasks", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
    pgPolicy("authenticated users can create tasks in own projects", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("authenticated users can update own project tasks", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
    }),
  ]
);

export const taskDependencies = pgTable(
  "task_dependencies",
  {
    id: uuid()
      .default(sql`uuid_generate_v4()`)
      .primaryKey()
      .notNull(),
    predecessorTaskId: uuid("predecessor_task_id").notNull(),
    successorTaskId: uuid("successor_task_id").notNull(),
    dependencyType: taskDependencyTypeEnum("dependency_type").default("finish_to_start").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).defaultNow().notNull(),
  },
  (table) => [
    index("idx_task_dependencies_predecessor").using("btree", table.predecessorTaskId.asc().nullsLast().op("uuid_ops")),
    index("idx_task_dependencies_successor").using("btree", table.successorTaskId.asc().nullsLast().op("uuid_ops")),
    foreignKey({
      columns: [table.predecessorTaskId],
      foreignColumns: [tasks.id],
      name: "task_dependencies_predecessor_task_id_fkey",
    }).onDelete("cascade"),
    foreignKey({
      columns: [table.successorTaskId],
      foreignColumns: [tasks.id],
      name: "task_dependencies_successor_task_id_fkey",
    }).onDelete("cascade"),
    unique("task_dependencies_unique").on(table.predecessorTaskId, table.successorTaskId),
    pgPolicy("anon users cannot access task dependencies", {
      as: "permissive",
      for: "select",
      to: ["anon"],
      using: sql`false`,
    }),
    pgPolicy("authenticated users can read own project task dependencies", {
      as: "permissive",
      for: "select",
      to: ["authenticated"],
    }),
    pgPolicy("authenticated users can create task dependencies in own project", {
      as: "permissive",
      for: "insert",
      to: ["authenticated"],
    }),
    pgPolicy("authenticated users can update task dependencies in own project", {
      as: "permissive",
      for: "update",
      to: ["authenticated"],
    }),
    pgPolicy("authenticated users can delete task dependencies in own project", {
      as: "permissive",
      for: "delete",
      to: ["authenticated"],
    }),
    check("task_dependencies_no_self_reference", sql`predecessor_task_id <> successor_task_id`),
  ]
);
