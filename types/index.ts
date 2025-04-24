import type { READING_LEVELS, AI_MODELS } from "@/lib/constants"

import type { Profile } from './profile'
import type { Database } from './supabase'


export type ReadingLevel = keyof typeof READING_LEVELS
export type AIModel = keyof typeof AI_MODELS

export type { Database, Profile }

export interface Question {
  id: string
  word: string
  correctAnswer: string
  options: string[]
}

export interface User {
  id: string
  username: string | null
  fullName: string | null
  avatarUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface Book {
  id: string
  title: string
  author: string
  description: string | null
  coverUrl: string | null
  contentUrl: string
  level: 'beginner' | 'intermediate' | 'advanced' | null
  createdAt: string
  updatedAt: string
}

export interface UserProgress {
  id: string
  userId: string
  bookId: string
  currentPage: number
  isCompleted: boolean
  lastReadAt: string
  createdAt: string
  updatedAt: string
}

export interface VocabularyItem {
  id: string
  userId: string
  word: string
  definition: string
  context: string | null
  bookId: string | null
  masteryLevel: number
  createdAt: string
  updatedAt: string
}

export interface QuizHistory {
  id: string
  userId: string
  score: number
  totalQuestions: number
  completedAt: string
  streak: number
}

export interface UserStats {
  userId: string
  quizStreak: number
  totalWordsLearned: number
  lastActive: string
}

export type WordDifficulty = 'beginner' | 'intermediate' | 'advanced'

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  bookCount: number
  created_at: string
  updated_at: string
}

export interface Word {
  id: string
  word: string
  definition: string
  context: string
  meaning?: string
  explanation?: string
  level?: string
  book_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface Review {
  id: string
  rating: number
  comment: string
  book_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface ReadingProgress {
  id: string
  progress: number
  last_read_at: string
  book_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface AIAssistant {
  id: string
  name: string
  description: string
  model: AIModel
  created_at: string
  updated_at: string
}

export interface AIConversation {
  id: string
  messages: AIMessage[]
  assistant_id: string
  user_id: string
  created_at: string
  updated_at: string
}

export interface AIMessage {
  id: string
  role: "user" | "assistant"
  content: string
  conversation_id: string
  created_at: string
}

export interface DatabaseError extends Error {
  code: string
  details: string
  hint: string
  message: string
} 