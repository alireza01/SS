"use client"

import { useState } from "react"

import Link from "next/link"

import { BookOpen, BookMarked, Clock, Award, ChevronRight, Calendar } from "lucide-react"

import { CurrentlyReading } from "@/components/dashboard/currently-reading"
import { ReadingProgress } from "@/components/dashboard/reading-progress"
import { ReadingStats } from "@/components/dashboard/reading-stats"
import { RecommendedBooks } from "@/components/dashboard/recommended-books"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { DailyQuiz } from "@/components/vocabulary/daily-quiz"
import { VocabularyManager } from "@/components/vocabulary/vocabulary-manager"


import type { User } from "@supabase/supabase-js"

interface Book {
  id: string
  title: string
  author: string
  coverImage: string
  totalPages: number
  isPremium: boolean
  level: string
  books?: {
    id: string
    title: string
    author: string
    coverImage: string
    totalPages: number
    isPremium: boolean
    level: string
  }
}

interface ReadingProgressType {
  id: string
  bookId: string
  currentPage: number
  lastReadAt: string
  readingTime: number
  books: Book
}

interface UserStats {
  totalBooksStarted: number
  totalBooksCompleted: number
  totalPagesRead: number
  totalReadingTime: number
  reviewStreak: number
  quizStreak: number
}

interface Activity {
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

interface DailyGoal {
  goal: number
  current: number
  percentage: number
}

interface DailyGoals {
  reading: DailyGoal
  vocabulary: DailyGoal
}

interface DashboardClientProps {
  user: User
  currentlyReading: ReadingProgressType[]
  recommendedBooks: Book[]
  userStats: UserStats
  recentActivity: Activity[]
  dailyGoals: DailyGoals
}

export function DashboardClient({
  user,
  currentlyReading,
  recommendedBooks,
  userStats,
  recentActivity,
  dailyGoals,
}: DashboardClientProps) {
  const [activeTab, setActiveTab] = useState("overview")

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
      hour: "2-digit",
      minute: "2-digit",
    }).format(date)
  }

  // نوع فعالیت به فارسی
  const getActivityTypeText = (type: string) => {
    switch (type) {
      case "read":
        return "مطالعه کتاب"
      case "complete":
        return "تکمیل کتاب"
      case "review":
        return "مرور واژگان"
      case "quiz":
        return "آزمون روزانه"
      default:
        return type
    }
  }

  // آیکون فعالیت
  const getActivityIcon = (type: string) => {
    switch (type) {
      case "read":
        return <BookOpen className="size-5 text-blue-500" />
      case "complete":
        return <Award className="size-5 text-green-500" />
      case "review":
        return <BookMarked className="size-5 text-purple-500" />
      case "quiz":
        return <Calendar className="text-gold-500 size-5" />
      default:
        return <Clock className="size-5 text-gray-500" />
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">سلام، {user.user_metadata?.full_name || user.email}</h1>
          <p className="text-muted-foreground">خوش آمدید به داشبورد شخصی شما</p>
        </div>
        <Button asChild>
          <Link href="/library">مشاهده کتابخانه</Link>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">کتاب‌های شروع شده</p>
                <p className="text-2xl font-bold">{userStats.totalBooksStarted}</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                <BookOpen className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">کتاب‌های تکمیل شده</p>
                <p className="text-2xl font-bold">{userStats.totalBooksCompleted}</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                <Award className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">صفحات خوانده شده</p>
                <p className="text-2xl font-bold">{userStats.totalPagesRead}</p>
              </div>
              <div className="flex size-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
                <BookMarked className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-muted-foreground text-sm">زمان مطالعه</p>
                <p className="text-2xl font-bold">{formatReadingTime(userStats.totalReadingTime)}</p>
              </div>
              <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-12 items-center justify-center rounded-full">
                <Clock className="size-6" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Tabs defaultValue="overview" onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="overview">نمای کلی</TabsTrigger>
              <TabsTrigger value="reading">مطالعه</TabsTrigger>
              <TabsTrigger value="vocabulary">واژگان</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>در حال مطالعه</CardTitle>
                  <CardDescription>کتاب‌هایی که اخیراً مطالعه کرده‌اید</CardDescription>
                </CardHeader>
                <CardContent>
                  <CurrentlyReading userId={user.id} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>فعالیت‌های اخیر</CardTitle>
                  <CardDescription>آخرین فعالیت‌های شما در پلتفرم</CardDescription>
                </CardHeader>
                <CardContent>
                  {recentActivity.length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center">هنوز فعالیتی ثبت نشده است.</p>
                  ) : (
                    <div className="space-y-4">
                      {recentActivity.map((activity) => (
                        <div key={activity.id} className="flex items-start gap-4">
                          <div className="mt-1">{getActivityIcon(activity.activityType)}</div>
                          <div className="flex-1">
                            <p className="font-medium">
                              {getActivityTypeText(activity.activityType)}{" "}
                              {activity.books && (
                                <Link
                                  href={`/books/${activity.books.id}`}
                                  className="text-blue-600 hover:underline dark:text-blue-400"
                                >
                                  {activity.books.title}
                                </Link>
                              )}
                            </p>
                            <p className="text-muted-foreground text-sm">{activity.details}</p>
                            <p className="text-muted-foreground mt-1 text-xs">{formatDate(activity.createdAt)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="reading" className="space-y-6">
              <ReadingStats userId={user.id} />
              <ReadingProgress userId={user.id} />
            </TabsContent>

            <TabsContent value="vocabulary" className="space-y-6">
              <VocabularyManager userId={user.id} />
              <DailyQuiz userId={user.id} />
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle>اهداف روزانه</CardTitle>
              <CardDescription>پیشرفت شما در اهداف امروز</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">مطالعه روزانه</p>
                    <p className="text-muted-foreground text-sm">
                      {dailyGoals.reading.current} از {dailyGoals.reading.goal} دقیقه
                    </p>
                  </div>
                  <Progress value={dailyGoals.reading.percentage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">مرور واژگان</p>
                    <p className="text-muted-foreground text-sm">
                      {dailyGoals.vocabulary.current} از {dailyGoals.vocabulary.goal} کلمه
                    </p>
                  </div>
                  <Progress value={dailyGoals.vocabulary.percentage} className="h-2" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>پیشنهادات کتاب</CardTitle>
                  <CardDescription>بر اساس سلیقه و سطح شما</CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/library" className="flex items-center gap-1 text-xs">
                    مشاهده همه
                    <ChevronRight className="size-3" />
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <RecommendedBooks userId={user.id} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
