"use client"

import * as React from "react"
import { useState, useEffect } from "react"

import { motion, AnimatePresence } from "framer-motion"
import { Volume2, ArrowLeft, ArrowRight, Check, X } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"

interface Word {
  id: string
  word: string
  meaning: string
  explanation?: string
  example?: string
  status: "learning" | "reviewing" | "mastered"
  next_review_at: string
  level: "beginner" | "intermediate" | "advanced"
  review_count: number
  book_id?: string
  book_title?: string
}

interface AdvancedFlashcardSystemProps {
  words: Word[]
  userLevel: string
}

export function AdvancedFlashcardSystem({ words, userLevel }: AdvancedFlashcardSystemProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [shuffledWords, setShuffledWords] = useState<Word[]>([])
  const [studySession, setStudySession] = useState(false)
  const [sessionStats, setSessionStats] = useState({
    correct: 0,
    incorrect: 0,
    total: 0,
  })
  const [reviewMode, setReviewMode] = useState<"all" | "due" | "difficult" | "new">("due")
  const [progress, setProgress] = useState(0)
  const supabase = createClient()

  // Filter words based on review mode and user level
  useEffect(() => {
    if (words.length > 0) {
      let filtered = [...words]

      // Filter by user level
      if (userLevel === "beginner") {
        filtered = filtered.filter(word => word.level === "beginner")
      } else if (userLevel === "intermediate") {
        filtered = filtered.filter(word => word.level !== "advanced")
      }

      // Filter by review mode
      if (reviewMode === "due") {
        filtered = filtered.filter(word => new Date(word.next_review_at) <= new Date())
      } else if (reviewMode === "difficult") {
        filtered = filtered.filter(word => word.level === "advanced")
      } else if (reviewMode === "new") {
        filtered = filtered.filter(word => word.review_count === 0)
      }

      // Shuffle filtered words
      const shuffled = filtered.sort(() => Math.random() - 0.5)
      setShuffledWords(shuffled)
      setCurrentIndex(0)
      setProgress(0)
    }
  }, [words, reviewMode, userLevel])

  // Update progress
  useEffect(() => {
    if (shuffledWords.length > 0) {
      setProgress(Math.round((currentIndex / shuffledWords.length) * 100))
    }
  }, [currentIndex, shuffledWords.length])

  // Start study session
  const startStudySession = () => {
    setStudySession(true)
    setCurrentIndex(0)
    setIsFlipped(false)
    setSessionStats({
      correct: 0,
      incorrect: 0,
      total: 0,
    })
    toast.success("جلسه مرور واژگان آغاز شد")
  }

  // End study session and save stats
  const endStudySession = async () => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { error } = await supabase.from("vocabulary_sessions").insert({
        user_id: userData.user.id,
        words_reviewed: sessionStats.total,
        correct_answers: sessionStats.correct,
        incorrect_answers: sessionStats.incorrect,
        session_date: new Date().toISOString(),
        review_mode: reviewMode,
      })

      if (error) throw error

      setStudySession(false)
      toast.success("جلسه مرور واژگان با موفقیت به پایان رسید")
    } catch (error) {
      console.error("خطا در ثبت جلسه مرور واژگان:", error)
      setStudySession(false)
      toast.error("خطا در ثبت جلسه مرور واژگان")
    }
  }

  // Handle correct answer
  const handleCorrectAnswer = async () => {
    try {
      const currentWord = shuffledWords[currentIndex]
      const reviewCount = (currentWord.review_count || 0) + 1
      
      // Calculate next review date using spaced repetition
      const nextReviewDays = Math.min(Math.pow(2, reviewCount), 60)
      const nextReviewDate = new Date()
      nextReviewDate.setDate(nextReviewDate.getDate() + nextReviewDays)

      // Update word status
      const newStatus = currentWord.status === "learning" ? "reviewing" : "mastered"

      const { error } = await supabase
        .from("user_words")
        .update({
          status: newStatus,
          next_review_at: nextReviewDate.toISOString(),
          review_count: reviewCount,
        })
        .eq("id", currentWord.id)

      if (error) throw error

      setSessionStats({
        ...sessionStats,
        correct: sessionStats.correct + 1,
        total: sessionStats.total + 1,
      })

      toast.success("پاسخ درست! وضعیت کلمه ارتقا یافت")
      goToNextCard()
    } catch (error) {
      console.error("خطا در به‌روزرسانی وضعیت کلمه:", error)
      toast.error("خطا در به‌روزرسانی وضعیت کلمه")
    }
  }

  // Handle incorrect answer
  const handleIncorrectAnswer = async () => {
    try {
      const currentWord = shuffledWords[currentIndex]

      const { error } = await supabase
        .from("user_words")
        .update({
          status: "learning",
          next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          review_count: (currentWord.review_count || 0) + 1,
        })
        .eq("id", currentWord.id)

      if (error) throw error

      setSessionStats({
        ...sessionStats,
        incorrect: sessionStats.incorrect + 1,
        total: sessionStats.total + 1,
      })

      toast.error("پاسخ نادرست! کلمه به وضعیت یادگیری بازگشت")
      goToNextCard()
    } catch (error) {
      console.error("خطا در به‌روزرسانی وضعیت کلمه:", error)
      toast.error("خطا در به‌روزرسانی وضعیت کلمه")
    }
  }

  // Navigation functions
  const goToNextCard = () => {
    if (currentIndex < shuffledWords.length - 1) {
      setCurrentIndex(currentIndex + 1)
      setIsFlipped(false)
    } else {
      endStudySession()
    }
  }

  const goToPrevCard = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1)
      setIsFlipped(false)
    }
  }

  // Play pronunciation
  const playPronunciation = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = "en-US"
      window.speechSynthesis.speak(utterance)
    } else {
      toast.error("مرورگر شما از قابلیت تلفظ پشتیبانی نمی‌کند")
    }
  }

  // Render functions
  if (shuffledWords.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4 text-center">
            <h3 className="text-xl font-bold">هیچ کلمه‌ای برای مرور وجود ندارد</h3>
            <p className="text-muted-foreground">
              {reviewMode === "due" 
                ? "همه کلمات مرور شده‌اند. بعداً دوباره تلاش کنید."
                : "کلمه‌ای با معیارهای انتخاب شده یافت نشد."}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!studySession) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold">سیستم فلش‌کارت پیشرفته</h3>
              <p className="text-muted-foreground mt-2">
                با استفاده از سیستم فلش‌کارت پیشرفته، واژگان خود را به صورت مؤثر مرور کنید.
              </p>
            </div>

            <Tabs value={reviewMode} onValueChange={(value: string) => setReviewMode(value as typeof reviewMode)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">همه</TabsTrigger>
                <TabsTrigger value="due">نیازمند مرور</TabsTrigger>
                <TabsTrigger value="difficult">دشوار</TabsTrigger>
                <TabsTrigger value="new">جدید</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="flex justify-center">
              <Button onClick={startStudySession}>شروع جلسه مرور</Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  const currentWord = shuffledWords[currentIndex]

  return (
    <Card>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="icon" onClick={() => playPronunciation(currentWord.word)}>
                <Volume2 className="size-4" />
              </Button>
              <div className="text-muted-foreground text-sm">
                {currentIndex + 1} از {shuffledWords.length}
              </div>
            </div>
            <Progress value={progress} className="w-[100px]" />
          </div>

          <div
            className="perspective-1000 aspect-[3/2] w-full cursor-pointer"
            onClick={() => setIsFlipped(!isFlipped)}
          >
            <AnimatePresence initial={false} mode="wait">
              <motion.div
                key={isFlipped ? "back" : "front"}
                initial={{ rotateY: isFlipped ? -90 : 90, opacity: 0 }}
                animate={{ rotateY: 0, opacity: 1 }}
                exit={{ rotateY: isFlipped ? 90 : -90, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="size-full"
              >
                <Card className="flex size-full items-center justify-center">
                  <CardContent className="space-y-4 p-6 text-center">
                    {isFlipped ? (
                      <React.Fragment>
                        <p className="text-2xl font-bold">{currentWord.meaning}</p>
                        {currentWord.explanation && (
                          <p className="text-muted-foreground text-sm">{currentWord.explanation}</p>
                        )}
                        {currentWord.example && (
                          <p className="text-sm italic">Example: {currentWord.example}</p>
                        )}
                        <div className="flex justify-center space-x-2">
                          <Badge variant="outline">{currentWord.level}</Badge>
                          {currentWord.book_title && (
                            <Badge variant="outline">{currentWord.book_title}</Badge>
                          )}
                        </div>
                      </React.Fragment>
                    ) : (
                      <p className="text-3xl font-bold">{currentWord.word}</p>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between">
            <Button variant="outline" onClick={goToPrevCard} disabled={currentIndex === 0}>
              <ArrowLeft className="size-4" />
            </Button>
            
            <div className="flex space-x-2">
              <Button
                variant="destructive"
                size="lg"
                onClick={handleIncorrectAnswer}
                disabled={!isFlipped}
              >
                <X className="mr-2 size-4" />
                نادرست
              </Button>
              <Button
                variant="default"
                size="lg"
                onClick={handleCorrectAnswer}
                disabled={!isFlipped}
              >
                <Check className="mr-2 size-4" />
                درست
              </Button>
            </div>

            <Button
              variant="outline"
              onClick={goToNextCard}
              disabled={currentIndex === shuffledWords.length - 1}
            >
              <ArrowRight className="size-4" />
            </Button>
          </div>

          {studySession && (
            <div className="text-muted-foreground flex justify-between text-sm">
              <div>درست: {sessionStats.correct}</div>
              <div>نادرست: {sessionStats.incorrect}</div>
              <div>کل: {sessionStats.total}</div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
