"use client"

import { useState, useEffect } from "react"

import { BookOpen, Brain, Sparkles, Loader2, Check } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { analyzeText } from "@/lib/gemini"
import { createClient } from "@/lib/supabase/client"


interface TextAnalyzerProps {
  text: string
  bookTitle: string
  author: string
  userLevel: string
}

export function TextAnalyzer({ text, bookTitle, author, userLevel }: TextAnalyzerProps) {
  const [keywords, setKeywords] = useState<{ word: string; level: string }[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userWords, setUserWords] = useState<{ word: string; status: string }[]>([])
  const [stats, setStats] = useState({
    beginner: 0,
    intermediate: 0,
    advanced: 0,
    total: 0,
    known: 0,
  })
  const supabase = createClient()

  // دریافت کلمات ذخیره شده کاربر
  useEffect(() => {
    const fetchUserWords = async () => {
      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { data, error } = await supabase.from("user_words").select("word, status").eq("user_id", userData.user.id)

        if (error) throw error

        setUserWords(data || [])
      } catch (error) {
        console.error("خطا در دریافت کلمات کاربر:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchUserWords()
  }, [supabase])

  // تحلیل متن و استخراج کلمات کلیدی
  const handleAnalyzeText = async () => {
    if (!text.trim()) {
      toast.error("متنی برای تحلیل وجود ندارد")
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzeText(text)
      setKeywords(result)

      // محاسبه آمار
      const beginner = result.filter((k: { level: string }) => k.level === "beginner").length
      const intermediate = result.filter((k: { level: string }) => k.level === "intermediate").length
      const advanced = result.filter((k: { level: string }) => k.level === "advanced").length
      const total = result.length
      const known = result.filter((k: { word: string }) => userWords.some((w) => w.word === k.word)).length

      setStats({
        beginner,
        intermediate,
        advanced,
        total,
        known,
      })
    } catch (error) {
      console.error("خطا در تحلیل متن:", error)
      toast.error("خطا در تحلیل متن")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // تنظیم رنگ سطح دشواری
  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  // ذخیره کلمه در لیست کاربر
  const saveWord = async (word: string, level: string) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید")
        return
      }

      // بررسی وجود کلمه در لیست کاربر
      const exists = userWords.some((w) => w.word === word)
      if (exists) {
        toast.info("این کلمه قبلاً در لیست شما وجود دارد")
        return
      }

      // افزودن کلمه به لیست کاربر
      const { error } = await supabase.from("user_words").insert({
        user_id: userData.user.id,
        word,
        meaning: "",
        status: "learning",
        level,
        next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      if (error) throw error

      // به‌روزرسانی لیست کلمات کاربر
      setUserWords([...userWords, { word, status: "learning" }])
      toast.success("کلمه به لیست شما اضافه شد")
    } catch (error) {
      console.error("خطا در ذخیره کلمه:", error)
      toast.error("خطا در ذخیره کلمه")
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تحلیل متن</CardTitle>
        <CardDescription>
          کتاب: {bookTitle} - نویسنده: {author}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-4 text-center">
            <Loader2 className="mx-auto mb-2 size-8 animate-spin" />
            <p className="text-muted-foreground text-sm">در حال بارگذاری...</p>
          </div>
        ) : (
          <div className="space-y-4">
            {keywords.length === 0 ? (
              <div className="py-4 text-center">
                <Button onClick={handleAnalyzeText} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      در حال تحلیل...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      تحلیل متن صفحه
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                          <BookOpen className="size-5" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">کلمات کلیدی</p>
                          <p className="text-xl font-bold">{stats.total}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="flex size-10 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                          <Brain className="size-5" />
                        </div>
                        <div>
                          <p className="text-muted-foreground text-sm">کلمات آشنا</p>
                          <p className="text-xl font-bold">
                            {stats.known} ({Math.round((stats.known / stats.total) * 100)}%)
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-green-500" />
                      <span className="text-sm">مبتدی</span>
                    </div>
                    <span className="text-sm">{stats.beginner}</span>
                  </div>
                  <Progress value={(stats.beginner / stats.total) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-blue-500" />
                      <span className="text-sm">متوسط</span>
                    </div>
                    <span className="text-sm">{stats.intermediate}</span>
                  </div>
                  <Progress value={(stats.intermediate / stats.total) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="size-3 rounded-full bg-purple-500" />
                      <span className="text-sm">پیشرفته</span>
                    </div>
                    <span className="text-sm">{stats.advanced}</span>
                  </div>
                  <Progress value={(stats.advanced / stats.total) * 100} className="h-2" />
                </div>

                <div className="mt-4">
                  <h3 className="mb-2 text-sm font-medium">کلمات کلیدی:</h3>
                  <div className="flex flex-wrap gap-2">
                    {keywords.map((keyword, index) => {
                      const isInUserList = userWords.some((w) => w.word === keyword.word)
                      return (
                        <Badge
                          key={index}
                          variant="outline"
                          className={`${getLevelColor(keyword.level)} cursor-pointer ${isInUserList ? "border-2" : ""}`}
                          onClick={() => !isInUserList && saveWord(keyword.word, keyword.level)}
                        >
                          {keyword.word}
                          {isInUserList && <Check className="ml-1 size-3" />}
                        </Badge>
                      )
                    })}
                  </div>
                  <p className="text-muted-foreground mt-2 text-xs">
                    برای افزودن کلمه به لیست مرور خود، روی آن کلیک کنید
                  </p>
                </div>

                <Button onClick={handleAnalyzeText} disabled={isAnalyzing} variant="outline" className="w-full">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      در حال تحلیل مجدد...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 size-4" />
                      تحلیل مجدد
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
