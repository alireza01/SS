import { Suspense } from "react"

import { unstable_cache } from "next/cache"
import { redirect } from "next/navigation"

import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createServerClient } from "@/lib/supabase/app-server"

export const metadata = {
  title: "داشبورد | کتاب‌یار",
  description: "داشبورد کاربری پلتفرم کتاب‌یار",
}

async function getUserData() {
  const supabase = createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login?redirect=/dashboard")
  }

  return user
}

interface DbBook {
  id: string
  title: string
  author: string
  coverImage: string
  totalPages: number
  isPremium: boolean
  level: string
}

interface DbReadingProgress {
  id: string
  bookId: string
  currentPage: number
  lastReadAt: string
  readingTime: number
  books: DbBook
}

interface DbActivity {
  id: string
  activityType: string
  bookId: string
  details: string
  createdAt: string
  books: {
    id: string
    title: string
    coverImage: string
  }
}

const getCurrentlyReading = unstable_cache(
  async (userId: string) => {
    const supabase = createServerClient()

    const { data } = await supabase
      .from("reading_progress")
      .select(`
        id,
        bookId,
        currentPage,
        lastReadAt,
        readingTime,
        books (
          id,
          title,
          author,
          coverImage,
          totalPages,
          isPremium,
          level
        )
      `)
      .eq("userId", userId)
      .order("lastReadAt", { ascending: false })
      .limit(4)

    if (!data) return []

    return (data as unknown as { 
      id: string
      bookId: string
      currentPage: number
      lastReadAt: string
      readingTime: number
      books: {
        id: string
        title: string
        author: string
        coverImage: string
        totalPages: number
        isPremium: boolean
        level: string
      }
    }[]).map(item => ({
      id: item.id,
      bookId: item.bookId,
      currentPage: item.currentPage,
      lastReadAt: item.lastReadAt,
      readingTime: item.readingTime,
      books: item.books
    }))
  },
  ["currently-reading"],
  { revalidate: 60 }
)

const getRecommendedBooks = unstable_cache(
  async (userId: string) => {
    const supabase = createServerClient()

    // Get user level
    const { data: userSettings } = await supabase
      .from("user_settings")
      .select("level")
      .eq("userId", userId)
      .single()

    const userLevel = userSettings?.level || "beginner"

    // Get read books
    const { data: readBooks } = await supabase
      .from("reading_progress")
      .select("bookId")
      .eq("userId", userId)

    const readBookIds = readBooks?.map((item) => item.bookId) || []

    // Get recommended books
    let query = supabase
      .from("books")
      .select(`
        id,
        title,
        author,
        coverImage,
        level,
        isPremium,
        totalPages,
        description,
        categories (
          id,
          name
        )
      `)
      .eq("level", userLevel)

    if (readBookIds.length > 0) {
      query = query.not("id", "in", `(${readBookIds.join(",")})`)
    }

    const { data } = await query.limit(6)

    if (!data) return []

    return (data as unknown as {
      id: string
      title: string
      author: string
      coverImage: string
      totalPages: number
      isPremium: boolean
      level: string
    }[]).map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      totalPages: book.totalPages,
      isPremium: book.isPremium,
      level: book.level
    }))
  },
  ["recommended-books"],
  { revalidate: 3600 }
)

const getUserStats = unstable_cache(
  async (userId: string) => {
    const supabase = createServerClient()

    const { data } = await supabase
      .from("user_stats")
      .select("totalBooksStarted, totalBooksCompleted, totalPagesRead, totalReadingTime, reviewStreak, quizStreak")
      .eq("userId", userId)
      .single()

    return (
      data || {
        totalBooksStarted: 0,
        totalBooksCompleted: 0,
        totalPagesRead: 0,
        totalReadingTime: 0,
        reviewStreak: 0,
        quizStreak: 0,
      }
    )
  },
  ["user-stats"],
  { revalidate: 60 } // Revalidate every minute instead of 5 minutes for more responsive stats
)

const getRecentActivity = unstable_cache(
  async (userId: string) => {
    const supabase = createServerClient()

    const { data } = await supabase
      .from("user_activity")
      .select(`
        id,
        activityType,
        bookId,
        details,
        createdAt,
        books (
          id,
          title,
          coverImage
        )
      `)
      .eq("userId", userId)
      .order("createdAt", { ascending: false })
      .limit(5)

    if (!data) return []

    return (data as unknown as {
      id: string
      activityType: string
      bookId: string
      details: string
      createdAt: string
      books: {
        id: string
        title: string
        coverImage: string
      }
    }[]).map(activity => ({
      id: activity.id,
      activityType: activity.activityType,
      bookId: activity.bookId,
      details: activity.details,
      createdAt: activity.createdAt,
      books: activity.books
    }))
  },
  ["recent-activity"],
  { revalidate: 60 }
)

const getDailyGoals = unstable_cache(
  async (userId: string) => {
    const supabase = createServerClient()

    // Get daily goals
    const { data: settings } = await supabase
      .from("user_settings")
      .select("dailyReadingGoal, dailyWordGoal")
      .eq("userId", userId)
      .single()

    const dailyReadingGoal = settings?.dailyReadingGoal || 30 // minutes
    const dailyWordGoal = settings?.dailyWordGoal || 10 // words

    // Get today's stats
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Reading time today
    const { data: readingToday } = await supabase
      .from("reading_sessions")
      .select("sum")
      .eq("userId", userId)
      .gte("startedAt", today.toISOString())
      .single()

    const readingTimeToday = readingToday?.sum || 0

    // Words reviewed today
    const { data: wordsToday } = await supabase
      .from("word_reviews")
      .select("count")
      .eq("userId", userId)
      .gte("reviewedAt", today.toISOString())
      .single()

    const wordsReviewedToday = wordsToday?.count || 0

    return {
      reading: {
        goal: dailyReadingGoal,
        current: readingTimeToday,
        percentage: Math.min(100, Math.round((readingTimeToday / dailyReadingGoal) * 100)),
      },
      vocabulary: {
        goal: dailyWordGoal,
        current: wordsReviewedToday,
        percentage: Math.min(100, Math.round((wordsReviewedToday / dailyWordGoal) * 100)),
      },
    }
  },
  ["daily-goals"],
  { revalidate: 60 } // Revalidate every minute
)

export default async function DashboardPage() {
  return (
    <div className="container py-8">
      <DashboardHeader />

      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardContent />
      </Suspense>
    </div>
  )
}

async function DashboardContent() {
  const user = await getUserData()
  const currentlyReading = await getCurrentlyReading(user.id)
  const recommendedBooks = await getRecommendedBooks(user.id)
  const userStats = await getUserStats(user.id)
  const recentActivity = await getRecentActivity(user.id)
  const dailyGoals = await getDailyGoals(user.id)

  return (
    <DashboardClient
      user={user}
      currentlyReading={currentlyReading}
      recommendedBooks={recommendedBooks}
      userStats={userStats}
      recentActivity={recentActivity}
      dailyGoals={dailyGoals}
    />
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-6 w-12" />
                </div>
                <Skeleton className="size-10 rounded-full" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
