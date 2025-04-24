declare module "@/types/vocabulary" {
  export type WordStatus = 'new' | 'learning' | 'known'
  export type WordLevel = 'beginner' | 'intermediate' | 'advanced'

  export interface BaseWord {
    id: string
    word: string
    meaning: string
    example: string | null
    level: WordLevel
    book_id?: string
    book_title?: string
  }

  export interface Word extends BaseWord {
    status: WordStatus
    nextReviewAt: string | null
    userId: string
    createdAt?: string
    updatedAt?: string
  }

  export interface Book {
    id: string
    title: string
    slug: string
  }

  export interface WordToReview extends Word {
    books: Book | null
  }

  export interface WordStats {
    id: string
    userId: string
    totalWords: number
    learningWords: number
    knownWords: number
    reviewStreak: number
    lastReviewedAt?: string
    createdAt?: string
    updatedAt?: string
  }

  export interface WordReview {
    id: string
    wordId: string
    userId: string
    knewWord: boolean
    reviewDate: string
  }

  export interface SupabaseWordToReview {
    id: string
    word: string
    meaning: string
    example: string | null
    level: string
    status: string
    nextReviewAt: string | null
    books: {
      id: string
      title: string
      slug: string
    } | null
  }
} 