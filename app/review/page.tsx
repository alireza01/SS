import { redirect } from "next/navigation"

import { ReviewClient } from "@/components/review/review-client"
import { createServerClient } from "@/lib/supabase/app-server"

export default async function ReviewPage() {
  const supabase = createServerClient()

  // بررسی احراز هویت کاربر
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?redirect=/review")
  }

  // دریافت واژگان نیازمند مرور
  const today = new Date().toISOString()
  const { data: wordsToReview } = await supabase
    .from("user_words")
    .select(`
      id,
      word,
      meaning,
      example,
      level,
      status,
      nextReviewAt,
      books (
        id,
        title
      )
    `)
    .eq("userId", session.user.id)
    .or(`nextReviewAt.lte.${today}, status.eq.new`)
    .order("status", { ascending: true })
    .limit(20)

  // دریافت آمار واژگان کاربر
  const { data: wordStats } = await supabase.from("user_words_stats").select("*").eq("userId", session.user.id).single()

  return <ReviewClient wordsToReview={wordsToReview || []} wordStats={wordStats || null} />
}
