export type WordLevel = 'beginner' | 'intermediate' | 'advanced'

export type WordStatus = 'new' | 'learning' | 'known'

export interface Book {
  id: string
  title: string
  slug: string
}

export interface WordToReview {
  id: string
  word: string
  meaning: string
  example: string | null
  level: WordLevel
  status: WordStatus
  nextReviewAt: string | null
  userId: string
  createdAt: string
  updatedAt: string
  books: Book | null
}

export interface WordStats {
  userId: string
  totalWords: number
  newWords: number
  learningWords: number
  knownWords: number
  lastReviewedAt: string | null
  streak: number
  streakCount: number
  createdAt: string
  updatedAt: string
}

// Database types
export interface SupabaseWordToReview {
  id: string
  word: string
  meaning: string
  example?: string | null
  level: string
  status: string
  nextReviewAt?: string | null
  userId: string
  createdAt: string
  updatedAt: string
  books?: Book | null
} 