"use client"

import { useState, useEffect } from "react"

import { ChevronLeft, ChevronRight, Settings2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"

interface BookPreviewProps {
  slug: string
}

export function BookPreview({ slug }: BookPreviewProps) {
  const [currentPage, setCurrentPage] = useState(1)
  const [fontSize, setFontSize] = useState(16)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const [bookContent, setBookContent] = useState<string | null>(null)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
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
              <SheetTitle>تنظیمات نمایش</SheetTitle>
              <SheetDescription>تنظیمات نمایش متن را شخصی‌سازی کنید.</SheetDescription>
            </SheetHeader>
            <div className="space-y-6 py-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">اندازه متن</label>
                <Slider
                  value={[fontSize]}
                  onValueChange={([value]: number[]) => setFontSize(value)}
                  min={12}
                  max={24}
                  step={1}
                />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">حالت تاریک</label>
                <Switch checked={isDarkMode} onCheckedChange={toggleDarkMode} />
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