"use client"

import { useEffect, useState } from "react"

import Image from "next/image"
import Link from "next/link"

import { motion } from "framer-motion"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"

interface Book {
  id: string
  title: string
  author: string
  coverImage: string | null
  level: string
  slug: string
}

export function TrendingBooks() {
  const [books, setBooks] = useState<Book[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTrendingBooks() {
      try {
        const { data, error } = await supabase
          .from("books")
          .select("id, title, author, coverImage, level, slug")
          .eq("isActive", true)
          .order("readCount", { ascending: false })
          .limit(8)

        if (error) throw error
        setBooks(data || [])
      } catch (error) {
        console.error("Error fetching trending books:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTrendingBooks()
  }, [])

  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 hover:bg-green-200 dark:bg-green-900 dark:text-green-300"
      case "intermediate":
        return "bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-300"
      case "advanced":
        return "bg-purple-100 text-purple-800 hover:bg-purple-200 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
    }
  }

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

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
        {[...Array(8)].map((_, index) => (
          <div key={index} className="animate-pulse">
            <div className="bg-muted mb-2 aspect-[2/3] rounded-lg"></div>
            <div className="bg-muted mb-2 h-4 w-3/4 rounded"></div>
            <div className="bg-muted h-3 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4">
      {books.map((book, index) => (
        <motion.div
          key={book.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="group"
        >
          <Link href={`/books/${book.slug}`}>
            <Card className="overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-xl">
              <CardContent className="p-0">
                <div className="relative aspect-[2/3]">
                  <Image
                    src={book.coverImage || "/images/book-placeholder.svg"}
                    alt={`Cover of ${book.title}`}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 25vw"
                    priority={index < 4}
                  />
                </div>
                <div className="p-4">
                  <h3 className="group-hover:text-primary mb-1 line-clamp-1 font-medium transition-colors">
                    {book.title}
                  </h3>
                  <p className="text-muted-foreground mb-2 text-sm">{book.author}</p>
                  <Badge 
                    variant="secondary" 
                    className={getLevelColor(book.level)}
                    role="status"
                  >
                    {getLevelText(book.level)}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        </motion.div>
      ))}
    </div>
  )
}