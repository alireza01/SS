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
      profiles: {
        Row: {
          id: string
          username: string | null
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string | null
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      settings: {
        Row: {
          id: string
          site_name: string
          site_description: string
          allow_registration: boolean
          maintenance_mode: boolean
          smtp_host: string | null
          smtp_port: number | null
          smtp_username: string | null
          smtp_password: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          site_name: string
          site_description: string
          allow_registration?: boolean
          maintenance_mode?: boolean
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          smtp_password?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          site_name?: string
          site_description?: string
          allow_registration?: boolean
          maintenance_mode?: boolean
          smtp_host?: string | null
          smtp_port?: number | null
          smtp_username?: string | null
          smtp_password?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      books: {
        Row: {
          id: string
          slug: string
          title: string
          author: string
          description: string | null
          cover_image: string | null
          language: string
          level: "beginner" | "intermediate" | "advanced"
          total_pages: number
          is_premium: boolean
          is_active: boolean
          read_count: number
          rating: number | null
          category_id: string | null
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          slug: string
          title: string
          author: string
          description?: string | null
          cover_image?: string | null
          language?: string
          level?: "beginner" | "intermediate" | "advanced"
          total_pages?: number
          is_premium?: boolean
          is_active?: boolean
          read_count?: number
          rating?: number | null
          category_id?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          slug?: string
          title?: string
          author?: string
          description?: string | null
          cover_image?: string | null
          language?: string
          level?: "beginner" | "intermediate" | "advanced"
          total_pages?: number
          is_premium?: boolean
          is_active?: boolean
          read_count?: number
          rating?: number | null
          category_id?: string | null
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          book_id: string
          current_page: number
          is_completed: boolean
          last_read_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          current_page?: number
          is_completed?: boolean
          last_read_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          current_page?: number
          is_completed?: boolean
          last_read_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      vocabulary: {
        Row: {
          id: string
          user_id: string
          word: string
          definition: string
          context: string | null
          book_id: string | null
          mastery_level: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          word: string
          definition: string
          context?: string | null
          book_id?: string | null
          mastery_level?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          word?: string
          definition?: string
          context?: string | null
          book_id?: string | null
          mastery_level?: number
          created_at?: string
          updated_at?: string
        }
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
