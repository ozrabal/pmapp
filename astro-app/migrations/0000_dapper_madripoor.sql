-- Current sql file was generated after introspecting the database
-- If you want to run this migration please uncomment this code before executing migrations
/*
CREATE TYPE "public"."estimation_unit_enum" AS ENUM('hours', 'storypoints');--> statement-breakpoint
CREATE TYPE "public"."task_dependency_type_enum" AS ENUM('finish_to_start', 'start_to_start', 'finish_to_finish', 'start_to_finish');--> statement-breakpoint
CREATE TYPE "public"."task_priority_enum" AS ENUM('low', 'medium', 'high');--> statement-breakpoint
CREATE TABLE "user_activities" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"activity_type" varchar(50) NOT NULL,
	"duration_seconds" integer,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_activities" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "ai_suggestion_feedbacks" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"suggestion_context" varchar(100) NOT NULL,
	"suggestion_hash" varchar(64) NOT NULL,
	"is_helpful" boolean NOT NULL,
	"feedback_text" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ai_suggestion_feedbacks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "user_sessions" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"start_time" timestamp with time zone DEFAULT now() NOT NULL,
	"end_time" timestamp with time zone,
	"total_duration_seconds" integer,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
ALTER TABLE "user_sessions" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "profiles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" varchar(100) NOT NULL,
	"last_name" varchar(100),
	"timezone" varchar(50) DEFAULT 'UTC' NOT NULL,
	"last_login_at" timestamp with time zone,
	"projects_limit" integer DEFAULT 5 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"default_estimation_unit" "estimation_unit_enum" DEFAULT 'hours' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "projects" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"user_id" uuid NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"assumptions" jsonb,
	"functional_blocks" jsonb,
	"schedule" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"estimation_unit" "estimation_unit_enum" DEFAULT 'hours' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "projects" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "tasks" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"project_id" uuid NOT NULL,
	"functional_block_id" varchar(100) NOT NULL,
	"name" varchar(200) NOT NULL,
	"description" text,
	"priority" "task_priority_enum" DEFAULT 'medium' NOT NULL,
	"estimated_value" numeric(10, 2),
	"estimated_by_ai" boolean DEFAULT false NOT NULL,
	"ai_confidence_score" numeric(3, 2),
	"ai_suggestion_context" varchar(100),
	"ai_suggestion_hash" varchar(64),
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "tasks" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
CREATE TABLE "task_dependencies" (
	"id" uuid PRIMARY KEY DEFAULT uuid_generate_v4() NOT NULL,
	"predecessor_task_id" uuid NOT NULL,
	"successor_task_id" uuid NOT NULL,
	"dependency_type" "task_dependency_type_enum" DEFAULT 'finish_to_start' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "task_dependencies_unique" UNIQUE("predecessor_task_id","successor_task_id"),
	CONSTRAINT "task_dependencies_no_self_reference" CHECK (predecessor_task_id <> successor_task_id)
);
--> statement-breakpoint
ALTER TABLE "task_dependencies" ENABLE ROW LEVEL SECURITY;--> statement-breakpoint
ALTER TABLE "user_activities" ADD CONSTRAINT "user_activities_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ai_suggestion_feedbacks" ADD CONSTRAINT "ai_suggestion_feedbacks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_sessions" ADD CONSTRAINT "user_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "projects" ADD CONSTRAINT "projects_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "public"."profiles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tasks" ADD CONSTRAINT "tasks_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "public"."projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_predecessor_task_id_fkey" FOREIGN KEY ("predecessor_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "task_dependencies" ADD CONSTRAINT "task_dependencies_successor_task_id_fkey" FOREIGN KEY ("successor_task_id") REFERENCES "public"."tasks"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "user_activities_activity_type_idx" ON "user_activities" USING btree ("activity_type" text_ops);--> statement-breakpoint
CREATE INDEX "user_activities_user_id_idx" ON "user_activities" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "ai_suggestion_feedbacks_context_hash_idx" ON "ai_suggestion_feedbacks" USING btree ("suggestion_context" text_ops,"suggestion_hash" text_ops);--> statement-breakpoint
CREATE INDEX "ai_suggestion_feedbacks_user_id_idx" ON "ai_suggestion_feedbacks" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "user_sessions_is_active_idx" ON "user_sessions" USING btree ("is_active" bool_ops);--> statement-breakpoint
CREATE INDEX "user_sessions_user_id_idx" ON "user_sessions" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_profiles_default_estimation_unit" ON "profiles" USING btree ("default_estimation_unit" enum_ops);--> statement-breakpoint
CREATE INDEX "gin_projects_functional_blocks" ON "projects" USING gin ("functional_blocks" jsonb_ops);--> statement-breakpoint
CREATE INDEX "gin_projects_schedule" ON "projects" USING gin ("schedule" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_projects_estimation_unit" ON "projects" USING btree ("estimation_unit" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_projects_status" ON "projects" USING btree ("status" text_ops);--> statement-breakpoint
CREATE INDEX "projects_deleted_at_idx" ON "projects" USING btree ("deleted_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "projects_user_id_idx" ON "projects" USING btree ("user_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "gin_tasks_metadata" ON "tasks" USING gin ("metadata" jsonb_ops);--> statement-breakpoint
CREATE INDEX "idx_tasks_deleted_at" ON "tasks" USING btree ("deleted_at" timestamptz_ops);--> statement-breakpoint
CREATE INDEX "idx_tasks_estimated_by_ai" ON "tasks" USING btree ("estimated_by_ai" bool_ops);--> statement-breakpoint
CREATE INDEX "idx_tasks_functional_block_id" ON "tasks" USING btree ("functional_block_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_tasks_priority" ON "tasks" USING btree ("priority" enum_ops);--> statement-breakpoint
CREATE INDEX "idx_tasks_project_functional_block" ON "tasks" USING btree ("project_id" text_ops,"functional_block_id" text_ops);--> statement-breakpoint
CREATE INDEX "idx_tasks_project_id" ON "tasks" USING btree ("project_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_task_dependencies_predecessor" ON "task_dependencies" USING btree ("predecessor_task_id" uuid_ops);--> statement-breakpoint
CREATE INDEX "idx_task_dependencies_successor" ON "task_dependencies" USING btree ("successor_task_id" uuid_ops);--> statement-breakpoint
CREATE POLICY "anon users cannot access user_activities" ON "user_activities" AS PERMISSIVE FOR ALL TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "authenticated users can read own activities" ON "user_activities" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can insert own activities" ON "user_activities" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "anon users cannot access ai_suggestion_feedbacks" ON "ai_suggestion_feedbacks" AS PERMISSIVE FOR ALL TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "authenticated users can read own feedbacks" ON "ai_suggestion_feedbacks" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can create own feedbacks" ON "ai_suggestion_feedbacks" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can update own feedbacks" ON "ai_suggestion_feedbacks" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "anon users cannot access user_sessions" ON "user_sessions" AS PERMISSIVE FOR ALL TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "authenticated users can read own sessions" ON "user_sessions" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can insert own sessions" ON "user_sessions" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can update own sessions" ON "user_sessions" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "anon users cannot access profiles" ON "profiles" AS PERMISSIVE FOR ALL TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "authenticated users can read own profile" ON "profiles" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can update own profile" ON "profiles" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "anon users cannot access projects" ON "projects" AS PERMISSIVE FOR ALL TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "authenticated users can read own projects" ON "projects" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can insert own projects" ON "projects" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can update own projects" ON "projects" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "anon users cannot access tasks" ON "tasks" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "authenticated users can read own project tasks" ON "tasks" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can create tasks in own projects" ON "tasks" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can update own project tasks" ON "tasks" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "anon users cannot access task dependencies" ON "task_dependencies" AS PERMISSIVE FOR SELECT TO "anon" USING (false);--> statement-breakpoint
CREATE POLICY "authenticated users can read own project task dependencies" ON "task_dependencies" AS PERMISSIVE FOR SELECT TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can create task dependencies in own project" ON "task_dependencies" AS PERMISSIVE FOR INSERT TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can update task dependencies in own project" ON "task_dependencies" AS PERMISSIVE FOR UPDATE TO "authenticated";--> statement-breakpoint
CREATE POLICY "authenticated users can delete task dependencies in own project" ON "task_dependencies" AS PERMISSIVE FOR DELETE TO "authenticated";
*/