"use client"

import { motion } from "framer-motion"
import { Check, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

interface QuizCardProps {
  currentQuestion: {
    word: string
    options: string[]
    correctAnswer: string
  }
  currentQuestionIndex: number
  totalQuestions: number
  selectedOption: string | null
  score: number
  streak: number
  onSelectOption: (option: string) => void
}

export function QuizCard({
  currentQuestion,
  currentQuestionIndex,
  totalQuestions,
  selectedOption,
  score,
  streak,
  onSelectOption,
}: QuizCardProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">آزمون روزانه</h2>
            <p className="text-muted-foreground text-sm">معنی کلمه را انتخاب کنید</p>
          </div>
          <div className="text-muted-foreground text-sm">
            {currentQuestionIndex + 1} از {totalQuestions}
          </div>
        </div>
        <Progress
          value={((currentQuestionIndex + 1) / totalQuestions) * 100}
          className="h-2"
        />
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div className="py-4 text-center">
            <h3 className="mb-2 text-2xl font-bold">{currentQuestion.word}</h3>
            <p className="text-muted-foreground text-sm">معنی این کلمه چیست؟</p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {currentQuestion.options.map((option) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <Button
                  variant="outline"
                  className={`h-auto w-full justify-start px-4 py-6 text-right ${
                    selectedOption === option
                      ? option === currentQuestion.correctAnswer
                        ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                        : "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                      : ""
                  }`}
                  onClick={() => onSelectOption(option)}
                  disabled={selectedOption !== null}
                >
                  <span className="flex-1">{option}</span>
                  {selectedOption === option && (
                    <span className="ml-2">
                      {option === currentQuestion.correctAnswer ? (
                        <Check className="size-5 text-green-600" />
                      ) : (
                        <X className="size-5 text-red-600" />
                      )}
                    </span>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>

          <div className="text-muted-foreground flex items-center justify-between pt-4 text-sm">
            <div>امتیاز: {score}</div>
            <div>استریک: {streak} روز</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 