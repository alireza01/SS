"use client"

import { useState, useEffect, useRef } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Settings,
  Bookmark,
  BookOpen,
  ArrowLeft,
  Moon,
  Sun,
  Type,
  AlignJustify,
  ImportIcon as Translate,
  BookMarked,
  X,
} from "lucide-react"
import { toast } from "sonner"

import { TextSelectionHandler } from "@/components/books/text-selection-handler"
import { WordTooltip } from "@/components/books/word-tooltip"
import { AdvancedProgressBar } from "@/components/reader/advanced-progress-bar"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { saveReadingProgress } from "@/lib/actions/progress-actions"
import { translateText } from "@/lib/gemini"
import { createClient } from "@/lib/supabase/client"


interface Book {
  id: string
  title: string
  author: string
  coverImage: string
  totalPages: number
  content: {
    page: number
    text: string
  }[]
  slug: string
}

interface Word {
  id: string
  word: string
  meaning: string
  level: "beginner" | "intermediate" | "advanced"
  examples?: string[]
}

interface UserProgress {
  current_page: number
  last_read_at: string
  bookmarks?: number[]
}

interface SavedWord {
  id: string
  word: string
  status: "learning" | "reviewing" | "mastered"
  next_review_at: string
}

interface BookReaderProps {
  book: Book
  words: Word[]
  currentPage: number
  isPreview: boolean
  maxPreviewPages: number
  userProgress: UserProgress | null
  savedWords: SavedWord[]
}

