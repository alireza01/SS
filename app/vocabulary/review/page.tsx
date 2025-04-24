import { Suspense } from "react"

import { Skeleton } from "@/components/ui/skeleton"
import { FlashcardSystem } from "@/components/vocabulary/flashcard-system"
import { createServerClient } from "@/lib/supabase/app-server"

export const metadata = {
  title: "مرور واژگان | کتاب‌یار",
  description: "مرور واژگان ذخیره شده با سیستم فلش‌کارت هوشمند",
}

async function getUserLevel() {
  const supabase = createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return "beginner"
  }

  const { data } = await supabase.from("user_settings").select("level").eq("userId", user.id).single()

  return data?.level || "beginner"
}

async function getWordsToReview(userLevel: string) {
  const supabase = createServerClient()
  const { data: words } = await supabase
    .from('user_words')
    .select(`
      *,
      books:book_id (
        id,
        title,
        slug
      )
    `)
    .eq('level', userLevel)
    .order('nextReviewAt', { ascending: true })
    .limit(10)

  return words || []
}

export default async function VocabularyReviewPage() {
  const userLevel = await getUserLevel()
  const words = await getWordsToReview(userLevel)

  return (
    <div className="container py-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">مرور واژگان</h1>
          <p className="text-muted-foreground">
            با استفاده از سیستم فلش‌کارت هوشمند، واژگان ذخیره شده خود را مرور کنید.
          </p>
        </div>

        <Suspense fallback={<FlashcardSkeleton />}>
          <FlashcardSystem words={words} />
        </Suspense>
      </div>
    </div>
  )
}

function FlashcardSkeleton() {
  return (
    <div className="flex flex-col items-center">
      <div className="mb-8 w-full max-w-3xl">
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="mb-6 h-4 w-full" />
      </div>

      <Skeleton className="mb-8 h-64 w-full max-w-md" />

      <div className="flex items-center justify-center gap-4">
        <Skeleton className="size-10" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-28" />
          <Skeleton className="h-10 w-28" />
        </div>
        <Skeleton className="size-10" />
      </div>
    </div>
  )
}
