export interface Word {
  id: string
  word: string
  meaning: string
  example: string
  level: "beginner" | "intermediate" | "advanced"
  status: "new" | "learning" | "reviewing" | "mastered"
  nextReviewAt: string
  createdAt: string
  userId: string
  books: {
    id: string
    title: string
  }[]
  review_count?: number
  explanation?: string
}

export interface WordToReview extends Word {
  books: {
    id: string
    title: string
  }[]
}

export interface WordStats {
  total: number
  new: number
  learning: number
  reviewing: number
  mastered: number
} 