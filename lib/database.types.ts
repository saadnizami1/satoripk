export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      academic_stress: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          performance_rating: number
          stress_level: number
          study_hours: number | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          performance_rating: number
          stress_level: number
          study_hours?: number | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          performance_rating?: number
          stress_level?: number
          study_hours?: number | null
          user_id?: string
        }
        Relationships: []
      }
      chat_rate_limits: {
        Row: {
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          request_count: number
          user_id: string
          window_start: string
        }
        Update: {
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      chat_sessions: {
        Row: {
          created_at: string
          id: string
          messages: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          messages?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      journal_entries: {
        Row: {
          content: string
          created_at: string
          id: string
          legacy_id: string | null
          mood: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content?: string
          created_at?: string
          id?: string
          legacy_id?: string | null
          mood?: string | null
          title: string
          updated_at?: string
          user_id?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          legacy_id?: string | null
          mood?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      moods: {
        Row: {
          created_at: string
          id: string
          mood_score: number
          note: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          mood_score: number
          note?: string | null
          user_id?: string
        }
        Update: {
          created_at?: string
          id?: string
          mood_score?: number
          note?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          academic_stress: number | null
          age: number | null
          avatar_path: string | null
          city: string | null
          created_at: string
          education_board: string | null
          education_level: string | null
          family_status: string | null
          favorite_subject: string | null
          favorite_subject_why: string | null
          gender: string | null
          has_cheated: string | null
          has_tutoring: string | null
          hobbies: string[] | null
          id: string
          language: string
          location: string | null
          name: string | null
          onboarding_completed: boolean
          personality_traits: string[] | null
          previous_research: string | null
          recent_mood: number | null
          religion: string | null
          report_card_average: string | null
          research_consent: boolean
          school_name: string | null
          school_type: string | null
          stress_is_academic: string | null
          updated_at: string
          worst_subject: string | null
          worst_subject_why: string | null
        }
        Insert: {
          academic_stress?: number | null
          age?: number | null
          avatar_path?: string | null
          city?: string | null
          created_at?: string
          education_board?: string | null
          education_level?: string | null
          family_status?: string | null
          favorite_subject?: string | null
          favorite_subject_why?: string | null
          gender?: string | null
          has_cheated?: string | null
          has_tutoring?: string | null
          hobbies?: string[] | null
          id: string
          language?: string
          location?: string | null
          name?: string | null
          onboarding_completed?: boolean
          personality_traits?: string[] | null
          previous_research?: string | null
          recent_mood?: number | null
          religion?: string | null
          report_card_average?: string | null
          research_consent?: boolean
          school_name?: string | null
          school_type?: string | null
          stress_is_academic?: string | null
          updated_at?: string
          worst_subject?: string | null
          worst_subject_why?: string | null
        }
        Update: {
          academic_stress?: number | null
          age?: number | null
          avatar_path?: string | null
          city?: string | null
          created_at?: string
          education_board?: string | null
          education_level?: string | null
          family_status?: string | null
          favorite_subject?: string | null
          favorite_subject_why?: string | null
          gender?: string | null
          has_cheated?: string | null
          has_tutoring?: string | null
          hobbies?: string[] | null
          id?: string
          language?: string
          location?: string | null
          name?: string | null
          onboarding_completed?: boolean
          personality_traits?: string[] | null
          previous_research?: string | null
          recent_mood?: number | null
          religion?: string | null
          report_card_average?: string | null
          research_consent?: boolean
          school_name?: string | null
          school_type?: string | null
          stress_is_academic?: string | null
          updated_at?: string
          worst_subject?: string | null
          worst_subject_why?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      research_mood_complete: {
        Row: {
          age: number | null
          best_subject: string | null
          city: string | null
          class: string | null
          date_logged: string | null
          email: string | null
          gender: string | null
          grades: string | null
          home_tutoring: string | null
          mood_score: number | null
          name: string | null
          note: string | null
          participant_id: string | null
          school_name: string | null
          school_type_private_or_public: string | null
          worst_subject: string | null
        }
        Relationships: []
      }
      research_stress_complete: {
        Row: {
          age: number | null
          best_subject: string | null
          city: string | null
          class: string | null
          date_logged: string | null
          education_board: string | null
          email: string | null
          gender: string | null
          grades: string | null
          has_cheated: string | null
          hobbies: string[] | null
          home_tutoring: string | null
          name: string | null
          notes: string | null
          participant_id: string | null
          performance_rating: number | null
          personality_traits: string[] | null
          religion: string | null
          school_name: string | null
          school_type_private_or_public: string | null
          stress_level: number | null
          study_hours: number | null
          worst_subject: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_chat_rate_limit: { Args: never; Returns: boolean }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
