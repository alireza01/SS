import { useState, useCallback } from "react"

import { toast } from "sonner"

import { createClient } from "@/lib/supabase/client"
import type { Question } from "@/types"

interface UseDailyQuizProps {
  userId: string
}

interface UseDailyQuizReturn {
  questions: Question[]
  currentQuestionIndex: number
  selectedOption: string | null
  score: number
  quizStarted: boolean
  quizCompleted: boolean
  isLoading: boolean
  quizAvailable: boolean
  streak: number
  error: string | null
  checkQuizStatus: () => Promise<void>
  handleOptionSelect: (option: string) => void
  handleRestart: () => void
  startQuiz: () => void
}

export function useDailyQuiz({ userId }: UseDailyQuizProps): UseDailyQuizReturn {
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [selectedOption, setSelectedOption] = useState<string | null>(null)
  const [score, setScore] = useState(0)
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizCompleted, setQuizCompleted] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [quizAvailable, setQuizAvailable] = useState(true)
  const [streak, setStreak] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  const generateQuiz = async () => {
    try {
      const { data: userWords, error: wordsError } = await supabase
        .from("user_words")
        .select("id, word, meaning")
        .eq("user_id", userId)
        .in("status", ["learning", "reviewing"])
        .order("next_review_at", { ascending: true })
        .limit(20)

      if (wordsError) throw wordsError

      if (!userWords || userWords.length < 5) {
        setQuizAvailable(false)
        toast.error("کلمات کافی برای ایجاد آزمون وجود ندارد")
        return
      }

      const shuffledWords = [...userWords].sort(() => Math.random() - 0.5).slice(0, 5)
      const quizQuestions = shuffledWords.map((word) => {
        const incorrectOptions = userWords
          .filter((w) => w.id !== word.id)
          .sort(() => Math.random() - 0.5)
          .slice(0, 3)
          .map((w) => w.meaning)

        return {
          id: word.id,
          word: word.word,
          correctAnswer: word.meaning,
          options: [...incorrectOptions, word.meaning].sort(() => Math.random() - 0.5),
        }
      })

      setQuestions(quizQuestions)
      setQuizAvailable(true)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطا در ایجاد آزمون"
      setError(errorMessage)
      toast.error(errorMessage)
      setQuizAvailable(false)
    }
  }

  const checkQuizStatus = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      const { data: quizHistory, error: historyError } = await supabase
        .from("quiz_history")
        .select("*")
        .eq("user_id", userId)
        .gte("completed_at", today.toISOString())
        .limit(1)

      if (historyError) throw historyError

      if (quizHistory && quizHistory.length > 0) {
        setQuizAvailable(false)
        setStreak(quizHistory[0].streak || 0)
        return
      }

      const { data: userStats, error: statsError } = await supabase
        .from("user_stats")
        .select("quizStreak")
        .eq("userId", userId)
        .single()

      if (statsError && statsError.code !== "PGRST116") throw statsError

      setStreak(userStats?.quizStreak || 0)
      await generateQuiz()
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطا در بارگذاری آزمون روزانه"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [userId, supabase])

  const completeQuiz = async () => {
    setQuizCompleted(true)
    try {
      let newStreak = streak
      if (score >= 3) {
        newStreak += 1
      } else {
        newStreak = 0
      }

      const { error: quizError } = await supabase.from("quiz_history").insert({
        user_id: userId,
        score,
        total_questions: questions.length,
        completed_at: new Date().toISOString(),
        streak: newStreak,
      })

      if (quizError) throw quizError

      const { error: statsError } = await supabase
        .from("user_stats")
        .update({ quizStreak: newStreak })
        .eq("userId", userId)

      if (statsError) throw statsError

      setStreak(newStreak)
      toast.success("آزمون روزانه با موفقیت ثبت شد")
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "خطا در ثبت نتیجه آزمون"
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleOptionSelect = (option: string) => {
    if (selectedOption !== null) return

    setSelectedOption(option)
    const correct = option === questions[currentQuestionIndex].correctAnswer
    if (correct) setScore(score + 1)

    setTimeout(() => {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
        setSelectedOption(null)
      } else {
        completeQuiz()
      }
    }, 1500)
  }

  const handleRestart = () => {
    setQuizStarted(false)
    setQuizCompleted(false)
    setQuizAvailable(false)
  }

  const startQuiz = () => {
    setQuizStarted(true)
    setCurrentQuestionIndex(0)
    setScore(0)
    setSelectedOption(null)
    setQuizCompleted(false)
  }

  return {
    questions,
    currentQuestionIndex,
    selectedOption,
    score,
    quizStarted,
    quizCompleted,
    isLoading,
    quizAvailable,
    streak,
    error,
    checkQuizStatus,
    handleOptionSelect,
    handleRestart,
    startQuiz,
  }
} 