"use client"

import React from "react"
import { useState, useCallback } from "react"

import Image from "next/image"
import Link from "next/link"

import { motion } from "framer-motion"
import { BookOpen, Bookmark, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Book {
  id: string
  title: string
  author: string
  coverImage: string | null
  language: string
  level: string
  totalPages: number
  isPremium: boolean
  categoryId: string | null
  createdAt: string
  rating?: number
  description?: string
}

interface BookCardProps {
  book: Book
  progress: number
  totalPages: number
  isLoggedIn: boolean
  isBookmarked: boolean
  viewMode: "grid" | "list"
  onBookmarkToggle?: (bookId: string, isBookmarked: boolean) => void
}

export function BookCard({
  book,
  progress,
  totalPages,
  isLoggedIn,
  isBookmarked: initialIsBookmarked,
  viewMode,
  onBookmarkToggle,
}: BookCardProps) {
  const [isBookmarked, setIsBookmarked] = useState(initialIsBookmarked)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()
  const [isHovered, setIsHovered] = useState(false)

  const handleBookmarkToggle = useCallback(async () => {
    if (!isLoggedIn) return
    
    setIsLoading(true)
    try {
      const newBookmarkState = !isBookmarked
      const { error } = newBookmarkState
        ? await supabase.from("bookmarks").insert({ bookId: book.id })
        : await supabase.from("bookmarks").delete().match({ bookId: book.id })

      if (error) throw error

      setIsBookmarked(newBookmarkState)
      onBookmarkToggle?.(book.id, newBookmarkState)
    } catch (error) {
      console.error("Error toggling bookmark:", error)
    } finally {
      setIsLoading(false)
    }
  }, [book.id, isBookmarked, isLoggedIn, onBookmarkToggle, supabase])

  const progressPercentage = Math.round((progress / totalPages) * 100)

  // تنظیم رنگ سطح دشواری
  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // تبدیل سطح دشواری به فارسی
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

  // تبدیل زبان به فارسی
  const getLanguageText = (language: string) => {
    switch (language) {
      case "english":
        return "انگلیسی"
      case "persian":
        return "فارسی"
      case "arabic":
        return "عربی"
      case "french":
        return "فرانسوی"
      case "german":
        return "آلمانی"
      default:
        return language
    }
  }

  const cardContent = (
    <>
      <div className={cn(
        "group relative",
        viewMode === "grid" ? "aspect-[3/4]" : "w-32 shrink-0"
      )}>
        <Image
          src={book.coverImage || "/images/placeholder-book.png"}
          alt={book.title}
          fill
          className="rounded-md object-cover transition-transform group-hover:scale-105"
          sizes={viewMode === "grid" ? "(max-width: 768px) 50vw, 33vw" : "128px"}
          priority={false}
        />
        {book.isPremium && (
          <Badge
            variant="gold"
            className="absolute right-2 top-2 bg-gradient-to-r from-amber-500 to-yellow-400 border-none text-white"
          >
            ویژه
          </Badge>
        )}
      </div>

      <div className={cn(
        "flex flex-col",
        viewMode === "list" && "flex-1 pr-4"
      )}>
        <h3 className="mb-1 line-clamp-2 font-semibold">
          {book.title}
        </h3>
        <p className="text-muted-foreground mb-2 text-sm">
          {book.author}
        </p>

        <div className="mb-2 flex flex-wrap gap-2">
          <Badge variant="outline">
            {book.language === "english" ? "انگلیسی" :
             book.language === "persian" ? "فارسی" :
             book.language === "arabic" ? "عربی" : book.language}
          </Badge>
          <Badge variant="outline">
            {book.level === "beginner" ? "مبتدی" :
             book.level === "intermediate" ? "متوسط" :
             book.level === "advanced" ? "پیشرفته" : book.level}
          </Badge>
          {book.rating && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Star className="size-3 fill-current" />
              {book.rating.toFixed(1)}
            </Badge>
          )}
        </div>

        {viewMode === "list" && book.description && (
          <p className="text-muted-foreground mb-2 line-clamp-2 text-sm">
            {book.description}
          </p>
        )}

        {isLoggedIn && (
          <div className="mt-auto">
            {progress > 0 && (
              <div className="mb-2 space-y-1">
                <Progress value={progressPercentage} className="h-1" />
                <p className="text-muted-foreground text-xs">
                  {progress} از {totalPages} صفحه
                </p>
              </div>
            )}

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                asChild
              >
                <Link href={`/reader/${book.id}`}>
                  <BookOpen className="ml-1 size-4" />
                  {progress > 0 ? "ادامه مطالعه" : "شروع مطالعه"}
                </Link>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn(
                  "size-8",
                  isBookmarked && "text-primary"
                )}
                onClick={handleBookmarkToggle}
                disabled={isLoading}
              >
                <Bookmark
                  className={cn(
                    "size-4 transition-colors",
                    isBookmarked && "fill-current"
                  )}
                />
              </Button>
            </div>
          </div>
        )}
      </div>
    </>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.2 }}
    >
      <Card className={cn(
        "overflow-hidden transition-shadow hover:shadow-lg",
        viewMode === "grid" ? "p-3" : "flex p-3"
      )}>
        {cardContent}
      </Card>
    </motion.div>
  )
}
