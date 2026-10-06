export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      user_profiles: {
        Row: {
          id: string
          first_name: string
          last_name: string
          email: string
          phone: string
          height_cm: number | null
          current_weight_kg: number | null
          target_weight_kg: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          first_name: string
          last_name: string
          email: string
          phone: string
          height_cm?: number | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          first_name?: string
          last_name?: string
          email?: string
          phone?: string
          height_cm?: number | null
          current_weight_kg?: number | null
          target_weight_kg?: number | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      push_subscriptions: {
        Row: {
          id: string
          endpoint: string
          subscription: Json
          user_agent: string | null
          enabled: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          endpoint: string
          subscription: Json
          user_agent?: string | null
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          endpoint?: string
          subscription?: Json
          user_agent?: string | null
          enabled?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      weekly_plans: {
        Row: {
          id: string
          profile_id: string | null
          week_starting_date: string
          source: 'ai' | 'fallback'
          plan: Json
          locked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          week_starting_date: string
          source: 'ai' | 'fallback'
          plan: Json
          locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          week_starting_date?: string
          source?: 'ai' | 'fallback'
          plan?: Json
          locked?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      meal_logs: {
        Row: {
          id: string
          log_date: string
          slot: 'breakfast' | 'brunch' | 'lunch' | 'dinner' | null
          status: 'eaten' | 'skipped'
          source: 'planned' | 'custom_text'
          name: string
          calories: number
          protein_g: number
          notes: string | null
          logged_at: string
          created_at: string
        }
        Insert: {
          id?: string
          log_date: string
          slot?: 'breakfast' | 'brunch' | 'lunch' | 'dinner' | null
          status: 'eaten' | 'skipped'
          source: 'planned' | 'custom_text'
          name: string
          calories: number
          protein_g: number
          notes?: string | null
          logged_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          log_date?: string
          slot?: 'breakfast' | 'brunch' | 'lunch' | 'dinner' | null
          status?: 'eaten' | 'skipped'
          source?: 'planned' | 'custom_text'
          name?: string
          calories?: number
          protein_g?: number
          notes?: string | null
          logged_at?: string
          created_at?: string
        }
        Relationships: []
      }
      workout_logs: {
        Row: {
          id: string
          log_date: string
          split_label: string
          completed_at: string
        }
        Insert: {
          id?: string
          log_date: string
          split_label: string
          completed_at?: string
        }
        Update: {
          id?: string
          log_date?: string
          split_label?: string
          completed_at?: string
        }
        Relationships: []
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
    CompositeTypes: Record<string, never>
  }
}