export function BookReader({
  book,
  words,
  currentPage,
  isPreview,
  maxPreviewPages,
  userProgress,
  savedWords,
}: BookReaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const contentRef = useRef<HTMLDivElement>(null)
  const [page, setPage] = useState(currentPage)
  const [showSettings, setShowSettings] = useState(false)
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(1.8)
  const [darkMode, setDarkMode] = useState(false)
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [userSavedWords, setUserSavedWords] = useState<SavedWord[]>(savedWords)
  const [isWordSaved, setIsWordSaved] = useState(false)
  const [showPreviewMessage, setShowPreviewMessage] = useState(isPreview && page === maxPreviewPages)
  const [bookmarks, setBookmarks] = useState<number[]>(userProgress?.bookmarks || [])
  const [isCurrentPageBookmarked, setIsCurrentPageBookmarked] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [translation, setTranslation] = useState("")
  const [isTranslating, setIsTranslating] = useState(false)
  const [readingTime, setReadingTime] = useState(0)
  const [readingTimer, setReadingTimer] = useState<NodeJS.Timeout | null>(null)
  const [readingStartTime, setReadingStartTime] = useState<Date | null>(null)

  // تنظیم صفحه جاری
  useEffect(() => {
    setPage(currentPage)
  }, [currentPage])

  // بررسی وضعیت ذخیره کلمه انتخاب شده
  useEffect(() => {
    if (selectedWord) {
      const isSaved = userSavedWords.some((saved) => saved.word === selectedWord.word)
      setIsWordSaved(isSaved)
    } else {
      setIsWordSaved(false)
    }
  }, [selectedWord, userSavedWords])

  // بررسی وضعیت بوکمارک صفحه جاری
  useEffect(() => {
    setIsCurrentPageBookmarked(bookmarks.includes(page))
  }, [bookmarks, page])

  // به‌روزرسانی URL با تغییر صفحه
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    params.set("page", page.toString())
    if (isPreview) {
      params.set("preview", "true")
    }
    router.replace(`/books/${book.slug}/read?${params.toString()}`)

    // ذخیره پیشرفت مطالعه کاربر
    saveReadingProgress(book.id, page, readingTime)
  }, [page, router, book.id, isPreview, readingTime])

  // شروع تایمر مطالعه
  useEffect(() => {
    if (!readingStartTime) {
      setReadingStartTime(new Date())
    }

    const timer = setInterval(() => {
      if (readingStartTime) {
        const now = new Date()
        const elapsed = Math.floor((now.getTime() - readingStartTime.getTime()) / 1000)
        setReadingTime(elapsed)
      }
    }, 1000)

    setReadingTimer(timer)

    return () => {
      if (readingTimer) {
        clearInterval(readingTimer)
      }
    }
  }, [readingStartTime])

  // ذخیره بوکمارک‌ها
  const saveBookmarks = async () => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (session) {
        await supabase
          .from("reading_progress")
          .update({
            bookmarks: bookmarks,
          })
          .eq("user_id", session.user.id)
          .eq("book_id", book.id)

        toast.success("بوکمارک‌ها ذخیره شدند")
      }
    } catch (error) {
      console.error("خطا در ذخیره بوکمارک‌ها:", error)
      toast.error("خطا در ذخیره بوکمارک‌ها")
    }
  }

  // رفتن به صفحه قبل
  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1)
      setShowPreviewMessage(isPreview && page - 1 === maxPreviewPages)
    }
  }

  // رفتن به صفحه بعد
  const goToNextPage = () => {
    if (page < book.totalPages) {
      if (isPreview && page >= maxPreviewPages) {
        setShowPreviewMessage(true)
      } else {
        setPage(page + 1)
        setShowPreviewMessage(isPreview && page + 1 === maxPreviewPages)
      }
    }
  }

  // کلیک روی کلمه
  const handleWordClick = (word: string) => {
    const wordData = words.find((w) => w.word.toLowerCase() === word.toLowerCase())
    if (wordData) {
      setSelectedWord(wordData)
    }
  }

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

  // افزودن کلمه به لیست مرور
  const addWordToReview = async (word: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید")
        return
      }

      const newSavedWord = {
        id: crypto.randomUUID(),
        word: word,
        status: "learning" as const,
        next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // فردا
      }

      const { error } = await supabase.from("user_words").insert({
        user_id: session.user.id,
        book_id: book.id,
        word: word,
        status: "learning",
        next_review_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      })

      if (error) throw error

      // به‌روزرسانی لیست کلمات ذخیره شده در حافظه
      setUserSavedWords((prev) => {
        // اگر کلمه قبلاً ذخیره شده، آن را به‌روزرسانی می‌کنیم
        const exists = prev.some((saved) => saved.word === word)
        if (exists) {
          return prev.map((saved) => (saved.word === word ? newSavedWord : saved))
        }
        // در غیر این صورت، کلمه جدید را اضافه می‌کنیم
        return [...prev, newSavedWord]
      })

      setIsWordSaved(true)
      toast.success("کلمه به لیست مرور شما اضافه شد")
    } catch (error) {
      console.error("خطا در افزودن کلمه به لیست مرور:", error)
      toast.error("خطا در افزودن کلمه به لیست مرور")
    }
  }

  // حذف کلمه از لیست مرور
  const removeWordFromReview = async (word: string) => {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession()

      if (!session) {
        toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید")
        return
      }

      const { error } = await supabase
        .from("user_words")
        .delete()
        .eq("user_id", session.user.id)
        .eq("book_id", book.id)
        .eq("word", word)

      if (error) throw error

      // به‌روزرسانی لیست کلمات ذخیره شده در حافظه
      setUserSavedWords((prev) => prev.filter((saved) => saved.word !== word))
      setIsWordSaved(false)
      toast.success("کلمه از لیست مرور شما حذف شد")
    } catch (error) {
      console.error("خطا در حذف کلمه از لیست مرور:", error)
      toast.error("خطا در حذف کلمه از لیست مرور")
    }
  }

  // افزودن یا حذف بوکمارک
  const toggleBookmark = () => {
    if (isCurrentPageBookmarked) {
      // حذف بوکمارک
      setBookmarks(bookmarks.filter((b) => b !== page))
      toast.success("بوکمارک حذف شد")
    } else {
      // افزودن بوکمارک
      setBookmarks([...bookmarks, page])
      toast.success("بوکمارک اضافه شد")
    }
    // ذخیره بوکمارک‌ها در دیتابیس
    saveBookmarks()
  }

  // ترجمه متن انتخاب شده
  const handleTranslateSelection = async (text: string) => {
    if (!text || text.trim() === "") return

    setSelectedText(text)
    setIsTranslating(true)

    try {
      const result = await translateText(text, "fa")
      setTranslation(result)
    } catch (error) {
      console.error("خطا در ترجمه متن:", error)
      toast.error("خطا در ترجمه متن")
      setTranslation("")
    } finally {
      setIsTranslating(false)
    }
  }

  // پردازش متن صفحه و هایلایت کردن کلمات
  const processPageContent = () => {
    const pageContent = book.content.find((c) => c.page === page)
    if (!pageContent) return ""

    let processedText = pageContent.text

    // هایلایت کردن کلمات دشوار
    words.forEach((word) => {
      const regex = new RegExp(`\\b${word.word}\\b`, "gi")
      let colorClass = ""

      switch (word.level) {
        case "beginner":
          colorClass = "word-beginner"
          break
        case "intermediate":
          colorClass = "word-intermediate"
          break
        case "advanced":
          colorClass = "word-advanced"
          break
      }

      processedText = processedText.replace(
        regex,
        `<span class="word ${colorClass}" data-word="${word.word}">$&</span>`,
      )
    })

    return processedText
  }

  // تنظیم رنگ پس‌زمینه بر اساس حالت تاریک/روشن
  const getBackgroundColor = () => {
    return darkMode ? "bg-gray-900 text-white" : "bg-white text-gray-900"
  }

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

  // تبدیل ثانیه به فرمت زمان
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    return `${hours > 0 ? `${hours}:` : ""}${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  return (
    <div className={`min-h-screen ${darkMode ? "bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}>
      {/* نوار بالای صفحه */}
      <div
        className={`sticky top-0 z-10 border-b ${darkMode ? "border-gray-700 bg-gray-800" : "border-gray-200 bg-white"}`}
      >
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href={`/books/${book.slug}`}>
                <ArrowLeft className="size-5" />
                <span className="sr-only">بازگشت</span>
              </Link>
            </Button>
            <div>
              <h1 className="line-clamp-1 text-lg font-bold">{book.title}</h1>
              <p className="text-muted-foreground text-sm">{book.author}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {isPreview && (
              <Button size="sm" asChild>
                <Link href={`/books/${book.slug}`}>خرید کتاب</Link>
              </Button>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
                    <Settings className="size-5" />
                    <span className="sr-only">تنظیمات</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>تنظیمات مطالعه</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="icon" onClick={toggleBookmark}>
                    {isCurrentPageBookmarked ? (
                      <BookMarked className="text-gold-500 size-5" />
                    ) : (
                      <Bookmark className="size-5" />
                    )}
                    <span className="sr-only">بوکمارک</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>{isCurrentPageBookmarked ? "حذف بوکمارک" : "افزودن بوکمارک"}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>

      {/* پیام پیش‌نمایش */}
      <AnimatePresence>
        {showPreviewMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container my-4"
          >
            <Card className="border-gold-200 dark:border-gold-800 bg-gold-50 dark:bg-gold-900/20">
              <CardContent className="flex items-center gap-4 p-4">
                <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-10 shrink-0 items-center justify-center rounded-full">
                  <BookOpen className="size-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold">پیش‌نمایش به پایان رسید</h3>
                  <p className="text-muted-foreground text-sm">
                    برای ادامه مطالعه، لطفاً کتاب را خریداری کنید یا وارد حساب کاربری خود شوید.
                  </p>
                </div>
                <Button asChild>
                  <Link href={`/books/${book.slug}`}>خرید کتاب</Link>
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* تنظیمات مطالعه */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="container my-4"
          >
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium">اندازه متن</label>
                      <span className="text-muted-foreground text-sm">{fontSize}px</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Type className="text-muted-foreground size-4" />
                      <Slider
                        value={[fontSize]}
                        min={14}
                        max={24}
                        step={1}
                        onValueChange={(value: number[]) => setFontSize(value[0])}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium">فاصله خطوط</label>
                      <span className="text-muted-foreground text-sm">{lineHeight}x</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlignJustify className="text-muted-foreground size-4" />
                      <Slider
                        value={[lineHeight * 10]}
                        min={10}
                        max={30}
                        step={1}
                        onValueChange={(value: number[]) => setLineHeight(value[0] / 10)}
                        className="flex-1"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-medium">حالت نمایش</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant={darkMode ? "outline" : "default"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setDarkMode(false)}
                      >
                        <Sun className="mr-2 size-4" />
                        روشن
                      </Button>
                      <Button
                        variant={darkMode ? "default" : "outline"}
                        size="sm"
                        className="flex-1"
                        onClick={() => setDarkMode(true)}
                      >
                        <Moon className="mr-2 size-4" />
                        تاریک
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* محتوای کتاب */}
      <div className="container py-8">
        <div className="mx-auto max-w-3xl">
          <div className="mb-4 flex items-center justify-between">
            <div className="text-muted-foreground text-sm">زمان مطالعه: {formatTime(readingTime)}</div>
            <div className="flex items-center gap-2">
              <AdvancedProgressBar
                currentPage={page}
                totalPages={book.totalPages}
                bookmarks={bookmarks}
                onPageSelect={setPage}
              />
            </div>
          </div>

          <div
            ref={contentRef}
            className={`prose prose-lg max-w-none ${getBackgroundColor()} rounded-lg p-8 shadow-md`}
            style={{ fontSize: `${fontSize}px`, lineHeight: lineHeight }}
          >
            <div
              dangerouslySetInnerHTML={{ __html: processPageContent() }}
              onClick={(e) => {
                const target = e.target as HTMLElement
                if (target.classList.contains("word")) {
                  const word = target.getAttribute("data-word")
                  if (word) {
                    handleWordClick(word)
                  }
                }
              }}
            />
            <TextSelectionHandler
              onTranslate={handleTranslateSelection}
              onHighlight={(text) => console.log("هایلایت:", text)}
              onCopy={(text) => {
                navigator.clipboard.writeText(text)
                toast.success("متن کپی شد")
              }}
            />
          </div>

          {/* نمایش ترجمه */}
          <AnimatePresence>
            {translation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="mt-4"
              >
                <Card className="bg-gold-50 dark:bg-gold-900/20 border-gold-200 dark:border-gold-800">
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Translate className="text-gold-600 size-4" />
                        <h3 className="text-sm font-medium">ترجمه</h3>
                      </div>
                      <Button variant="ghost" size="sm" className="size-6 p-0" onClick={() => setTranslation("")}>
                        <span className="sr-only">بستن</span>
                        <X className="size-4" />
                      </Button>
                    </div>
                    <div className="text-sm">
                      <p className="text-muted-foreground mb-2 text-xs">{selectedText}</p>
                      <p className="font-medium">{translation}</p>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* کنترل‌های صفحه */}
          <div className="mt-6 flex items-center justify-between">
            <Button
              variant="outline"
              onClick={goToPreviousPage}
              disabled={page <= 1}
              className={darkMode ? "bg-gray-800 hover:bg-gray-700" : ""}
            >
              <ChevronRight className="ml-2 size-4" />
              صفحه قبل
            </Button>
            <div className="text-center">
              <span className="text-muted-foreground text-sm">
                صفحه {page} از {book.totalPages}
              </span>
            </div>
            <Button
              variant="outline"
              onClick={goToNextPage}
              disabled={isPreview && page >= maxPreviewPages}
              className={darkMode ? "bg-gray-800 hover:bg-gray-700" : ""}
            >
              صفحه بعد
              <ChevronLeft className="mr-2 size-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* پاپ‌آور معنی کلمه */}
      <WordTooltip
        word={selectedWord}
        isWordSaved={isWordSaved}
        onClose={() => setSelectedWord(null)}
        onPlayPronunciation={playPronunciation}
        onAddToReview={addWordToReview}
        onRemoveFromReview={removeWordFromReview}
        darkMode={darkMode}
      />

      <style jsx global>{`
        .word {
          cursor: pointer;
          position: relative;
        }
        
        .word-beginner {
          border-bottom: 2px solid rgba(74, 222, 128, 0.8);
        }
        
        .word-intermediate {
          border-bottom: 2px solid rgba(59, 130, 246, 0.8);
        }
        
        .word-advanced {
          border-bottom: 2px solid rgba(168, 85, 247, 0.8);
        }
        
        .word:hover {
          background-color: rgba(209, 213, 219, 0.2);
        }
      `}</style>
    </div>
  )
}
