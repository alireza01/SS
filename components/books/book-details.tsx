"use client"

import { useState } from "react"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { createClient } from "@/lib/supabase/client"
import { formatDate } from "@/lib/utils"

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  coverImage: string | null
  language: string
  level: string
  totalPages: number
  isPremium: boolean
  publishedAt: string | null
  createdAt: string
  categories: {
    name: string
  } | null
  slug: string
}

interface UserProgress {
  currentPage: number
  lastReadAt: string
}

interface RelatedBook {
  id: string
  title: string
  author: string
  coverImage: string | null
  level: string
  slug: string
}

interface BookDetailsProps {
  book: Book
  userProgress: UserProgress | null
  relatedBooks: RelatedBook[]
  isLoggedIn: boolean
}

export function BookDetails({ book, userProgress, relatedBooks, isLoggedIn }: BookDetailsProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("description")
  const [isLoading, setIsLoading] = useState(false)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [rating, setRating] = useState(0)
  const [userRating, setUserRating] = useState(0)

  const progress = userProgress ? Math.round((userProgress.currentPage / book.totalPages) * 100) : 0

  const handleStartReading = () => {
    if (!isLoggedIn) {
      router.push("/login")
      return
    }

    setIsLoading(true)
    router.push(`/reader/${book.slug}`)
  }

  const handleContinueReading = () => {
    setIsLoading(true)
    router.push(`/reader/${book.slug}?page=${userProgress?.currentPage || 1}`)
  }

  const toggleBookmark = async () => {
    if (!isLoggedIn) {
      toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید")
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      if (isBookmarked) {
        await supabase.from("bookmarks").delete().eq("user_id", userData.user.id).eq("book_id", book.id)
        setIsBookmarked(false)
        toast.success("کتاب از نشانک‌های شما حذف شد")
      } else {
        await supabase.from("bookmarks").insert({
          user_id: userData.user.id,
          book_id: book.id,
          created_at: new Date().toISOString(),
        })
        setIsBookmarked(true)
        toast.success("کتاب به نشانک‌های شما اضافه شد")
      }
    } catch (error) {
      console.error("خطا در تغییر وضعیت نشانک:", error)
      toast.error("خطا در تغییر وضعیت نشانک")
    }
  }

  const rateBook = async (value: number) => {
    if (!isLoggedIn) {
      toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید")
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const { data: existingRating } = await supabase
        .from("book_ratings")
        .select("id, rating")
        .eq("user_id", userData.user.id)
        .eq("book_id", book.id)
        .maybeSingle()

      if (existingRating) {
        await supabase
          .from("book_ratings")
          .update({ rating: value, updated_at: new Date().toISOString() })
          .eq("id", existingRating.id)
      } else {
        await supabase.from("book_ratings").insert({
          user_id: userData.user.id,
          book_id: book.id,
          rating: value,
          created_at: new Date().toISOString(),
        })
      }

      setUserRating(value)
      toast.success("امتیاز شما ثبت شد")
    } catch (error) {
      console.error("خطا در ثبت امتیاز:", error)
      toast.error("خطا در ثبت امتیاز")
    }
  }

  return (
    <div className="container py-8">
      <div className="mb-8 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/library">
            <ArrowLeft className="ml-1 size-4" />
            بازگشت به کتابخانه
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="space-y-6">
            <div className="flex flex-col gap-4 sm:flex-row">
              <div className="relative aspect-[3/4] w-full max-w-[240px] overflow-hidden rounded-lg sm:w-48">
                {book.coverImage ? (
                  <Image
                    src={book.coverImage}
                    alt={book.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority
                  />
                ) : (
                  <div className="bg-muted flex h-full items-center justify-center">
                    <span className="text-muted-foreground">No cover</span>
                  </div>
                )}
              </div>
              <div className="flex-1 space-y-4">
                <div>
                  <h1 className="text-2xl font-bold sm:text-3xl">{book.title}</h1>
                  <p className="text-muted-foreground text-lg">{book.author}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{book.language}</Badge>
                  <Badge variant="secondary">{book.level}</Badge>
                  {book.categories && (
                    <Badge variant="secondary">{book.categories.name}</Badge>
                  )}
                  {book.isPremium && (
                    <Badge variant="gold">Premium</Badge>
                  )}
                </div>
                {userProgress && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} />
                    <p className="text-muted-foreground text-xs">
                      Last read on {formatDate(userProgress.lastReadAt)}
                    </p>
                  </div>
                )}
                <div className="flex flex-col gap-2 sm:flex-row">
                  {userProgress ? (
                    <Button
                      className="w-full sm:w-auto"
                      onClick={handleContinueReading}
                      disabled={isLoading}
                    >
                      Continue Reading
                    </Button>
                  ) : (
                    <Button
                      className="w-full sm:w-auto"
                      onClick={handleStartReading}
                      disabled={isLoading}
                    >
                      Start Reading
                    </Button>
                  )}
                </div>
              </div>
            </div>
            {book.description && (
              <div className="space-y-2">
                <h2 className="text-xl font-semibold">About this book</h2>
                <p className="text-muted-foreground">{book.description}</p>
              </div>
            )}
          </div>
        </div>
        {relatedBooks.length > 0 && (
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Related Books</h2>
              <div className="grid gap-4">
                {relatedBooks.map((relatedBook) => (
                  <Card key={relatedBook.id}>
                    <CardHeader className="p-4">
                      <Link
                        href={`/books/${relatedBook.slug}`}
                        className="flex items-start gap-3 hover:underline"
                      >
                        <div className="relative aspect-[3/4] w-16 overflow-hidden rounded">
                          {relatedBook.coverImage ? (
                            <Image
                              src={relatedBook.coverImage}
                              alt={relatedBook.title}
                              fill
                              className="object-cover"
                              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                            />
                          ) : (
                            <div className="bg-muted flex h-full items-center justify-center">
                              <span className="text-muted-foreground text-xs">No cover</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <CardTitle className="line-clamp-2 text-base">
                            {relatedBook.title}
                          </CardTitle>
                          <p className="text-muted-foreground text-sm">
                            {relatedBook.author}
                          </p>
                        </div>
                      </Link>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
