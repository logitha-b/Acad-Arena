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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      colleges: {
        Row: {
          alpha_two_code: string | null
          avg_difficulty_rating: number | null
          avg_organization_rating: number | null
          avg_worth_rating: number | null
          city: string | null
          country: string | null
          created_at: string | null
          domains: string[] | null
          id: string
          name: string
          reputation_score: number | null
          state_province: string | null
          total_events: number | null
          total_reviews: number | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          alpha_two_code?: string | null
          avg_difficulty_rating?: number | null
          avg_organization_rating?: number | null
          avg_worth_rating?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          domains?: string[] | null
          id?: string
          name: string
          reputation_score?: number | null
          state_province?: string | null
          total_events?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          alpha_two_code?: string | null
          avg_difficulty_rating?: number | null
          avg_organization_rating?: number | null
          avg_worth_rating?: number | null
          city?: string | null
          country?: string | null
          created_at?: string | null
          domains?: string[] | null
          id?: string
          name?: string
          reputation_score?: number | null
          state_province?: string | null
          total_events?: number | null
          total_reviews?: number | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      event_bookmarks: {
        Row: {
          created_at: string | null
          event_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          event_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          event_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_bookmarks_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_ratings: {
        Row: {
          created_at: string | null
          difficulty_rating: number | null
          event_id: string
          id: string
          organization_rating: number | null
          review: string | null
          user_id: string
          worth_rating: number | null
        }
        Insert: {
          created_at?: string | null
          difficulty_rating?: number | null
          event_id: string
          id?: string
          organization_rating?: number | null
          review?: string | null
          user_id: string
          worth_rating?: number | null
        }
        Update: {
          created_at?: string | null
          difficulty_rating?: number | null
          event_id?: string
          id?: string
          organization_rating?: number | null
          review?: string | null
          user_id?: string
          worth_rating?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "event_ratings_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          certificate_url: string | null
          created_at: string | null
          event_id: string
          id: string
          status: string | null
          user_id: string
        }
        Insert: {
          certificate_url?: string | null
          created_at?: string | null
          event_id: string
          id?: string
          status?: string | null
          user_id: string
        }
        Update: {
          certificate_url?: string | null
          created_at?: string | null
          event_id?: string
          id?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_views: {
        Row: {
          event_id: string
          id: string
          user_id: string | null
          viewed_at: string | null
        }
        Insert: {
          event_id: string
          id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Update: {
          event_id?: string
          id?: string
          user_id?: string | null
          viewed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_views_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      event_winners: {
        Row: {
          college_name: string | null
          created_at: string
          event_id: string
          id: string
          position: number
          team_name: string | null
          updated_at: string
          winner_name: string
        }
        Insert: {
          college_name?: string | null
          created_at?: string
          event_id: string
          id?: string
          position?: number
          team_name?: string | null
          updated_at?: string
          winner_name: string
        }
        Update: {
          college_name?: string | null
          created_at?: string
          event_id?: string
          id?: string
          position?: number
          team_name?: string | null
          updated_at?: string
          winner_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_winners_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          agenda: Json | null
          category: string
          college: string | null
          college_id: string | null
          created_at: string | null
          current_attendees: number | null
          date: string
          description: string | null
          end_date: string | null
          end_time: string | null
          external_id: string | null
          id: string
          image_url: string | null
          is_completed: boolean | null
          is_verified: boolean | null
          location: string | null
          max_attendees: number | null
          mode: string | null
          organizer_id: string | null
          price: number | null
          registration_link: string | null
          source_name: string | null
          source_url: string | null
          speakers: Json | null
          time: string | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          agenda?: Json | null
          category: string
          college?: string | null
          college_id?: string | null
          created_at?: string | null
          current_attendees?: number | null
          date: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_completed?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          max_attendees?: number | null
          mode?: string | null
          organizer_id?: string | null
          price?: number | null
          registration_link?: string | null
          source_name?: string | null
          source_url?: string | null
          speakers?: Json | null
          time?: string | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          agenda?: Json | null
          category?: string
          college?: string | null
          college_id?: string | null
          created_at?: string | null
          current_attendees?: number | null
          date?: string
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          external_id?: string | null
          id?: string
          image_url?: string | null
          is_completed?: boolean | null
          is_verified?: boolean | null
          location?: string | null
          max_attendees?: number | null
          mode?: string | null
          organizer_id?: string | null
          price?: number | null
          registration_link?: string | null
          source_name?: string | null
          source_url?: string | null
          speakers?: Json | null
          time?: string | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "events_college_id_fkey"
            columns: ["college_id"]
            isOneToOne: false
            referencedRelation: "colleges"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          related_id: string | null
          title: string
          type: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          related_id?: string | null
          title: string
          type?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          related_id?: string | null
          title?: string
          type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          certificates_earned: number | null
          city: string | null
          college: string | null
          created_at: string | null
          display_name: string | null
          events_attended: number | null
          events_won: number | null
          id: string
          interests: string[] | null
          is_verified_organizer: boolean | null
          participation_points: number | null
          preferred_mode: string | null
          role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          certificates_earned?: number | null
          city?: string | null
          college?: string | null
          created_at?: string | null
          display_name?: string | null
          events_attended?: number | null
          events_won?: number | null
          id?: string
          interests?: string[] | null
          is_verified_organizer?: boolean | null
          participation_points?: number | null
          preferred_mode?: string | null
          role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          certificates_earned?: number | null
          city?: string | null
          college?: string | null
          created_at?: string | null
          display_name?: string | null
          events_attended?: number | null
          events_won?: number | null
          id?: string
          interests?: string[] | null
          is_verified_organizer?: boolean | null
          participation_points?: number | null
          preferred_mode?: string | null
          role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      review_summaries: {
        Row: {
          avg_difficulty: number | null
          avg_organization: number | null
          avg_worth: number | null
          common_feedback: string[] | null
          cons: string[] | null
          event_id: string
          generated_at: string | null
          id: string
          pros: string[] | null
          sentiment_label: string | null
          sentiment_score: number | null
          summary: string | null
          total_reviews: number | null
        }
        Insert: {
          avg_difficulty?: number | null
          avg_organization?: number | null
          avg_worth?: number | null
          common_feedback?: string[] | null
          cons?: string[] | null
          event_id: string
          generated_at?: string | null
          id?: string
          pros?: string[] | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          summary?: string | null
          total_reviews?: number | null
        }
        Update: {
          avg_difficulty?: number | null
          avg_organization?: number | null
          avg_worth?: number | null
          common_feedback?: string[] | null
          cons?: string[] | null
          event_id?: string
          generated_at?: string | null
          id?: string
          pros?: string[] | null
          sentiment_label?: string | null
          sentiment_score?: number | null
          summary?: string | null
          total_reviews?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "review_summaries_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          id: string
          joined_at: string | null
          status: string | null
          team_id: string
          user_id: string
        }
        Insert: {
          id?: string
          joined_at?: string | null
          status?: string | null
          team_id: string
          user_id: string
        }
        Update: {
          id?: string
          joined_at?: string | null
          status?: string | null
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          event_id: string | null
          id: string
          is_active: boolean | null
          max_members: number | null
          skills_needed: string[] | null
          title: string
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          skills_needed?: string[] | null
          title: string
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          event_id?: string | null
          id?: string
          is_active?: boolean | null
          max_members?: number | null
          skills_needed?: string[] | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      winner_projects: {
        Row: {
          created_at: string
          demo_link: string | null
          id: string
          impact: string | null
          problem_statement: string | null
          project_title: string
          repo_link: string | null
          solution_summary: string | null
          technologies: string[] | null
          updated_at: string
          winner_id: string
        }
        Insert: {
          created_at?: string
          demo_link?: string | null
          id?: string
          impact?: string | null
          problem_statement?: string | null
          project_title: string
          repo_link?: string | null
          solution_summary?: string | null
          technologies?: string[] | null
          updated_at?: string
          winner_id: string
        }
        Update: {
          created_at?: string
          demo_link?: string | null
          id?: string
          impact?: string | null
          problem_statement?: string | null
          project_title?: string
          repo_link?: string | null
          solution_summary?: string | null
          technologies?: string[] | null
          updated_at?: string
          winner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "winner_projects_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "event_winners"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
