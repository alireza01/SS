import Image from "next/image"
import Link from "next/link"

import { Star } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { createServerClient } from "@/lib/supabase/server"
import { formatPrice } from "@/lib/utils"

interface Book {
  id: string
  title: string
  slug: string
  cover_image: string | null
  price: number
  discount_percentage: number
  author_id: string
  level: "beginner" | "intermediate" | "advanced"
  authors: {
    name: string
  } | null
}

interface RecommendedBooksProps {
  userId: string
}

export async function RecommendedBooks({ userId }: RecommendedBooksProps) {
  const supabase = createServerClient()

  // دریافت کتاب‌های پیشنهادی برای کاربر
  // در یک سیستم واقعی، این پیشنهادات بر اساس علایق کاربر و الگوریتم‌های پیشنهاددهنده خواهد بود
  const { data: booksData } = await supabase
    .from("books")
    .select(`
      id,
      title,
      slug,
      cover_image,
      price,
      discount_percentage,
      author_id,
      level,
      authors:author_id(name)
    `)
    .order("id", { ascending: false })
    .limit(4)

  const books = booksData?.map((book) => ({
    ...book,
    authors: book.authors?.[0] || null
  })) as Book[] | null

  if (!books || books.length === 0) {
    return <p className="text-muted-foreground text-center">در حال حاضر کتاب پیشنهادی وجود ندارد.</p>
  }

  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
      {books.map((book) => (
        <Link key={book.id} href={`/books/${book.slug}`} className="book-card group">
          <div className="relative aspect-[2/3] overflow-hidden rounded-lg">
            <Image
              src={book.cover_image || "/placeholder.svg?height=600&width=400"}
              alt={book.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />

            {book.discount_percentage > 0 && (
              <Badge className="absolute right-2 top-2 bg-red-500 hover:bg-red-600">
                {book.discount_percentage}% تخفیف
              </Badge>
            )}

            <Badge
              className={`absolute left-2 top-2 ${
                book.level === "beginner"
                  ? "bg-green-500 hover:bg-green-600"
                  : book.level === "intermediate"
                    ? "bg-blue-500 hover:bg-blue-600"
                    : "bg-purple-500 hover:bg-purple-600"
              }`}
            >
              {book.level === "beginner" ? "مبتدی" : book.level === "intermediate" ? "متوسط" : "پیشرفته"}
            </Badge>

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent p-4">
              <h3 className="line-clamp-1 font-bold text-white">{book.title}</h3>
              <p className="text-sm text-gray-300">{book.authors?.name}</p>

              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center">
                  <Star className="size-4 fill-yellow-400 text-yellow-400" />
                  <span className="ml-1 text-xs text-white">۴.۵</span>
                </div>

                <div className="text-sm font-bold text-white">{formatPrice(book.price)}</div>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  )
}
