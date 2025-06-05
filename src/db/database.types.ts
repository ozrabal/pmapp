export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface Database {
  graphql_public: {
    Tables: Record<never, never>;
    Views: Record<never, never>;
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: Record<never, never>;
    CompositeTypes: Record<never, never>;
  };
  public: {
    Tables: {
      ai_suggestion_feedbacks: {
        Row: {
          created_at: string;
          feedback_text: string | null;
          id: string;
          is_helpful: boolean;
          suggestion_context: string;
          suggestion_hash: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          feedback_text?: string | null;
          id?: string;
          is_helpful: boolean;
          suggestion_context: string;
          suggestion_hash: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          feedback_text?: string | null;
          id?: string;
          is_helpful?: boolean;
          suggestion_context?: string;
          suggestion_hash?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "ai_suggestion_feedbacks_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          default_estimation_unit: Database["public"]["Enums"]["estimation_unit_enum"];
          deleted_at: string | null;
          first_name: string;
          id: string;
          last_login_at: string | null;
          last_name: string | null;
          projects_limit: number;
          timezone: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          default_estimation_unit?: Database["public"]["Enums"]["estimation_unit_enum"];
          deleted_at?: string | null;
          first_name: string;
          id: string;
          last_login_at?: string | null;
          last_name?: string | null;
          projects_limit?: number;
          timezone?: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          default_estimation_unit?: Database["public"]["Enums"]["estimation_unit_enum"];
          deleted_at?: string | null;
          first_name?: string;
          id?: string;
          last_login_at?: string | null;
          last_name?: string | null;
          projects_limit?: number;
          timezone?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      projects: {
        Row: {
          assumptions: Json | null;
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          estimation_unit: Database["public"]["Enums"]["estimation_unit_enum"];
          functional_blocks: Json | null;
          id: string;
          name: string;
          schedule: Json | null;
          status: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          assumptions?: Json | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          estimation_unit?: Database["public"]["Enums"]["estimation_unit_enum"];
          functional_blocks?: Json | null;
          id?: string;
          name: string;
          schedule?: Json | null;
          status?: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          assumptions?: Json | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          estimation_unit?: Database["public"]["Enums"]["estimation_unit_enum"];
          functional_blocks?: Json | null;
          id?: string;
          name?: string;
          schedule?: Json | null;
          status?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "projects_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      task_dependencies: {
        Row: {
          created_at: string;
          dependency_type: Database["public"]["Enums"]["task_dependency_type_enum"];
          id: string;
          predecessor_task_id: string;
          successor_task_id: string;
        };
        Insert: {
          created_at?: string;
          dependency_type?: Database["public"]["Enums"]["task_dependency_type_enum"];
          id?: string;
          predecessor_task_id: string;
          successor_task_id: string;
        };
        Update: {
          created_at?: string;
          dependency_type?: Database["public"]["Enums"]["task_dependency_type_enum"];
          id?: string;
          predecessor_task_id?: string;
          successor_task_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "task_dependencies_predecessor_task_id_fkey";
            columns: ["predecessor_task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "task_dependencies_successor_task_id_fkey";
            columns: ["successor_task_id"];
            isOneToOne: false;
            referencedRelation: "tasks";
            referencedColumns: ["id"];
          },
        ];
      };
      tasks: {
        Row: {
          ai_confidence_score: number | null;
          ai_suggestion_context: string | null;
          ai_suggestion_hash: string | null;
          created_at: string;
          deleted_at: string | null;
          description: string | null;
          estimated_by_ai: boolean;
          estimated_value: number | null;
          functional_block_id: string;
          id: string;
          metadata: Json | null;
          name: string;
          priority: Database["public"]["Enums"]["task_priority_enum"];
          project_id: string;
          updated_at: string;
        };
        Insert: {
          ai_confidence_score?: number | null;
          ai_suggestion_context?: string | null;
          ai_suggestion_hash?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          estimated_by_ai?: boolean;
          estimated_value?: number | null;
          functional_block_id: string;
          id?: string;
          metadata?: Json | null;
          name: string;
          priority?: Database["public"]["Enums"]["task_priority_enum"];
          project_id: string;
          updated_at?: string;
        };
        Update: {
          ai_confidence_score?: number | null;
          ai_suggestion_context?: string | null;
          ai_suggestion_hash?: string | null;
          created_at?: string;
          deleted_at?: string | null;
          description?: string | null;
          estimated_by_ai?: boolean;
          estimated_value?: number | null;
          functional_block_id?: string;
          id?: string;
          metadata?: Json | null;
          name?: string;
          priority?: Database["public"]["Enums"]["task_priority_enum"];
          project_id?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_project_id_fkey";
            columns: ["project_id"];
            isOneToOne: false;
            referencedRelation: "projects";
            referencedColumns: ["id"];
          },
        ];
      };
      user_activities: {
        Row: {
          activity_type: string;
          created_at: string;
          duration_seconds: number | null;
          id: string;
          metadata: Json | null;
          user_id: string;
        };
        Insert: {
          activity_type: string;
          created_at?: string;
          duration_seconds?: number | null;
          id?: string;
          metadata?: Json | null;
          user_id: string;
        };
        Update: {
          activity_type?: string;
          created_at?: string;
          duration_seconds?: number | null;
          id?: string;
          metadata?: Json | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_activities_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      user_sessions: {
        Row: {
          end_time: string | null;
          id: string;
          is_active: boolean;
          start_time: string;
          total_duration_seconds: number | null;
          user_id: string;
        };
        Insert: {
          end_time?: string | null;
          id?: string;
          is_active?: boolean;
          start_time?: string;
          total_duration_seconds?: number | null;
          user_id: string;
        };
        Update: {
          end_time?: string | null;
          id?: string;
          is_active?: boolean;
          start_time?: string;
          total_duration_seconds?: number | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_sessions_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      estimation_unit_enum: "hours" | "storypoints";
      task_dependency_type_enum: "finish_to_start" | "start_to_start" | "finish_to_finish" | "start_to_finish";
      task_priority_enum: "low" | "medium" | "high";
    };
    CompositeTypes: Record<never, never>;
  };
}

type DefaultSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"] | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"] | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"] | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      estimation_unit_enum: ["hours", "storypoints"],
      task_dependency_type_enum: ["finish_to_start", "start_to_start", "finish_to_finish", "start_to_finish"],
      task_priority_enum: ["low", "medium", "high"],
    },
  },
} as const;
