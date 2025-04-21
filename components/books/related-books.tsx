"use client"

import Image from "next/image"
import Link from "next/link"

import { Crown } from "lucide-react"

import { Badge } from "@/components/ui/badge"


interface Book {
  id: string
  title: string
  author: string
  coverImage: string | null
  level: string
  isPremium?: boolean
}

interface RelatedBooksProps {
  books: Book[]
}

export function RelatedBooks({ books }: RelatedBooksProps) {
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

  if (books.length === 0) {
    return <p className="text-muted-foreground text-center">کتاب مرتبطی یافت نشد.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-4">
      {books.map((book) => (
        <Link
          key={book.id}
          href={`/books/${book.id}`}
          className="hover:border-primary group block overflow-hidden rounded-md border transition-colors"
        >
          <div className="relative aspect-[2/3] overflow-hidden">
            <Image
              src={book.coverImage || "/placeholder.svg?height=300&width=200"}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
            {book.isPremium && (
              <div className="bg-gold-500 absolute right-2 top-2 rounded-full p-1 text-white">
                <Crown className="size-3" />
              </div>
            )}
          </div>
          <div className="p-2">
            <h3 className="group-hover:text-primary line-clamp-1 text-sm font-medium transition-colors">
              {book.title}
            </h3>
            <p className="text-muted-foreground line-clamp-1 text-xs">{book.author}</p>
            <div className="mt-1">
              <Badge variant="outline" className={`text-xs ${getLevelColor(book.level)}`}>
                {getLevelText(book.level)}
              </Badge>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
