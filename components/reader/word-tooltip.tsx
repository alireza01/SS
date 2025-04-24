"use client"

import { useState, useEffect, useCallback } from "react"

import { motion } from "framer-motion"
import { Volume2, Plus, Check, ExternalLink } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"


interface WordTooltipProps {
  word: string
  meaning: string
  explanation: string
  level: string
  position: { x: number; y: number }
  isVisible: boolean
}

export function WordTooltip({ word, meaning, explanation, level, position, isVisible }: WordTooltipProps) {
  const supabase = createClient()
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null)
  const [examples, setExamples] = useState<string[]>([])
  const [showExamples, setShowExamples] = useState(false)

  const fetchExamples = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('examples')
        .select('text')
        .eq('word', word)
        .limit(3)
      
      if (error) throw error
      setExamples(data.map(e => e.text))
    } catch (error) {
      console.error('Error fetching examples:', error)
    }
  }, [supabase, word])

  useEffect(() => {
    if (isVisible && word) {
      fetchExamples()
    }
  }, [isVisible, word, fetchExamples])

  // بررسی وضعیت ذخیره کلمه
  useEffect(() => {
    const checkSavedStatus = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { data } = await supabase
          .from("user_words")
          .select("id")
          .eq("userId", userData.user.id)
          .eq("word", word)
          .maybeSingle()

        setIsSaved(!!data)
      } catch (error) {
        console.error("خطا در بررسی وضعیت کلمه:", error)
      }
    }

    checkSavedStatus()
  }, [supabase, word])

  // پخش تلفظ کلمه
  const playPronunciation = () => {
    if (isPlaying) return

    // استفاده از API تلفظ
    const audioUrl = `https://api.dictionaryapi.dev/media/pronunciations/en/${word.toLowerCase()}.mp3`

    if (!audio) {
      const newAudio = new Audio(audioUrl)
      setAudio(newAudio)

      newAudio.addEventListener("ended", () => {
        setIsPlaying(false)
      })

      newAudio.addEventListener("error", () => {
        setIsPlaying(false)
        toast.error("متأسفانه تلفظ این کلمه در دسترس نیست.")
      })

      newAudio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false)
          toast.error("متأسفانه تلفظ این کلمه در دسترس نیست.")
        })
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          setIsPlaying(false)
          toast.error("متأسفانه تلفظ این کلمه در دسترس نیست.")
        })
    }
  }

  // ذخیره کلمه
  const saveWord = async () => {
    try {
      setIsLoading(true)

      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید.")
        return
      }

      if (isSaved) {
        // حذف کلمه از لیست کلمات ذخیره شده
        const { data } = await supabase
          .from("user_words")
          .select("id")
          .eq("userId", userData.user.id)
          .eq("word", word)
          .single()

        if (data) {
          await supabase.from("user_words").delete().eq("id", data.id)

          setIsSaved(false)
          toast.success(`کلمه "${word}" از لیست کلمات شما حذف شد.`)
        }
      } else {
        // افزودن کلمه به لیست کلمات ذخیره شده
        await supabase.from("user_words").insert({
          userId: userData.user.id,
          word,
          meaning,
          level,
          status: "learning",
          nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // فردا
          createdAt: new Date().toISOString(),
        })

        setIsSaved(true)
        toast.success(`کلمه "${word}" به لیست کلمات شما اضافه شد.`)
      }
    } catch (error) {
      console.error("خطا در ذخیره کلمه:", error)
      toast.error("مشکلی در ذخیره کلمه رخ داد. لطفاً دوباره تلاش کنید.")
    } finally {
      setIsLoading(false)
    }
  }

  // جستجوی کلمه در دیکشنری آنلاین
  const searchOnline = () => {
    window.open(`https://dictionary.cambridge.org/dictionary/english/${encodeURIComponent(word)}`, "_blank")
  }

  // تبدیل سطح کلمه به متن فارسی
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

  // تبدیل سطح کلمه به کلاس CSS
  const getLevelClass = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300"
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300"
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="fixed z-50 min-w-[300px] max-w-[400px] rounded-lg bg-white p-4 shadow-lg dark:bg-gray-900"
      style={{
        left: position.x,
        top: position.y,
      }}
    >
      <div className="mb-4 flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{word}</h3>
          <p className="text-muted-foreground text-sm">{meaning}</p>
        </div>
        <Badge className={getLevelClass(level)}>{getLevelText(level)}</Badge>
      </div>

      <p className="mb-4 text-sm">{explanation}</p>

      {showExamples && (
        <div className="mb-4">
          <h4 className="mb-2 text-sm font-medium">مثال‌ها:</h4>
          <ul className="space-y-2">
            {examples.map((example, index) => (
              <li key={index} className="text-muted-foreground text-sm">
                {example}
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Button size="sm" variant="outline" onClick={playPronunciation} disabled={isPlaying}>
          <Volume2 className="mr-1 size-4" />
          تلفظ
        </Button>

        <Button size="sm" variant="outline" onClick={() => setShowExamples(!showExamples)}>
          {showExamples ? "پنهان کردن مثال‌ها" : "نمایش مثال‌ها"}
        </Button>

        <Button size="sm" variant="outline" onClick={searchOnline}>
          <ExternalLink className="mr-1 size-4" />
          دیکشنری
        </Button>

        <Button size="sm" variant={isSaved ? "secondary" : "default"} onClick={saveWord} disabled={isLoading}>
          {isLoading ? (
            "در حال پردازش..."
          ) : isSaved ? (
            <>
              <Check className="mr-1 size-4" />
              ذخیره شده
            </>
          ) : (
            <>
              <Plus className="mr-1 size-4" />
              ذخیره
            </>
          )}
        </Button>
      </div>
    </motion.div>
  )
}
