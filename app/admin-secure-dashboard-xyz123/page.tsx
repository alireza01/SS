import { Suspense } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BookOpen, Users, BookText, TrendingUp } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import type { 
  BookStatistics, 
  WordStatistics, 
  GetActiveReadersResponse,
  CountResponse
} from "./types"

// Loading component for statistics
function StatisticsSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {[...Array(4)].map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="h-4 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
            <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mb-2" />
            <div className="h-4 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Loading component for charts
function ChartsSkeleton() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {[...Array(2)].map((_, i) => (
        <Card key={i}>
          <CardHeader>
            <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, j) => (
                <div key={j} className="space-y-2">
                  <div className="h-4 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                  <div className="h-2 w-full bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Error component for data fetching errors
function ErrorDisplay({ message }: { message: string }) {
  return (
    <div className="p-4 text-red-500 bg-red-50 dark:bg-red-900/10 rounded-lg">
      <p className="text-sm">{message}</p>
    </div>
  )
}

// Statistics component with real data
async function Statistics() {
  try {
    const supabase = await createServerClient()

    const [
      booksCount,
      usersCount,
      wordsCount,
      activeReadersResult
    ] = await Promise.all([
      supabase.from("books").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("vocabulary").select("*", { count: "exact", head: true }),
      supabase.rpc("get_active_readers", { days: 30 })
    ])

    // Handle potential errors
    if (booksCount.error) throw new Error(`Failed to fetch books count: ${booksCount.error.message}`)
    if (usersCount.error) throw new Error(`Failed to fetch users count: ${usersCount.error.message}`)
    if (wordsCount.error) throw new Error(`Failed to fetch vocabulary count: ${wordsCount.error.message}`)
    if (activeReadersResult.error) throw new Error(`Failed to fetch active readers: ${activeReadersResult.error.message}`)

    const activeReadersData = activeReadersResult.data as GetActiveReadersResponse[] | null
    const activeReaders = activeReadersData?.[0]?.active_users ?? 0
    const completionRate = activeReadersData?.[0]?.completion_rate ?? 0

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">کتاب‌ها</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{booksCount.count ?? 0}</div>
            <p className="text-xs text-muted-foreground">مجموع کتاب‌های موجود</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">کاربران</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount.count ?? 0}</div>
            <p className="text-xs text-muted-foreground">مجموع کاربران ثبت‌نام شده</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">واژگان</CardTitle>
            <BookText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{wordsCount.count ?? 0}</div>
            <p className="text-xs text-muted-foreground">مجموع واژگان ثبت شده</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">خوانندگان فعال</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReaders}</div>
            <p className="text-xs text-muted-foreground">
              نرخ تکمیل: {completionRate}%
            </p>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    return <ErrorDisplay message={error instanceof Error ? error.message : "An unexpected error occurred"} />
  }
}

// Charts component with real data
async function Charts() {
  try {
    const supabase = await createServerClient()

    const [popularBooksResult, popularWordsResult] = await Promise.all([
      supabase
        .from("book_statistics")
        .select(`
          book_id,
          title,
          total_readers,
          completed_readers,
          average_progress
        `)
        .order("total_readers", { ascending: false })
        .limit(5),
      supabase
        .from("word_statistics")
        .select(`
          word_id,
          word,
          search_count,
          unique_searchers
        `)
        .order("search_count", { ascending: false })
        .limit(5)
    ])

    // Handle potential errors
    if (popularBooksResult.error) throw new Error(`Failed to fetch popular books: ${popularBooksResult.error.message}`)
    if (popularWordsResult.error) throw new Error(`Failed to fetch popular words: ${popularWordsResult.error.message}`)

    const popularBooks = popularBooksResult.data as BookStatistics[]
    const popularWords = popularWordsResult.data as WordStatistics[]

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>کتاب‌های پرطرفدار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularBooks?.map((book) => {
                const percentage = (book.total_readers / (popularBooks[0]?.total_readers || 1)) * 100
                return (
                  <div key={book.book_id} className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{book.title}</p>
                        <span className="text-sm text-muted-foreground">
                          {book.total_readers} خواننده
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#D29E64] h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {book.completed_readers} تکمیل شده • میانگین پیشرفت: {Math.round(book.average_progress)}%
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>واژگان پرجستجو</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularWords?.map((word) => {
                const percentage = (word.search_count / (popularWords[0]?.search_count || 1)) * 100
                return (
                  <div key={word.word_id} className="flex items-center">
                    <div className="w-full">
                      <div className="flex items-center justify-between">
                        <p className="font-medium">{word.word}</p>
                        <span className="text-sm text-muted-foreground">
                          {word.search_count} جستجو
                        </span>
                      </div>
                      <div className="mt-1 w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-purple-500 h-full rounded-full"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {word.unique_searchers} کاربر منحصر به فرد
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  } catch (error) {
    return <ErrorDisplay message={error instanceof Error ? error.message : "An unexpected error occurred"} />
  }
}

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">داشبورد مدیریت</h1>
      <Suspense fallback={<StatisticsSkeleton />}>
        <Statistics />
      </Suspense>
      <Suspense fallback={<ChartsSkeleton />}>
        <Charts />
      </Suspense>
    </div>
  )
}