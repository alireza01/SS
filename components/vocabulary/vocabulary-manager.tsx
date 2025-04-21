"use client"

import { useState, useEffect, useRef } from "react"

import { useVirtualizer } from "@tanstack/react-virtual"
import { Volume2, BookOpen, Check, Clock, RotateCcw } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AdvancedFlashcardSystem } from "@/components/vocabulary/advanced-flashcard-system"
import { createClient } from "@/lib/supabase/client"


interface Word {
  id: string
  word: string
  meaning: string
  status: "learning" | "reviewing" | "mastered"
  next_review_at: string
  book_id: string
  book_title?: string
  level: "beginner" | "intermediate" | "advanced"
}

interface VocabularyManagerProps {
  userId: string
}

export function VocabularyManager({ userId }: VocabularyManagerProps) {
  const [words, setWords] = useState<Word[]>([])
  const [filteredWords, setFilteredWords] = useState<Word[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("all")
  const supabase = createClient()

  const parentRef = useRef<HTMLDivElement>(null)
  const rowVirtualizer = useVirtualizer({
    count: filteredWords.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 180, // estimated height of each card
    overscan: 5,
  })

  // دریافت واژگان کاربر
  useEffect(() => {
    const fetchWords = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("user_words")
          .select(`
            id,
            word,
            meaning,
            status,
            next_review_at,
            book_id,
            books (
              title
            ),
            level
          `)
          .eq("user_id", userId)
          .order("next_review_at", { ascending: true })

        if (error) throw error

        const formattedWords = data.map((item) => ({
          ...item,
          book_title: item.books?.title,
        }))

        setWords(formattedWords)
        setFilteredWords(formattedWords)
      } catch (error) {
        console.error("خطا در دریافت واژگان:", error)
        toast.error("خطا در دریافت واژگان")
      } finally {
        setIsLoading(false)
      }
    }

    fetchWords()
  }, [userId, supabase])

  // پخش تلفظ کلمه
  const playPronunciation = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = "en-US"
      window.speechSynthesis.speak(utterance)
    } else {
      toast.error("مرورگر شما از قابلیت تلفظ پشتیبانی نمی‌کند")
    }
  }

  // تغییر وضعیت کلمه
  const updateWordStatus = async (wordId: string, newStatus: "learning" | "reviewing" | "mastered") => {
    try {
      const { error } = await supabase
        .from("user_words")
        .update({
          status: newStatus,
          next_review_at: new Date(
            Date.now() + (newStatus === "mastered" ? 7 : newStatus === "reviewing" ? 3 : 1) * 24 * 60 * 60 * 1000,
          ).toISOString(),
        })
        .eq("id", wordId)

      if (error) throw error

      // به‌روزرسانی لیست کلمات
      setWords(
        words.map((word) =>
          word.id === wordId
            ? {
                ...word,
                status: newStatus,
                next_review_at: new Date(
                  Date.now() + (newStatus === "mastered" ? 7 : newStatus === "reviewing" ? 3 : 1) * 24 * 60 * 60 * 1000,
                ).toISOString(),
              }
            : word,
        ),
      )

      setFilteredWords(
        words.map((word) =>
          word.id === wordId
            ? {
                ...word,
                status: newStatus,
                next_review_at: new Date(
                  Date.now() + (newStatus === "mastered" ? 7 : newStatus === "reviewing" ? 3 : 1) * 24 * 60 * 60 * 1000,
                ).toISOString(),
              }
            : word,
        ),
      )

      toast.success(
        `وضعیت کلمه به "${newStatus === "mastered" ? "تسلط" : newStatus === "reviewing" ? "مرور" : "یادگیری"}" تغییر یافت`,
      )
    } catch (error) {
      console.error("خطا در به‌روزرسانی وضعیت کلمه:", error)
      toast.error("خطا در به‌روزرسانی وضعیت کلمه")
    }
  }

  // فیلتر کردن کلمات بر اساس وضعیت
  const filteredWords = words.filter((word) => {
    if (activeTab === "all") return true
    return word.status === activeTab
  })

  // تبدیل تاریخ به فرمت فارسی
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  // رنگ وضعیت
  const getStatusColor = (status: string) => {
    switch (status) {
      case "learning":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "reviewing":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      case "mastered":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  // رنگ سطح
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>مدیریت واژگان</CardTitle>
        <CardDescription>کلمات ذخیره شده برای مرور و یادگیری</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all" onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="all">همه ({words.length})</TabsTrigger>
            <TabsTrigger value="learning">
              در حال یادگیری ({words.filter((w) => w.status === "learning").length})
            </TabsTrigger>
            <TabsTrigger value="reviewing">
              در حال مرور ({words.filter((w) => w.status === "reviewing").length})
            </TabsTrigger>
            <TabsTrigger value="mastered">
              تسلط یافته ({words.filter((w) => w.status === "mastered").length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab}>
            {isLoading ? (
              <div className="py-8 text-center">
                <div className="inline-block size-8 animate-spin rounded-full border-b-2 border-gray-900 dark:border-gray-100"></div>
                <p className="text-muted-foreground mt-2 text-sm">در حال بارگذاری واژگان...</p>
              </div>
            ) : filteredWords.length === 0 ? (
              <div className="py-8 text-center">
                <p className="text-muted-foreground">هیچ کلمه‌ای یافت نشد.</p>
                <Button variant="outline" className="mt-4" asChild>
                  <a href="/library">مرور کتاب‌ها و افزودن کلمات جدید</a>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div 
                  ref={parentRef} 
                  className="h-[600px] overflow-auto"
                >
                  <div
                    className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
                    style={{
                      height: `${rowVirtualizer.getTotalSize()}px`,
                      position: "relative",
                    }}
                  >
                    {rowVirtualizer.getVirtualItems().map((virtualItem) => {
                      const word = filteredWords[virtualItem.index]
                      return (
                        <div
                          key={word.id}
                          style={{
                            position: "absolute",
                            top: 0,
                            left: 0,
                            width: "100%",
                            transform: `translateY(${virtualItem.start}px)`,
                          }}
                        >
                          <Card className="overflow-hidden">
                            <CardContent className="p-0">
                              <div className="p-4">
                                <div className="mb-2 flex items-center justify-between">
                                  <h3 className="text-lg font-bold">{word.word}</h3>
                                  <Button variant="ghost" size="icon" onClick={() => playPronunciation(word.word)}>
                                    <Volume2 className="size-4" />
                                    <span className="sr-only">تلفظ</span>
                                  </Button>
                                </div>
                                <p className="mb-3 text-sm">{word.meaning}</p>
                                <div className="mb-3 flex flex-wrap gap-2">
                                  <Badge variant="outline" className={getLevelColor(word.level)}>
                                    {word.level === "beginner"
                                      ? "مبتدی"
                                      : word.level === "intermediate"
                                        ? "متوسط"
                                        : "پیشرفته"}
                                  </Badge>
                                  <Badge variant="outline" className={getStatusColor(word.status)}>
                                    {word.status === "learning"
                                      ? "در حال یادگیری"
                                      : word.status === "reviewing"
                                        ? "در حال مرور"
                                        : "تسلط یافته"}
                                  </Badge>
                                </div>
                                {word.book_title && (
                                  <div className="text-muted-foreground mb-3 flex items-center gap-1 text-xs">
                                    <BookOpen className="size-3" />
                                    <span>{word.book_title}</span>
                                  </div>
                                )}
                                <div className="text-muted-foreground flex items-center gap-1 text-xs">
                                  <Clock className="size-3" />
                                  <span>مرور بعدی: {formatDate(word.next_review_at)}</span>
                                </div>
                              </div>
                              <div className="flex border-t">
                                {word.status !== "learning" && (
                                  <Button
                                    variant="ghost"
                                    className="h-10 flex-1 rounded-none text-blue-600"
                                    onClick={() => updateWordStatus(word.id, "learning")}
                                  >
                                    <RotateCcw className="mr-1 size-4" />
                                    یادگیری
                                  </Button>
                                )}
                                {word.status !== "reviewing" && (
                                  <Button
                                    variant="ghost"
                                    className="h-10 flex-1 rounded-none text-purple-600"
                                    onClick={() => updateWordStatus(word.id, "reviewing")}
                                  >
                                    <Clock className="mr-1 size-4" />
                                    مرور
                                  </Button>
                                )}
                                {word.status !== "mastered" && (
                                  <Button
                                    variant="ghost"
                                    className="h-10 flex-1 rounded-none text-green-600"
                                    onClick={() => updateWordStatus(word.id, "mastered")}
                                  >
                                    <Check className="mr-1 size-4" />
                                    تسلط
                                  </Button>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {words.filter((w) => w.status === "learning" || w.status === "reviewing").length >= 5 && (
                  <div className="mt-8">
                    <AdvancedFlashcardSystem
                      words={words.filter((w) => w.status === "learning" || w.status === "reviewing")}
                    />
                  </div>
                )}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
