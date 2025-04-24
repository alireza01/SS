import { Suspense } from "react"

import { unstable_cache } from "next/cache"
import { redirect } from "next/navigation"


import { DashboardClient } from "@/components/dashboard/dashboard-client"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createServerClient } from "@/lib/supabase/app-server"

import type { User } from "@supabase/supabase-js"

export const metadata = {
  title: "داشبورد | کتاب‌یار",
  description: "داشبورد کاربری پلتفرم کتاب‌یار",
}

interface DbBook {
  id: string
  title: string
  author: string
  coverImage: string
  totalPages: number
  isPremium: boolean
  level: string
  description?: string
  categories?: Array<{
    id: string
    name: string
  }>
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
    slug: string
  }
}

interface UserStats {
  totalBooksStarted: number
  totalBooksCompleted: number
  totalPagesRead: number
  totalReadingTime: number
  reviewStreak: number
  quizStreak: number
}

async function getUserData(): Promise<User> {
  const supabase = createServerClient()

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error) throw error
    if (!user) redirect("/auth/login?redirect=/dashboard")

    return user
  } catch (error) {
    console.error("Error fetching user data:", error)
    redirect("/auth/login?redirect=/dashboard")
  }
}

const getCurrentlyReading = unstable_cache(
  async (userId: string): Promise<DbReadingProgress[]> => {
    const supabase = createServerClient()

    try {
      const { data, error } = await supabase
        .from("reading_progress")
        .select(`
          id,
          bookId,
          currentPage,
          lastReadAt,
          readingTime,
          books:books (
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

      if (error) throw error
      if (!data) return []

      // Transform the data to match our interface
      const transformedData = data.map(item => ({
        id: item.id,
        bookId: item.bookId,
        currentPage: item.currentPage,
        lastReadAt: item.lastReadAt,
        readingTime: item.readingTime,
        books: Array.isArray(item.books) ? item.books[0] : item.books // Handle both array and single object cases
      })) satisfies DbReadingProgress[]

      return transformedData
    } catch (error) {
      console.error("Error fetching reading progress:", error)
      return []
    }
  },
  ["currently-reading"],
  { 
    revalidate: 60,
    tags: ["reading-progress"] 
  }
)

const getRecommendedBooks = unstable_cache(
  async (userId: string): Promise<DbBook[]> => {
    const supabase = createServerClient()

    try {
      const { data: userSettings, error: settingsError } = await supabase
        .from("user_settings")
        .select("level")
        .eq("userId", userId)
        .single()

      if (settingsError) throw settingsError

      const userLevel = userSettings?.level || "beginner"

      const { data: readBooks, error: readBooksError } = await supabase
        .from("reading_progress")
        .select("bookId")
        .eq("userId", userId)

      if (readBooksError) throw readBooksError

      const readBookIds = readBooks?.map((item) => item.bookId) || []

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

      const { data, error } = await query.limit(6)

      if (error) throw error
      if (!data) return []

      return data as DbBook[]
    } catch (error) {
      console.error("Error fetching recommended books:", error)
      return []
    }
  },
  ["recommended-books"],
  { 
    revalidate: 3600,
    tags: ["books", "recommendations"]
  }
)

const getUserStats = unstable_cache(
  async (userId: string): Promise<UserStats> => {
    const supabase = createServerClient()

    try {
      const { data, error } = await supabase
        .from("user_stats")
        .select("totalBooksStarted, totalBooksCompleted, totalPagesRead, totalReadingTime, reviewStreak, quizStreak")
        .eq("userId", userId)
        .single()

      if (error) throw error

      return data || {
        totalBooksStarted: 0,
        totalBooksCompleted: 0,
        totalPagesRead: 0,
        totalReadingTime: 0,
        reviewStreak: 0,
        quizStreak: 0,
      }
    } catch (error) {
      console.error("Error fetching user stats:", error)
      return {
        totalBooksStarted: 0,
        totalBooksCompleted: 0,
        totalPagesRead: 0,
        totalReadingTime: 0,
        reviewStreak: 0,
        quizStreak: 0,
      }
    }
  },
  ["user-stats"],
  { 
    revalidate: 60,
    tags: ["stats"]
  }
)

const getRecentActivity = unstable_cache(
  async (userId: string): Promise<DbActivity[]> => {
    const supabase = createServerClient()

    try {
      const { data, error } = await supabase
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
            coverImage,
            slug
          )
        `)
        .eq("userId", userId)
        .order("createdAt", { ascending: false })
        .limit(5)

      if (error) throw error
      if (!data) return []

      return data.map(item => ({
        id: item.id,
        activityType: item.activityType,
        bookId: item.bookId,
        details: item.details,
        createdAt: item.createdAt,
        books: Array.isArray(item.books) ? item.books[0] : item.books
      }))
    } catch (error) {
      console.error("Error fetching recent activity:", error)
      return []
    }
  },
  ["recent-activity"],
  { 
    revalidate: 60,
    tags: ["activity"]
  }
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
