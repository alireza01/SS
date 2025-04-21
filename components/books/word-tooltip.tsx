"use client"

import { Volume2, Plus, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent } from "@/components/ui/popover"

export interface Word {
  id: string
  word: string
  meaning: string
  level: "beginner" | "intermediate" | "advanced"
  explanation?: string
  examples?: string[]
}

interface WordTooltipProps {
  word: Word | null
  isWordSaved: boolean
  onClose: () => void
  onPlayPronunciation: (word: string) => void
  onAddToReview: (word: string) => void
  onRemoveFromReview: (word: string) => void
  darkMode: boolean
}

export function WordTooltip({
  word,
  isWordSaved,
  onClose,
  onPlayPronunciation,
  onAddToReview,
  onRemoveFromReview,
  darkMode,
}: WordTooltipProps) {
  // تنظیم رنگ کلمات بر اساس سطح دشواری
  const getWordColor = (level: string) => {
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

  return (
    <Popover open={!!word} onOpenChange={() => onClose()}>
      <PopoverContent
        className={`w-80 p-0 ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}
        align="center"
      >
        {word && (
          <div className="p-4">
            <div className="mb-2 flex items-center justify-between">
              <h3 className="text-lg font-bold">{word.word}</h3>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" onClick={() => onPlayPronunciation(word.word)}>
                  <Volume2 className="size-4" />
                  <span className="sr-only">تلفظ</span>
                </Button>
                {isWordSaved ? (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-green-600"
                    onClick={() => onRemoveFromReview(word.word)}
                  >
                    <Check className="size-4" />
                    <span className="sr-only">حذف از لیست مرور</span>
                  </Button>
                ) : (
                  <Button variant="ghost" size="icon" onClick={() => onAddToReview(word.word)}>
                    <Plus className="size-4" />
                    <span className="sr-only">افزودن به لیست مرور</span>
                  </Button>
                )}
              </div>
            </div>
            <div className={`mb-3 inline-block rounded px-2 py-1 text-xs font-medium ${getWordColor(word.level)}`}>
              {word.level === "beginner" ? "مبتدی" : word.level === "intermediate" ? "متوسط" : "پیشرفته"}
            </div>
            <p className="text-sm">{word.meaning}</p>
            {word.examples && word.examples.length > 0 && (
              <div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-700">
                <h4 className="text-muted-foreground mb-2 text-xs font-medium">مثال‌ها:</h4>
                <ul className="space-y-1 text-xs">
                  {word.examples.map((example, index) => (
                    <li key={index} className="italic">
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
