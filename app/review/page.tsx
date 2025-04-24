import { redirect, notFound } from "next/navigation"

import { ReviewClient } from "@/components/review/review-client"
import { createServerClient } from "@/lib/supabase/app-server"
import type { WordToReview, WordStats, Book, WordLevel, WordStatus } from "@/types/vocabulary"

interface SupabaseWordToReview {
  id: string;
  word: string;
  meaning: string | null;
  example: string | null;
  level: string;
  status: string;
  nextReviewAt: string | null;
  books: {
    id: string;
    title: string;
    slug: string;
  }[] | null;
}

export default async function ReviewPage() {
  const supabase = createServerClient()

  // Check authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?redirect=/review")
  }

  // Fetch words that need review
  const today = new Date().toISOString()
  const { data: wordsToReview, error: wordsError } = await supabase
    .from("user_words")
    .select(`
      id,
      word,
      meaning,
      example,
      level,
      status,
      nextReviewAt,
      books:book_id (
        id,
        title,
        slug
      )
    `)
    .eq("userId", session.user.id)
    .or(`nextReviewAt.lte.${today}, status.eq.new`)
    .order("status", { ascending: true })
    .limit(20)

  if (wordsError) {
    console.error("Error fetching words to review:", wordsError)
    notFound()
  }

  // Fetch user's word stats
  const { data: wordStats, error: statsError } = await supabase
    .from("user_words_stats")
    .select("*")
    .eq("userId", session.user.id)
    .single()

  if (statsError) {
    console.error("Error fetching word stats:", statsError)
    notFound()
  }

  // Transform and validate the data
  const transformedWords = (wordsToReview || []).map((word): WordToReview => {
    // Validate level and status
    const level = ['beginner', 'intermediate', 'advanced'].includes(word.level) 
      ? word.level as WordLevel
      : 'beginner' as WordLevel
    
    const status = ['new', 'learning', 'known'].includes(word.status)
      ? word.status as WordStatus
      : 'new' as WordStatus

    // Create a Book object from the first book in the array
    const book: Book | null = word.books?.[0] ? {
      id: word.books[0].id,
      title: word.books[0].title,
      slug: word.books[0].slug
    } : null

    // Return the WordToReview object with the correct structure
    return {
      id: word.id,
      word: word.word,
      meaning: word.meaning || '',
      example: word.example || '',
      level,
      status,
      nextReviewAt: word.nextReviewAt || '',
      userId: session.user.id,
      books: book
    }
  })

  return (
    <div className="container max-w-4xl py-8">
      <ReviewClient 
        wordsToReview={transformedWords} 
        wordStats={wordStats as WordStats} 
      />
    </div>
  )
}
