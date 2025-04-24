"use client"

import { useState, useEffect } from "react"

import Link from "next/link"

import { BookOpen, Clock, Calendar } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"


interface ReadingSession {
  id: string
  book_id: string
  book_title: string
  pages_read: number
  reading_time: number
  session_date: string
  book: {
    slug: string
  }
}

interface QueryResult {
  id: string
  book_id: string
  pages_read: number
  reading_time: number
  session_date: string
  books: {
    title: string
    slug: string
  }[] | null
}

interface ReadingProgressProps {
  userId: string
}

export function ReadingProgress({ userId }: ReadingProgressProps) {
  const [readingSessions, setReadingSessions] = useState<ReadingSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [timeframe, setTimeframe] = useState<"week" | "month" | "year">("week")
  const supabase = createClient()

  // دریافت جلسات مطالعه
  useEffect(() => {
    const fetchReadingSessions = async () => {
      setIsLoading(true)
      try {
        // محاسبه تاریخ شروع بر اساس بازه زمانی
        const startDate = new Date()
        if (timeframe === "week") {
          startDate.setDate(startDate.getDate() - 7)
        } else if (timeframe === "month") {
          startDate.setMonth(startDate.getMonth() - 1)
        } else {
          startDate.setFullYear(startDate.getFullYear() - 1)
        }

        const { data, error } = await supabase
          .from("reading_sessions")
          .select(`
            id,
            book_id,
            pages_read,
            reading_time,
            session_date,
            books:books(title, slug)
          `)
          .eq("user_id", userId)
          .gte("session_date", startDate.toISOString())
          .order("session_date", { ascending: false })

        if (error) throw error

        const formattedSessions = data.map((session: QueryResult) => ({
          id: session.id,
          book_id: session.book_id,
          book_title: session.books?.[0]?.title || "کتاب ناشناخته",
          pages_read: session.pages_read,
          reading_time: session.reading_time,
          session_date: session.session_date,
          book: {
            slug: session.books?.[0]?.slug || ""
          }
        }))

        setReadingSessions(formattedSessions)
      } catch (error) {
        console.error("خطا در دریافت جلسات مطالعه:", error)
        toast.error("خطا در دریافت جلسات مطالعه")
      } finally {
        setIsLoading(false)
      }
    }

    fetchReadingSessions()
  }, [userId, timeframe, supabase])

  // تبدیل دقیقه به ساعت و دقیقه
  const formatReadingTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours} ساعت و ${mins} دقیقه` : `${mins} دقیقه`
  }

  // تبدیل تاریخ به فرمت فارسی
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // محاسبه آمار کلی
  const calculateStats = () => {
    const totalPagesRead = readingSessions.reduce((sum, session) => sum + session.pages_read, 0)
    const totalReadingTime = readingSessions.reduce((sum, session) => sum + session.reading_time, 0)
    const uniqueBooks = new Set(readingSessions.map((session) => session.book_id)).size

    return {
      totalPagesRead,
      totalReadingTime,
      uniqueBooks,
    }
  }

  const stats = calculateStats()

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>پیشرفت مطالعه</CardTitle>
            <CardDescription>آمار مطالعه شما در بازه زمانی انتخاب شده</CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant={timeframe === "week" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("week")}
            >
              هفته
            </Button>
            <Button
              variant={timeframe === "month" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("month")}
            >
              ماه
            </Button>
            <Button
              variant={timeframe === "year" ? "default" : "outline"}
              size="sm"
              onClick={() => setTimeframe("year")}
            >
              سال
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-8 text-center">
            <div className="inline-block size-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
            <p className="text-muted-foreground mt-2 text-sm">در حال بارگذاری آمار مطالعه...</p>
          </div>
        ) : readingSessions.length === 0 ? (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">در این بازه زمانی مطالعه‌ای ثبت نشده است.</p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/library">مشاهده کتابخانه</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                      <BookOpen className="size-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">صفحات خوانده شده</p>
                      <p className="text-xl font-bold">{stats.totalPagesRead}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                      <Clock className="size-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">زمان مطالعه</p>
                      <p className="text-xl font-bold">{formatReadingTime(stats.totalReadingTime)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <BookOpen className="size-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">کتاب‌های مطالعه شده</p>
                      <p className="text-xl font-bold">{stats.uniqueBooks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-medium">جلسات مطالعه اخیر</h3>
              <div className="space-y-4">
                {readingSessions.slice(0, 5).map((session) => (
                  <Card key={session.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">
                          <Calendar className="text-muted-foreground size-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <Link href={`/books/${session.book.slug}`} className="font-medium hover:underline">
                              {session.book_title}
                            </Link>
                            <Badge variant="outline">{formatDate(session.session_date)}</Badge>
                          </div>
                          <div className="text-muted-foreground mt-2 flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <BookOpen className="size-4" />
                              <span>{session.pages_read} صفحه</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="size-4" />
                              <span>{formatReadingTime(session.reading_time)}</span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <Progress value={Math.min(100, (session.reading_time / 60) * 100)} className="h-1" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
