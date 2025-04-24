"use client"

import { useState } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { ArrowLeft, Bookmark, BookMarked, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { toast } from "@/components/ui/use-toast"
import { usePageFlipSettings } from "@/lib/hooks/use-page-flip-settings"
import { createClient } from "@/lib/supabase/client"

import { TextSelectionHandler } from "../text-selection-handler"
import { InteractiveBook } from "./interactive-book"

interface Book {
  id: string
  slug: string
  title: string
}

interface BookReaderWithFlipProps {
  book: Book
  contents: { page: number; content: string }[]
  currentPage: number
  isPreview?: boolean
  maxPreviewPages?: number
  userProgress?: { currentPage: number; lastReadAt: string } | null
  isLoggedIn: boolean
  userId?: string
  interactiveFlipEnabled?: boolean
}

export function BookReaderWithFlip({
  book,
  contents,
  currentPage,
  isPreview = false,
  maxPreviewPages = 5,
  userProgress,
  isLoggedIn,
  userId,
  interactiveFlipEnabled,
}: BookReaderWithFlipProps) {
  const router = useRouter()
  const [page, setPage] = useState(currentPage)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const supabase = createClient()
  const { settings } = usePageFlipSettings(userId)

  // Format pages for the interactive book component
  const formattedPages = contents.map((content) => ({
    id: `page-${content.page}`,
    content: processPageContent(content.content),
    pageNumber: content.page,
  }))

  // Handle page change
  const handlePageChange = async (newPage: number) => {
    setPage(newPage)

    // Update URL without reloading
    const url = new URL(window.location.href)
    url.searchParams.set("page", newPage.toString())
    router.replace(url.pathname + url.search)

    if (!isLoggedIn) return

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      // Update reading progress
      await supabase.from("reading_progress").upsert({
        user_id: userData.user.id,
        book_id: book.id,
        current_page: newPage,
        last_read_at: new Date().toISOString(),
      })
    } catch (error) {
      console.error("Error updating reading progress:", error)
    }
  }

  // Toggle bookmark
  const toggleBookmark = async () => {
    if (!isLoggedIn) {
      toast({
        title: "خطا",
        description: "لطفاً ابتدا وارد حساب کاربری خود شوید",
        variant: "destructive",
      })
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
        toast({
          title: "موفقیت",
          description: "نشانک حذف شد",
        })
      } else {
        // Add bookmark
        await supabase.from("bookmarks").insert({
          user_id: userData.user.id,
          book_id: book.id,
          page: page,
          created_at: new Date().toISOString(),
        })
        setIsBookmarked(true)
        toast({
          title: "موفقیت",
          description: "نشانک اضافه شد",
        })
      }
    } catch (error) {
      console.error("خطا در تغییر وضعیت نشانک:", error)
      toast({
        title: "خطا",
        description: "خطا در تغییر وضعیت نشانک",
        variant: "destructive",
      })
    }
  }

  // Process page content to highlight difficult words
  function processPageContent(content: string): string {
    // Remove any existing HTML tags for safety
    const sanitizedContent = content.replace(/<[^>]*>/g, "")

    // Split content into words while preserving punctuation and spacing
    const words = sanitizedContent.split(/(\s+)/)

    // Process each word
    const processedWords = words.map((word) => {
      // Skip whitespace
      if (/^\s+$/.test(word)) return word

      // Add data attributes for interactive features
      return `<span class="interactive-word" data-word="${word.trim()}">${word}</span>`
    })

    return processedWords.join("")
  }

  // Handle text selection for translation
  const handleTranslateSelection = (_text: string) => {
    toast({
      title: "موفقیت",
      description: "متن انتخاب شده برای ترجمه ارسال شد",
    })
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
          interactiveFlipEnabled={interactiveFlipEnabled || settings.interactiveFlipEnabled}
          pageFlipSpeed={settings.pageFlipSpeed}
          pageFlipThreshold={settings.pageFlipThreshold}
          pageFlipEasing={settings.pageFlipEasing}
        />

        {/* Text selection handler */}
        <TextSelectionHandler
          onTranslate={handleTranslateSelection}
          onHighlight={(_text) => {
            /* Handle highlight functionality when needed */
          }}
          onCopy={(text) => {
            navigator.clipboard.writeText(text)
            toast({
              title: "موفقیت",
              description: "متن کپی شد",
            })
          }}
        />
      </div>
    </div>
  )
}
