"use client"

import { useState, useEffect } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { ArrowLeft, Settings, Bookmark, BookMarked } from "lucide-react"
import { toast } from "sonner"

import { TextSelectionHandler } from "@/components/books/text-selection-handler"
import { WordTooltip, type Word as TooltipWord } from "@/components/books/word-tooltip"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { saveReadingProgress } from "@/lib/actions/progress-actions"
import { createClient } from "@/lib/supabase/client"

import { InteractiveBook } from "./interactive-book"

interface Book {
  id: string
  title: string
  author: string
  coverImage: string | null
  totalPages: number
  isPremium: boolean
  slug: string
}

interface BookReaderWithFlipProps {
  book: Book
  contents: { page: number; content: string }[]
  currentPage: number
  isPreview?: boolean
  maxPreviewPages?: number
  userProgress?: { currentPage: number; lastReadAt: string } | null
  isLoggedIn: boolean
  interactiveFlipEnabled?: boolean
}

export function BookReaderWithFlip({
  book,
  contents,
  currentPage,
  isPreview = false,
  maxPreviewPages = 5,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  userProgress,
  isLoggedIn,
  interactiveFlipEnabled = true,
}: BookReaderWithFlipProps) {
  const router = useRouter()
  const supabase = createClient()
  const [page, setPage] = useState(currentPage)
  const [showSettings, setShowSettings] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [selectedWord, setSelectedWord] = useState<TooltipWord | null>(null)
  const [isWordSaved, setIsWordSaved] = useState(false)
  const [readingTime, setReadingTime] = useState(0)
  const [readingStartTime] = useState<Date>(new Date())

  // Format content for the interactive book
  const formattedPages = contents.map((content) => ({
    id: `page-${content.page}`,
    content: processPageContent(content.content),
    pageNumber: content.page,
  }))

  // Update reading time
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date()
      const elapsed = Math.floor((now.getTime() - readingStartTime.getTime()) / 1000)
      setReadingTime(elapsed)
    }, 1000)

    return () => clearInterval(timer)
  }, [readingStartTime])

  // Handle page change
  const handlePageChange = (newPage: number) => {
    if (isPreview && newPage > maxPreviewPages) {
      toast.info("برای مطالعه بیشتر، لطفاً کتاب را خریداری کنید")
      return
    }

    setPage(newPage)

    // Update URL
    const params = new URLSearchParams(window.location.search)
    params.set("page", newPage.toString())
    if (isPreview) {
      params.set("preview", "true")
    }
    router.replace(`/books/${book.slug}/read?${params.toString()}`)

    // Save reading progress
    if (isLoggedIn) {
      saveReadingProgress(book.id, newPage, readingTime)
    }
  }

  // Toggle bookmark
  const toggleBookmark = async () => {
    if (!isLoggedIn) {
      toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید")
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      if (isBookmarked) {
        // Remove bookmark
        await supabase
          .from("bookmarks")
          .delete()
          .eq("user_id", userData.user.id)
          .eq("book_id", book.id)
          .eq("page", page)
        setIsBookmarked(false)
        toast.success("نشانک حذف شد")
      } else {
        // Add bookmark
        await supabase.from("bookmarks").insert({
          user_id: userData.user.id,
          book_id: book.id,
          page: page,
          created_at: new Date().toISOString(),
        })
        setIsBookmarked(true)
        toast.success("نشانک اضافه شد")
      }
    } catch (error) {
      console.error("خطا در تغییر وضعیت نشانک:", error)
      toast.error("خطا در تغییر وضعیت نشانک")
    }
  }

  // Process page content to highlight difficult words
  function processPageContent(content: string): string {
    // Remove any existing HTML tags for safety
    const sanitizedContent = content.replace(/<[^>]*>/g, '')
    
    // Split content into words while preserving punctuation and spacing
    const words = sanitizedContent.split(/(\s+)/)
    
    // Process each word
    const processedWords = words.map(word => {
      // Skip whitespace
      if (/^\s+$/.test(word)) return word
      
      // Add data attributes for interactive features
      return `<span class="interactive-word" data-word="${word.trim()}">${word}</span>`
    })
    
    return processedWords.join('')
  }

  // Handle text selection for translation
  const handleTranslateSelection = (_text: string) => {
    toast.success("متن انتخاب شده برای ترجمه ارسال شد")
  }

  return (
    <div className="container mx-auto py-4">
      <style jsx global>{`
        .interactive-word {
          cursor: pointer;
          transition: background-color 0.2s ease;
        }
        
        .interactive-word:hover {
          background-color: rgba(59, 130, 246, 0.1);
          border-radius: 2px;
        }
        
        .interactive-word.highlighted {
          background-color: rgba(59, 130, 246, 0.2);
          border-radius: 2px;
        }
      `}</style>
      {/* Top navigation */}
      <div className="mb-4 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild>
          <Link href={`/books/${book.slug}`}>
            <ArrowLeft className="ml-1 size-4" />
            بازگشت به صفحه کتاب
          </Link>
        </Button>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleBookmark}>
            {isBookmarked ? <BookMarked className="text-gold-500 size-5" /> : <Bookmark className="size-5" />}
            <span className="sr-only">نشانک</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
            <Settings className="size-5" />
            <span className="sr-only">تنظیمات</span>
          </Button>
        </div>
      </div>

      {/* Preview warning */}
      {isPreview && (
        <Card className="bg-gold-50 dark:bg-gold-900/20 border-gold-200 dark:border-gold-800 mb-4">
          <div className="p-4 text-center">
            <p className="font-medium">حالت پیش‌نمایش</p>
            <p className="text-muted-foreground text-sm">
              شما در حال مشاهده پیش‌نمایش این کتاب هستید. برای مطالعه کامل، لطفاً کتاب را خریداری کنید.
            </p>
            <Button className="mt-2" asChild>
              <Link href={`/books/${book.slug}`}>خرید کتاب</Link>
            </Button>
          </div>
        </Card>
      )}

      {/* Interactive book */}
      <div className="relative">
        <InteractiveBook
          pages={formattedPages}
          initialPage={page}
          onPageChange={handlePageChange}
          className="h-[70vh] md:h-[80vh]"
          interactiveFlipEnabled={interactiveFlipEnabled}
        />

        {/* Text selection handler */}
        <TextSelectionHandler
          onTranslate={handleTranslateSelection}
          onHighlight={(_text) => {
            /* Handle highlight functionality when needed */
          }}
          onCopy={(text) => {
            navigator.clipboard.writeText(text)
            toast.success("متن کپی شد")
          }}
        />
      </div>

      {/* Word tooltip */}
      <WordTooltip
        word={selectedWord}
        isWordSaved={isWordSaved}
        onClose={() => setSelectedWord(null)}
        onPlayPronunciation={(word) => {
          if ("speechSynthesis" in window) {
            const utterance = new SpeechSynthesisUtterance(word)
            utterance.lang = "en-US"
            window.speechSynthesis.speak(utterance)
          }
        }}
        onAddToReview={() => {
          setIsWordSaved(true)
          toast.success("کلمه به لیست مرور اضافه شد")
        }}
        onRemoveFromReview={() => {
          setIsWordSaved(false)
          toast.success("کلمه از لیست مرور حذف شد")
        }}
        darkMode={false}
      />
    </div>
  )
}
