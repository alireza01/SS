"use client"

import { useState, useEffect } from "react"

import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

interface BookPreviewProps {
  slug: string
}

export function BookPreview({ slug }: BookPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [fontSize, setFontSize] = useState(16)
  const [lineHeight, setLineHeight] = useState(1.5)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [bookContent, setBookContent] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [comment, setComment] = useState("")
  const supabase = createClient()

  useEffect(() => {
    async function fetchBookPreview() {
      try {
        const { data: book, error } = await supabase
          .from("books")
          .select("content, previewPages")
          .eq("slug", slug)
          .single()

        if (error) throw error

        if (book) {
          setBookContent(book.content)
          setTotalPages(book.previewPages || 20) // Default to 20 preview pages if not specified
        }
      } catch (error) {
        console.error("Error fetching book preview:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchBookPreview()
  }, [slug])

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1)
    }
  }

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode)
  }

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="bg-muted h-[600px] rounded-lg"></div>
      </div>
    )
  }

  if (!bookContent) {
    return (
      <div className="py-12 text-center">
        <p className="text-muted-foreground">محتوای پیش‌نمایش در دسترس نیست.</p>
      </div>
    )
  }

  return (
    <div className={`mx-auto max-w-3xl ${isDarkMode ? "dark" : ""}`}>
      <div className="mb-4 flex items-center justify-between">
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={handlePrevPage}
            disabled={currentPage === 1}
          >
            <ChevronRight className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronLeft className="size-4" />
          </Button>
          <div className="text-muted-foreground text-sm">
            صفحه {currentPage} از {totalPages}
          </div>
        </div>

        <Sheet open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon">
              <Settings2 className="size-4" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <SheetHeader>
              <SheetTitle>تنظیمات</SheetTitle>
            </SheetHeader>
            <div className="space-y-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="font-size" className="mb-2 block text-sm font-medium">
                    اندازه فونت
                  </label>
                  <input
                    id="font-size"
                    type="range"
                    min="12"
                    max="32"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <label htmlFor="line-height" className="mb-2 block text-sm font-medium">
                    فاصله خطوط
                  </label>
                  <input
                    id="line-height"
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="dark-mode">حالت تاریک</Label>
                  <Switch id="dark-mode" checked={isDarkMode} onCheckedChange={toggleDarkMode} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comment">نظر شما</Label>
                  <Textarea
                    id="comment"
                    placeholder="نظر خود را بنویسید..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div
        className={`prose prose-lg dark:prose-invert max-w-none ${
          isDarkMode ? "dark bg-gray-900 text-gray-100" : "bg-white text-gray-900"
        }`}
        style={{ fontSize: `${fontSize}px` }}
      >
        <div
          className="rounded-lg p-6 shadow-lg"
          dangerouslySetInnerHTML={{
            __html: bookContent
              .split("\n")
              .slice((currentPage - 1) * 5, currentPage * 5)
              .join("\n"),
          }}
        />
      </div>
    </div>
  )
}