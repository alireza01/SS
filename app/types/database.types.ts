export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      books: {
        Row: {
          id: string
          title: string
          author: string | null
          description: string | null
          language: string
          difficulty_level: string
          cover_url: string | null
          is_published: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['books']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['books']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          email: string
          role: 'user' | 'admin'
          name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['profiles']['Insert']>
      }
      vocabulary: {
        Row: {
          id: string
          word: string
          meaning: string
          example: string | null
          level: 'beginner' | 'intermediate' | 'advanced'
          status: 'new' | 'learning' | 'mastered'
          next_review_at: string | null
          user_id: string
          book_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vocabulary']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vocabulary']['Insert']>
      }
      vocabulary_stats: {
        Row: {
          user_id: string
          total_words: number
          new_words: number
          learning_words: number
          known_words: number
          last_reviewed_at: string | null
          streak: number
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['vocabulary_stats']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['vocabulary_stats']['Insert']>
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_id: string
          status: 'active' | 'canceled' | 'past_due' | 'unpaid'
          current_period_start: string
          current_period_end: string
          cancel_at_period_end: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['subscriptions']['Row'], 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['subscriptions']['Insert']>
      }
      site_settings: {
        Row: {
          id: string
          site_name: string
          site_description: string | null
          allow_registration: boolean
          maintenance_mode: boolean
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['site_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['site_settings']['Insert']>
      }
      email_settings: {
        Row: {
          id: string
          smtp_host: string
          smtp_port: number
          smtp_username: string
          smtp_password: string
          created_at: string
          updated_at: string
        }
        Insert: Omit<Database['public']['Tables']['email_settings']['Row'], 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Database['public']['Tables']['email_settings']['Insert']>
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['newsletter_subscribers']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['newsletter_subscribers']['Insert']>
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
  }
} 