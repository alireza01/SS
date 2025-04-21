"use client"

import * as React from "react"
import { useState, useEffect } from "react"

import Image from "next/image"
import Link from "next/link"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"

interface Book {
  id: string
  slug: string
  title: string
  author: string
  coverImage: string | null
  level: string
  category: {
    name: string
  }[] | null
  rating: number
  isPremium: boolean
}

type BadgeVariant = 'default' | 'secondary' | 'outline' | 'destructive'

interface BadgeProps {
  children: React.ReactNode
  className?: string
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
}

export const BookShowcase: React.FC = () => {
  const [activeIndex, setActiveIndex] = useState(0)
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchFeaturedBooks() {
      try {
        const { data, error } = await supabase
          .from("books")
          .select(`
            id,
            slug,
            title,
            author,
            coverImage,
            level,
            rating,
            isPremium,
            category:categories(name)
          `)
          .eq("isActive", true)
          .order("rating", { ascending: false })
          .limit(3)

        if (error) throw error
        setBooks(data || [])
      } catch (error) {
        console.error("Error fetching featured books:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchFeaturedBooks()
  }, [])

  const nextBook = () => {
    setActiveIndex((prev: number) => (prev + 1) % books.length)
  }

  const prevBook = () => {
    setActiveIndex((prev: number) => (prev - 1 + books.length) % books.length)
  }

  if (isLoading) {
    return (
      <div className="bg-muted relative h-[500px] animate-pulse rounded-lg">
        <div className="absolute inset-0 flex items-center justify-center">
          <Skeleton className="h-72 w-48" />
        </div>
      </div>
    )
  }

  if (books.length === 0) {
    return null
  }

  return (
    <div className="from-primary/10 to-primary/5 relative h-[500px] overflow-hidden rounded-lg bg-gradient-to-r">
      <AnimatePresence mode="wait">
        {books.map((book: Book, index: number) => (
          index === activeIndex && (
            <motion.div
              key={book.id}
              className="absolute inset-0 flex items-center"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ duration: 0.3 }}
            >
              <div className="container grid grid-cols-1 items-center gap-8 md:grid-cols-2">
                <div className="space-y-6">
                  <Badge variant="secondary" className="mb-4">
                    {book.category?.map(c => c.name).join(", ") || "عمومی"}
                  </Badge>
                  <h2 className="text-4xl font-bold">{book.title}</h2>
                  <p className="text-muted-foreground text-xl">{book.author}</p>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center">
                      <Star className="mr-1 size-5 fill-yellow-500 text-yellow-500" />
                      <span className="text-sm">{book.rating?.toFixed(1) || "N/A"}</span>
                    </div>
                    <Badge variant="outline" className="text-sm">
                      {getLevelText(book.level)}
                    </Badge>
                    {book.isPremium && (
                      <Badge variant="secondary" className="bg-gold-100 text-gold-800">
                        ویژه
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-4">
                    <Button asChild>
                      <Link href={`/books/${book.slug}`}>مشاهده کتاب</Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href={`/books/${book.slug}?preview=true`}>پیش‌نمایش رایگان</Link>
                    </Button>
                  </div>
                </div>
                <div className="relative flex h-96 justify-center">
                  <Image
                    src={book.coverImage || "/images/book-placeholder.svg"}
                    alt={book.title}
                    width={250}
                    height={375}
                    className="rounded-lg object-cover shadow-2xl"
                    priority={index === 0}
                  />
                </div>
              </div>
            </motion.div>
          )
        ))}
      </AnimatePresence>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={prevBook}
          className="rounded-full"
          aria-label="Previous book"
        >
          <ChevronRight className="size-4" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          onClick={nextBook}
          className="rounded-full"
          aria-label="Next book"
        >
          <ChevronLeft className="size-4" />
        </Button>
      </div>
    </div>
  )
}

function getLevelText(level: string) {
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