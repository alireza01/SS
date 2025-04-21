"use client"

import { Award, RotateCw } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface QuizResultsProps {
  score: number
  totalQuestions: number
  streak: number
  onRestart: () => void
}

export function QuizResults({ score, totalQuestions, streak, onRestart }: QuizResultsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>نتیجه آزمون</CardTitle>
        <CardDescription>عملکرد شما در آزمون روزانه</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6 py-6 text-center">
          <div className="flex justify-center">
            <div className="flex size-20 items-center justify-center rounded-full bg-gold-100 text-gold-600 dark:bg-gold-900/30 dark:text-gold-400">
              <Award className="size-10" />
            </div>
          </div>
          <h3 className="text-2xl font-bold">
            {score} از {totalQuestions} پاسخ صحیح
          </h3>
          <Progress
            value={(score / totalQuestions) * 100}
            className="mx-auto h-2 w-full max-w-md"
          />
          <p className="text-muted-foreground">
            {score >= 4
              ? "عالی! تسلط شما بر واژگان قابل تحسین است."
              : score >= 3
              ? "خوب! به تمرین بیشتر ادامه دهید."
              : "نیاز به تمرین بیشتر دارید. ادامه دهید!"}
          </p>
          <div className="mt-4 flex items-center justify-center gap-2">
            <Badge
              variant="outline"
              className="border-gold-300 bg-gold-50 text-gold-600 dark:border-gold-800 dark:bg-gold-900/20"
            >
              <Award className="mr-1 size-4" />
              استریک: {streak} روز
            </Badge>
          </div>
          <Button variant="outline" onClick={onRestart}>
            <RotateCw className="mr-1 size-4" />
            بازگشت
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 