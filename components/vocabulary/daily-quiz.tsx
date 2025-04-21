"use client"

import { useEffect } from "react"
import { Award, Calendar } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ErrorBoundary } from "@/components/error-boundary"
import { useDailyQuiz } from "@/hooks/use-daily-quiz"
import { QuizCard } from "./quiz-card"
import { QuizResults } from "./quiz-results"

interface DailyQuizProps {
  userId: string
}

function DailyQuizContent({ userId }: DailyQuizProps) {
  const {
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
  } = useDailyQuiz({ userId })

  useEffect(() => {
    checkQuizStatus()
  }, [checkQuizStatus])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="py-8 text-center">
            <div className="inline-block size-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
            <p className="mt-2 text-sm text-muted-foreground">در حال بارگذاری آزمون روزانه...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="py-8 text-center">
            <p className="text-red-600 dark:text-red-400">{error}</p>
            <Button onClick={checkQuizStatus} className="mt-4">
              تلاش مجدد
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!quizAvailable) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>آزمون روزانه</CardTitle>
          <CardDescription>تقویت واژگان با آزمون روزانه</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 py-6 text-center">
            <div className="flex justify-center">
              <div className="flex size-16 items-center justify-center rounded-full bg-gold-100 text-gold-600 dark:bg-gold-900/30 dark:text-gold-400">
                <Calendar className="size-8" />
              </div>
            </div>
            <h3 className="text-xl font-bold">آزمون امروز انجام شده است</h3>
            <p className="text-muted-foreground">فردا دوباره بیایید و استریک خود را حفظ کنید!</p>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Badge
                variant="outline"
                className="border-gold-300 bg-gold-50 text-gold-600 dark:border-gold-800 dark:bg-gold-900/20"
              >
                <Award className="mr-1 size-4" />
                استریک: {streak} روز
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!quizStarted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>آزمون روزانه</CardTitle>
          <CardDescription>تقویت واژگان با آزمون روزانه</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 py-6 text-center">
            <p className="text-muted-foreground">
              با شرکت در آزمون روزانه، واژگان خود را تقویت کنید و استریک خود را حفظ کنید.
            </p>
            <Button onClick={startQuiz}>شروع آزمون</Button>
            <div className="mt-4 flex items-center justify-center gap-2">
              <Badge
                variant="outline"
                className="border-gold-300 bg-gold-50 text-gold-600 dark:border-gold-800 dark:bg-gold-900/20"
              >
                <Award className="mr-1 size-4" />
                استریک: {streak} روز
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (quizCompleted) {
    return (
      <QuizResults
        score={score}
        totalQuestions={questions.length}
        streak={streak}
        onRestart={handleRestart}
      />
    )
  }

  return (
    <QuizCard
      currentQuestion={questions[currentQuestionIndex]}
      currentQuestionIndex={currentQuestionIndex}
      totalQuestions={questions.length}
      selectedOption={selectedOption}
      score={score}
      streak={streak}
      onSelectOption={handleOptionSelect}
    />
  )
}

export function DailyQuiz(props: DailyQuizProps) {
  return (
    <ErrorBoundary
      fallback={
        <Card>
          <CardContent className="p-6">
            <div className="py-8 text-center">
              <p className="text-red-600 dark:text-red-400">خطایی در اجرای آزمون رخ داد.</p>
              <Button onClick={() => window.location.reload()} className="mt-4">
                تلاش مجدد
              </Button>
            </div>
          </CardContent>
        </Card>
      }
    >
      <DailyQuizContent {...props} />
    </ErrorBoundary>
  )
}
