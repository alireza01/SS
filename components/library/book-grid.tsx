"use client"

import * as React from "react"
import { useState, useEffect, useCallback, type FC } from "react"

import Image from "next/image"
import Link from "next/link"
import { useSearchParams } from "next/navigation"

import { motion } from "framer-motion"
import { Star, BookOpen, ChevronLeft, ChevronRight } from "lucide-react"

import { badgeVariants } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { formatPrice } from "@/lib/utils"
import { cn } from "@/lib/utils"


interface Book {
  id: string
  title: string
  slug: string
  cover_image: string | null
  price: number
  discount_percentage?: number
  has_free_trial: boolean
  author: {
    name: string
  }[]
  category: {
    name: string
    slug: string
  }[]
  rating: {
    rating: number
  }[]
  status: "available" | "borrowed" | "reserved"
}

interface BookWithAverageRating extends Omit<Book, 'rating'> {
  rating: number
}

interface RawBook extends Book {}

export const BookGrid: FC = () => {
  const containerRef = React.useRef<HTMLDivElement>(null)
  const [books, setBooks] = useState<BookWithAverageRating[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [totalBooks, setTotalBooks] = useState(0)
  const [currentPage, setCurrentPage] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [retryCount, setRetryCount] = useState(0)
  const searchParams = useSearchParams()

  const category = searchParams.get("category")
  const query = searchParams.get("q")
  const sort = searchParams.get("sort") || "newest"

  const booksPerPage = 12

  const fetchBooks = useCallback(async () => {
    setIsLoading(true)
    try {
      const supabase = createClient()

      // Start building the query
      let booksQuery = supabase.from("books").select(
        `
          id,
          title,
          slug,
          cover_image,
          price,
          discount_percentage,
          has_free_trial,
          author:author_id(name),
          category:category_id(name, slug),
          rating:reviews(rating),
          status
        `,
        { count: "exact" },
      )

      // Apply filters
      if (category) {
        booksQuery = booksQuery.eq("category.slug", category)
      }

      if (query) {
        booksQuery = booksQuery.or(`title.ilike.%${query}%,author.name.ilike.%${query}%`)
      }

      // Apply sorting
      switch (sort) {
        case "popular":
          booksQuery = booksQuery.order("reviews", { ascending: false })
          break
        case "rating":
          booksQuery = booksQuery.order("rating", { ascending: false })
          break
        case "price-asc":
          booksQuery = booksQuery.order("price", { ascending: true })
          break
        case "price-desc":
          booksQuery = booksQuery.order("price", { ascending: false })
          break
        default:
          booksQuery = booksQuery.order("created_at", { ascending: false })
      }

      booksQuery = booksQuery.range((currentPage - 1) * booksPerPage, currentPage * booksPerPage - 1)

      const { data, count, error } = await booksQuery

      if (error) throw error

      const booksWithRating = (data as RawBook[] || []).map((book) => ({
        ...book,
        rating:
          book.rating && book.rating.length > 0
            ? book.rating.reduce((sum: number, item) => sum + (item.rating || 0), 0) / book.rating.length
            : 0,
      }))

      if (sort === "rating") {
        booksWithRating.sort((a, b) => b.rating - a.rating)
      }

      setBooks(booksWithRating)
      setTotalBooks(count || 0)
      setError(null)
    } catch (error) {
      console.error("Error fetching books:", error)
      setError("خطا در دریافت اطلاعات کتاب‌ها. لطفاً دوباره تلاش کنید.")
      setBooks([])
      setTotalBooks(0)

      // Implement retry logic
      if (retryCount < 3) {
        setTimeout(() => {
          setRetryCount(prev => prev + 1)
          fetchBooks()
        }, Math.min(1000 * Math.pow(2, retryCount), 5000))
      }
    } finally {
      setIsLoading(false)
    }
  }, [category, query, sort, currentPage, booksPerPage, retryCount])

  useEffect(() => {
    setRetryCount(0)
    fetchBooks()
  }, [fetchBooks])

  const handleImageError = useCallback((event: React.SyntheticEvent<HTMLImageElement, Event>) => {
    event.currentTarget.src = "/placeholder.svg?height=300&width=200"
  }, [])

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }, [])

  const totalPages = Math.ceil(totalBooks / booksPerPage)

  if (error) {
    return (
      <div className="py-12 text-center" role="alert">
        <div className="mb-4 rounded-lg bg-red-100 p-4 dark:bg-red-900">
          <p className="text-red-800 dark:text-red-200">{error}</p>
          {retryCount < 3 && (
            <p className="mt-2 text-sm text-red-600 dark:text-red-300">
              در حال تلاش مجدد... ({retryCount + 1}/3)
            </p>
          )}
        </div>
        <Button 
          onClick={() => {
            setRetryCount(0)
            fetchBooks()
          }}
          className="from-gold-300 to-gold-400 bg-gradient-to-r text-white hover:opacity-90"
        >
          تلاش مجدد
        </Button>
      </div>
    )
  }

  return (
    <div className="bg-white px-4 py-12 dark:bg-gray-950">
      <div className="container mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" role="status" aria-label="در حال بارگذاری کتاب‌ها">
            {[...Array(12)].map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gold-100 mb-4 aspect-[2/3] rounded-3xl dark:bg-gray-800"></div>
                <div className="bg-gold-100 mb-2 h-4 w-3/4 rounded dark:bg-gray-800"></div>
                <div className="bg-gold-100 mb-2 h-3 w-1/2 rounded dark:bg-gray-800"></div>
                <div className="bg-gold-100 h-3 w-1/4 rounded dark:bg-gray-800"></div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div className="py-12 text-center" role="alert">
            <div className="bg-gold-100 mb-4 inline-flex rounded-full p-4 dark:bg-gray-800">
              <BookOpen className="text-gold-400 size-10" />
            </div>
            <h3 className="text-gold-800 dark:text-gold-200 mb-2 text-xl font-bold">کتابی یافت نشد</h3>
            <p className="text-gold-700 dark:text-gold-300 mx-auto mb-6 max-w-md">
              با معیارهای جستجوی فعلی کتابی یافت نشد. لطفاً معیارهای جستجو را تغییر دهید.
            </p>
            <Button asChild className="from-gold-300 to-gold-400 bg-gradient-to-r text-white hover:opacity-90">
              <Link href="/library">نمایش همه کتاب‌ها</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6" role="list">
              {books.map((book: BookWithAverageRating, index: number) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.05, 0.5), duration: 0.5 }}
                  whileHover={{ y: -10 }}
                  className="flex h-full flex-col"
                  role="listitem"
                >
                  <Link href={`/books/${book.slug}`} className="group block h-full" aria-label={`کتاب ${book.title} نوشته ${book.author[0]?.name || 'ناشناس'}`}>
                    <Card className="h-full overflow-hidden border-none shadow-lg transition-all duration-300 hover:shadow-xl">
                      <CardContent className="flex h-full flex-col p-0">
                        <div className="relative">
                          <div className="relative aspect-[2/3]">
                            <Image
                              src={book.cover_image || "/placeholder.svg?height=300&width=200"}
                              alt={`جلد کتاب ${book.title}`}
                              fill
                              className="object-cover"
                              onError={handleImageError}
                              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 16vw"
                            />
                          </div>
                          <div className="absolute right-2 top-2 flex items-center rounded-full bg-white/90 px-2 py-1 shadow-md dark:bg-gray-800/90" aria-label={`امتیاز ${book.rating.toFixed(1)} از 5`}>
                            <Star className="ml-1 size-3 fill-yellow-500 text-yellow-500" aria-hidden="true" />
                            <span className="text-gold-800 dark:text-gold-200 text-xs font-medium">
                              {book.rating.toFixed(1)}
                            </span>
                          </div>

                          {book.has_free_trial && (
                            <div className="absolute left-2 top-2">
                              <div className={cn(
                                badgeVariants({ variant: "default" }),
                                "from-gold-300 to-gold-400 border-none bg-gradient-to-r text-white hover:opacity-90"
                              )}>
                                نسخه رایگان
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="flex grow flex-col p-3">
                          <h3 className="text-gold-800 dark:text-gold-200 mb-1 line-clamp-1 font-bold">{book.title}</h3>
                          <p className="text-gold-700 dark:text-gold-300 mb-2 line-clamp-1 text-sm">
                            {book.author[0]?.name || "ناشناس"}
                          </p>

                          <div className="mt-auto flex items-center justify-between">
                            <div className={cn(
                              badgeVariants({ variant: "outline" }),
                              "border-gold-200 text-gold-700 dark:text-gold-300 text-xs dark:border-gray-700"
                            )}>
                              {book.category[0]?.name || "دسته‌بندی نشده"}
                            </div>
                            <span className="text-gold-400 text-sm font-bold">{formatPrice(book.price)}</span>
                          </div>

                          <div className="mt-auto flex items-center justify-between">
                            <div
                              className={cn(
                                badgeVariants({
                                  variant: book.status === "available" ? "default" : book.status === "borrowed" ? "secondary" : "destructive",
                                }),
                                "text-xs"
                              )}
                            >
                              {book.status === "available" ? "موجود" : book.status === "borrowed" ? "امانت داده شده" : "رزرو شده"}
                            </div>
                          </div>

                          <Button 
                            className="from-gold-300 to-gold-400 mt-3 h-8 w-full rounded-full bg-gradient-to-r text-sm text-white hover:opacity-90"
                            aria-label={`مطالعه کتاب ${book.title}`}
                          >
                            <BookOpen className="ml-1 size-3" aria-hidden="true" />
                            مطالعه
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-12 flex justify-center" role="navigation" aria-label="صفحه‌بندی">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gold-200 size-8 rounded-full dark:border-gray-700"
                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    aria-label="صفحه قبل"
                  >
                    <ChevronRight className="size-4" aria-hidden="true" />
                  </Button>

                  {[...Array(totalPages)].map((_, index) => {
                    const pageNumber = index + 1
                    if (
                      pageNumber === 1 ||
                      pageNumber === totalPages ||
                      (pageNumber >= currentPage - 1 && pageNumber <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={pageNumber}
                          variant={pageNumber === currentPage ? "default" : "outline"}
                          className={cn(
                            pageNumber === currentPage
                              ? "from-gold-300 to-gold-400 bg-gradient-to-r text-white"
                              : "border-gold-200 dark:border-gray-700",
                            "size-8 rounded-full"
                          )}
                          onClick={() => handlePageChange(pageNumber)}
                          aria-label={`صفحه ${pageNumber}`}
                          aria-current={pageNumber === currentPage ? "page" : undefined}
                        >
                          {pageNumber}
                        </Button>
                      )
                    }
                    return null
                  })}

                  <Button
                    variant="outline"
                    size="icon"
                    className="border-gold-200 size-8 rounded-full dark:border-gray-700"
                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    aria-label="صفحه بعد"
                  >
                    <ChevronLeft className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}
