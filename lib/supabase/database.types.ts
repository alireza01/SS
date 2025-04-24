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
          slug: string
          description: string | null
          author_id: string
          cover_image: string | null
          language: string
          level: 'beginner' | 'intermediate' | 'advanced'
          total_pages: number
          is_premium: boolean
          is_active: boolean
          published_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          author_id: string
          cover_image?: string | null
          language: string
          level: 'beginner' | 'intermediate' | 'advanced'
          total_pages: number
          is_premium?: boolean
          is_active?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          slug?: string
          description?: string | null
          author_id?: string
          cover_image?: string | null
          language?: string
          level?: 'beginner' | 'intermediate' | 'advanced'
          total_pages?: number
          is_premium?: boolean
          is_active?: boolean
          published_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reading_progress: {
        Row: {
          id: string
          user_id: string
          book_id: string
          current_page: number
          last_read_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          current_page: number
          last_read_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          current_page?: number
          last_read_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      book_ratings: {
        Row: {
          id: string
          user_id: string
          book_id: string
          rating: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          rating: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          rating?: number
          created_at?: string
          updated_at?: string
        }
      }
      bookmarks: {
        Row: {
          id: string
          user_id: string
          book_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          book_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          book_id?: string
          created_at?: string
        }
      }
      book_categories: {
        Row: {
          id: string
          name: string
          slug: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          slug: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          slug?: string
          created_at?: string
        }
      }
      book_to_categories: {
        Row: {
          book_id: string
          category_id: string
        }
        Insert: {
          book_id: string
          category_id: string
        }
        Update: {
          book_id?: string
          category_id?: string
        }
      }
      email_settings: {
        Row: {
          id: string
          smtp_host: string | null
          smtp_port: number
          smtp_username: string | null
          smtp_password: string | null
          from_email: string | null
          from_name: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          smtp_host?: string | null
          smtp_port?: number
          smtp_username?: string | null
          smtp_password?: string | null
          from_email?: string | null
          from_name?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          smtp_host?: string | null
          smtp_port?: number
          smtp_username?: string | null
          smtp_password?: string | null
          from_email?: string | null
          from_name?: string | null
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