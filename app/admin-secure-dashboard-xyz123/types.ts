import type { Database } from "@/types/supabase"

// Database table row types
export type Tables = Database["public"]["Tables"]
export type Functions = Database["public"]["Functions"]

// Table row types
export type BookRow = Tables["books"]["Row"]
export type ProfileRow = Tables["profiles"]["Row"] & {
  role: "admin" | "user"
  is_active: boolean
}
export type VocabularyRow = Tables["vocabulary"]["Row"]

// Statistics types
export interface BookStatistics {
  book_id: string
  title: string
  total_readers: number
  completed_readers: number
  average_progress: number
}

export interface WordStatistics {
  word_id: string
  word: string
  search_count: number
  unique_searchers: number
}

// RPC function response types
export type GetActiveReadersParams = {
  days: number
}

export type GetActiveReadersResponse = {
  active_users: number
  completion_rate: number
}

// Database response types
export type DatabaseResponse<T> = {
  data: T | null
  error: Error | null
  count?: number | null
  status: number
  statusText: string
}

// Utility type for count queries
export type CountResponse = {
  count: number | null
} 