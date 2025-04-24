"use client"

import * as React from "react"

import Link from "next/link"

import { motion, AnimatePresence } from "framer-motion"
import { ArrowLeft, Check, X, Volume2, BookOpen, Trophy, Flame, Brain, ArrowRight } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import type { WordToReview, WordStats } from "@/types/vocabulary"

interface ReviewClientProps {
  wordsToReview: WordToReview[]
  wordStats: WordStats | null
}

interface ReviewResults {
  known: number
  learning: number
}

export function ReviewClient({ wordsToReview, wordStats }: ReviewClientProps) {
  const supabase = createClient()
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [showMeaning, setShowMeaning] = React.useState(false)
  const [reviewedWords, setReviewedWords] = React.useState<string[]>([])
  const [isCompleted, setIsCompleted] = React.useState(wordsToReview.length === 0)
  const [progress, setProgress] = React.useState(0)
  const [isLoading, setIsLoading] = React.useState(false)
  const [reviewResults, setReviewResults] = React.useState<ReviewResults>({
    known: 0,
    learning: 0,
  })

  React.useEffect(() => {
    // تنظیم پیشرفت
    if (wordsToReview.length > 0) {
      setProgress((reviewedWords.length / wordsToReview.length) * 100)
    }
  }, [reviewedWords, wordsToReview])

  // پخش تلفظ کلمه
  const playPronunciation = (word: string) => {
    if ("speechSynthesis" in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(word)
        utterance.lang = "en-US"
        utterance.onerror = () => {
          toast.error("خطا در پخش تلفظ")
        }
        window.speechSynthesis.speak(utterance)
      } catch (error) {
        console.error("خطا در پخش تلفظ:", error)
        toast.error("خطا در پخش تلفظ")
      }
    } else {
      toast.error("مرورگر شما از قابلیت تلفظ پشتیبانی نمی‌کند")
    }
  }

  // دریافت تعداد دفعات مرور یک کلمه
  const getReviewCount = async (wordId: string) => {
    try {
      const { data, error } = await supabase.from("word_reviews").select("count").eq("wordId", wordId).single()

      if (error) {
        return 0
      }

      return data?.count || 0
    } catch (error) {
      console.error("خطا در دریافت تعداد مرور:", error)
      return 0
    }
  }

  // ثبت مرور کلمه در جدول word_reviews
  const trackWordReview = async (wordId: string, knew: boolean) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { error } = await supabase.from("word_reviews").insert({
        wordId: wordId,
        userId: userData.user.id,
        knewWord: knew,
        reviewDate: new Date().toISOString()
      })

      if (error) {
        console.error("خطا در ثبت مرور کلمه:", error)
      }
    } catch (error) {
      console.error("خطا در ثبت مرور کلمه:", error)
    }
  }

  // مدیریت پاسخ کاربر (می‌دانستم یا نمی‌دانستم)
  const handleResponse = async (knew: boolean) => {
    if (currentIndex >= wordsToReview.length) return
    setIsLoading(true)

    const currentWord = wordsToReview[currentIndex]
    try {
      await trackWordReview(currentWord.id, knew)

      const nextReviewDate = new Date()
      let newStatus = currentWord.status
      let daysToAdd = 1

      if (knew) {
        if (currentWord.status === 'new') {
          newStatus = 'learning'
          daysToAdd = 1
          setReviewResults(prev => ({ ...prev, learning: prev.learning + 1 }))
        } else if (currentWord.status === 'learning') {
          const reviewCount = await getReviewCount(currentWord.id)
          if (reviewCount >= 3) {
            newStatus = 'known'
            daysToAdd = 7
            setReviewResults(prev => ({ ...prev, known: prev.known + 1 }))
          } else {
            daysToAdd = 3
            setReviewResults(prev => ({ ...prev, learning: prev.learning + 1 }))
          }
        } else if (currentWord.status === 'known') {
          daysToAdd = 14
          setReviewResults(prev => ({ ...prev, known: prev.known + 1 }))
        }
      } else {
        if (currentWord.status === 'known') {
          newStatus = 'learning'
        }
        daysToAdd = 1
        setReviewResults(prev => ({ ...prev, learning: prev.learning + 1 }))
      }

      nextReviewDate.setDate(nextReviewDate.getDate() + daysToAdd)

      const { error } = await supabase
        .from("user_words")
        .update({
          status: newStatus,
          nextReviewAt: nextReviewDate.toISOString(),
          updatedAt: new Date().toISOString(),
        })
        .eq("id", currentWord.id)

      if (error) {
        throw error
      }

      if (newStatus !== currentWord.status) {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { error: statsError } = await supabase.rpc("update_word_stats_on_status_change", {
          user_id_param: userData.user.id,
          old_status: currentWord.status,
          new_status: newStatus
        })

        if (statsError) {
          console.error("Error updating word stats:", statsError)
        }

        const { error: reviewStatsError } = await supabase.rpc("update_review_streak", {
          user_id_param: userData.user.id
        })
        
        if (reviewStatsError) {
          console.error("Error updating review streak:", reviewStatsError)
        }
      }

      setReviewedWords(prev => [...prev, currentWord.id])

      if (currentIndex < wordsToReview.length - 1) {
        setCurrentIndex(currentIndex + 1)
        setShowMeaning(false)
      } else {
        setIsCompleted(true)
      }
    } catch (error) {
      console.error("Error updating word status:", error)
      toast.error("Error updating word status")
    } finally {
      setIsLoading(false)
    }
  }

  // تنظیم رنگ کلمات بر اساس سطح دشواری
  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "text-green-600 dark:text-green-400"
      case "intermediate":
        return "text-blue-600 dark:text-blue-400"
      case "advanced":
        return "text-purple-600 dark:text-purple-400"
      default:
        return ""
    }
  }

  // تبدیل سطح دشواری به فارسی
  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner":
        return "مبتدی"
      case "intermediate":
        return "متوسط"
      case "advanced":
        return "پیشرفته"
      default:
        return level
    }
  }

  // نمایش صفحه تکمیل مرور
  if (isCompleted) {
    return (
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8 flex items-center gap-2">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/dashboard">
              <ArrowLeft className="ml-1 size-4" />
              بازگشت به داشبورد
            </Link>
          </Button>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-gold-200 dark:border-gold-800 bg-gold-50 dark:bg-gold-900/20">
            <CardContent className="p-8 text-center">
              <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 mx-auto mb-4 flex size-20 items-center justify-center rounded-full">
                <Trophy className="size-10" />
              </div>
              <h2 className="mb-2 text-2xl font-bold">مرور امروز تکمیل شد!</h2>
              <p className="text-muted-foreground mb-6">
                شما {reviewedWords.length} کلمه را با موفقیت مرور کردید. فردا برای تقویت حافظه خود دوباره برگردید.
              </p>

              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-2">
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                      <Check className="size-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">آموخته شده</p>
                      <p className="font-bold">{reviewResults.known}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="flex size-10 items-center justify-center rounded-full bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-400">
                      <Brain className="size-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">در حال یادگیری</p>
                      <p className="font-bold">{reviewResults.learning}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-10 items-center justify-center rounded-full">
                      <BookOpen className="size-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">کل واژگان</p>
                      <p className="font-bold">{wordStats?.totalWords || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-10 items-center justify-center rounded-full">
                      <Brain className="size-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">در حال یادگیری</p>
                      <p className="font-bold">{wordStats?.learningWords || 0}</p>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="flex items-center gap-3 p-4">
                    <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-10 items-center justify-center rounded-full">
                      <Flame className="size-5" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">روزهای متوالی</p>
                      <p className="font-bold">{wordStats?.reviewStreak || 0}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button asChild>
                  <Link href="/dashboard">بازگشت به داشبورد</Link>
                </Button>
                <Button variant="outline" asChild>
                  <Link href="/vocabulary">مدیریت واژگان</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  // نمایش صفحه مرور کلمات
  const currentWord = wordsToReview[currentIndex]

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="ml-1 size-4" />
            بازگشت به داشبورد
          </Link>
        </Button>
        <div className="text-muted-foreground text-sm">
          {currentIndex + 1} از {wordsToReview.length} کلمه
        </div>
      </div>

      <div className="mb-6">
        <Progress value={progress} className="h-2" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={currentWord.id}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.3 }}
          className="mb-8"
        >
          <Card className="border-gold-200 dark:border-gold-800 overflow-hidden border-2">
            <CardContent className="p-0">
              <div className="p-6 text-center">
                <div className="mb-2 flex justify-center">
                  <Badge variant="outline" className={getLevelColor(currentWord.level)}>
                    {getLevelText(currentWord.level)}
                  </Badge>
                </div>
                <div className="mb-4 flex items-center justify-center gap-2">
                  <h2 className="text-3xl font-bold">{currentWord.word}</h2>
                  <Button variant="ghost" size="icon" onClick={() => playPronunciation(currentWord.word)}>
                    <Volume2 className="size-4" />
                    <span className="sr-only">تلفظ</span>
                  </Button>
                </div>
                {currentWord.books && (
                  <p className="text-muted-foreground mb-6 text-sm">
                    از کتاب:{" "}
                    <Link href={`/books/${currentWord.books.slug}`} className="hover:text-primary underline">
                      {currentWord.books.title}
                    </Link>
                  </p>
                )}

                {!showMeaning ? (
                  <Button onClick={() => setShowMeaning(true)}>نمایش معنی</Button>
                ) : (
                  <AnimatePresence>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-4"
                    >
                      <div className="bg-muted rounded-lg p-4">
                        <p className="font-medium">{currentWord.meaning}</p>
                      </div>

                      {currentWord.example && (
                        <div className="text-muted-foreground text-sm">
                          <p className="italic">"{currentWord.example}"</p>
                        </div>
                      )}
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>

              {showMeaning && (
                <div className="grid grid-cols-2 border-t">
                  <Button
                    variant="ghost"
                    className="rounded-none p-6 text-red-500 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20"
                    onClick={() => handleResponse(false)}
                    disabled={isLoading}
                  >
                    <X className="ml-2 size-5" />
                    یادم نبود
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-none border-r p-6 text-green-500 hover:bg-green-50 hover:text-green-600 dark:hover:bg-green-950/20"
                    onClick={() => handleResponse(true)}
                    disabled={isLoading}
                  >
                    <Check className="ml-2 size-5" />
                    یادم بود
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      <div className="flex justify-between">
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (currentIndex > 0) {
              setCurrentIndex(currentIndex - 1)
              setShowMeaning(false)
            }
          }}
          disabled={currentIndex === 0 || isLoading}
        >
          <ArrowRight className="ml-1 size-4" />
          کلمه قبلی
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            if (currentIndex < wordsToReview.length - 1) {
              setCurrentIndex(currentIndex + 1)
              setShowMeaning(false)
            }
          }}
          disabled={currentIndex === wordsToReview.length - 1 || isLoading}
        >
          کلمه بعدی
          <ArrowLeft className="mr-1 size-4" />
        </Button>
      </div>
    </div>
  )
}
