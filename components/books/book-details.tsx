"use client"

import { useState } from "react"

import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { format } from "date-fns-jalali"
import { BookOpen, Crown, Calendar, ArrowLeft, BookMarked, Star } from "lucide-react"
import { toast } from "sonner"

import { RelatedBooks } from "@/components/books/related-books"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"



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

  // محاسبه درصد پیشرفت
  const progressPercentage = userProgress ? Math.round((userProgress.currentPage / book.totalPages) * 100) : 0

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

  // تبدیل تاریخ به فرمت فارسی
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy/MM/dd")
    } catch (error) {
      return "تاریخ نامشخص"
    }
  }

  // محاسبه زمان نسبی آخرین مطالعه
  const getRelativeTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) {
      return "چند لحظه پیش"
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} دقیقه پیش`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} ساعت پیش`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} روز پیش`
    }
  }

  // شروع مطالعه کتاب
  const startReading = async () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/books/${book.slug}`)
      return
    }

    setIsLoading(true)

    try {
      // اگر کتاب ویژه است و کاربر آن را خریداری نکرده، به صفحه خرید هدایت می‌شود
      if (book.isPremium) {
        // در یک پروژه واقعی، بررسی می‌شود که آیا کاربر کتاب را خریداری کرده است یا خیر
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) {
          router.push(`/auth/login?redirect=/books/${book.slug}`)
          return
        }

        const { data: purchase } = await supabase
          .from("purchases")
          .select("id")
          .eq("user_id", userData.user.id)
          .eq("book_id", book.id)
          .maybeSingle()

        if (!purchase) {
          router.push(`/books/${book.slug}/purchase`)
          return
        }
      }

      // اگر کاربر قبلاً کتاب را مطالعه کرده، از همان صفحه ادامه می‌دهد
      if (userProgress) {
        router.push(`/books/${book.slug}/read?page=${userProgress.currentPage}`)
      } else {
        // در غیر این صورت، از صفحه اول شروع می‌کند
        router.push(`/books/${book.slug}/read?page=1`)
      }
    } catch (error) {
      console.error("خطا در شروع مطالعه:", error)
      toast.error("خطا در شروع مطالعه")
    } finally {
      setIsLoading(false)
    }
  }

  // مشاهده پیش‌نمایش کتاب
  const previewBook = () => {
    router.push(`/books/${book.slug}/read?page=1&preview=true`)
  }

  // نشانک‌گذاری کتاب
  const toggleBookmark = async () => {
    if (!isLoggedIn) {
      toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید")
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      if (isBookmarked) {
        // حذف نشانک
        await supabase.from("bookmarks").delete().eq("user_id", userData.user.id).eq("book_id", book.id)

        setIsBookmarked(false)
        toast.success("کتاب از نشانک‌های شما حذف شد")
      } else {
        // افزودن نشانک
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

  // ثبت امتیاز کتاب
  const rateBook = async (value: number) => {
    if (!isLoggedIn) {
      toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید")
      return
    }

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      // بررسی وجود امتیاز قبلی
      const { data: existingRating } = await supabase
        .from("book_ratings")
        .select("id, rating")
        .eq("user_id", userData.user.id)
        .eq("book_id", book.id)
        .maybeSingle()

      if (existingRating) {
        // به‌روزرسانی امتیاز
        await supabase
          .from("book_ratings")
          .update({ rating: value, updated_at: new Date().toISOString() })
          .eq("id", existingRating.id)
      } else {
        // ثبت امتیاز جدید
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

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="flex flex-col gap-6 md:flex-row">
            <div className="relative mx-auto h-56 w-40 shrink-0 md:mx-0 md:h-64 md:w-48">
              <Image
                src={book.coverImage || "/placeholder.svg?height=600&width=400"}
                alt={book.title}
                fill
                className="rounded-lg object-cover shadow-md"
              />
              {book.isPremium && (
                <div className="bg-gold-500 absolute right-3 top-3 rounded-full p-1.5 text-white shadow-md">
                  <Crown className="size-5" />
                </div>
              )}
            </div>
            <div className="flex-1">
              <h1 className="mb-2 text-3xl font-bold">{book.title}</h1>
              <p className="text-muted-foreground mb-4 text-lg">{book.author}</p>

              <div className="mb-6 flex flex-wrap gap-2">
                <Badge variant="outline" className={getLevelColor(book.level)}>
                  {getLevelText(book.level)}
                </Badge>
                <Badge variant="outline">{getLanguageText(book.language)}</Badge>
                {book.categories && <Badge variant="outline">{book.categories.name}</Badge>}
                {book.isPremium ? (
                  <Badge variant="outline" className="bg-gold-100 text-gold-800 dark:bg-gold-900 dark:text-gold-300">
                    ویژه
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                  >
                    رایگان
                  </Badge>
                )}
              </div>

              <div className="mb-6 grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                    <BookOpen className="text-muted-foreground size-4" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-sm">تعداد صفحات</p>
                    <p className="font-medium">{book.totalPages}</p>
                  </div>
                </div>
                {book.publishedAt && (
                  <div className="flex items-center gap-2">
                    <div className="bg-muted flex size-8 items-center justify-center rounded-full">
                      <Calendar className="text-muted-foreground size-4" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-sm">تاریخ انتشار</p>
                      <p className="font-medium">{formatDate(book.publishedAt)}</p>
                    </div>
                  </div>
                )}
              </div>

              {userProgress ? (
                <div className="mb-6">
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="text-muted-foreground">پیشرفت مطالعه</span>
                    <span>
                      {userProgress.currentPage} از {book.totalPages} صفحه ({progressPercentage}%)
                    </span>
                  </div>
                  <Progress value={progressPercentage} className="mb-2 h-2" />
                  <p className="text-muted-foreground text-xs">
                    آخرین مطالعه: {getRelativeTime(userProgress.lastReadAt)}
                  </p>
                </div>
              ) : null}

              <div className="flex flex-col gap-3 sm:flex-row">
                <Button className="flex-1" onClick={startReading} disabled={isLoading}>
                  {isLoading ? (
                    "در حال بارگذاری..."
                  ) : userProgress ? (
                    <>
                      <BookMarked className="ml-2 size-4" />
                      ادامه مطالعه
                    </>
                  ) : (
                    <>
                      <BookOpen className="ml-2 size-4" />
                      شروع مطالعه
                    </>
                  )}
                </Button>
                {!userProgress && (
                  <Button variant="outline" className="flex-1" onClick={previewBook}>
                    پیش‌نمایش رایگان
                  </Button>
                )}
              </div>

              <div className="mt-4 flex items-center gap-2">
                <p className="text-muted-foreground text-sm">امتیاز دهید:</p>
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((value) => (
                    <button
                      key={value}
                      className="focus:outline-none"
                      onClick={() => rateBook(value)}
                      aria-label={`Rate ${value} stars`}
                    >
                      <Star
                        className={`size-5 ${
                          value <= userRating ? "fill-yellow-500 text-yellow-500" : "text-gray-300 dark:text-gray-600"
                        }`}
                      />
                    </button>
                  ))}
                </div>
                {userRating > 0 && <span className="text-muted-foreground text-sm">({userRating})</span>}
              </div>
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
              <Tabs defaultValue="description" onValueChange={setActiveTab}>
                <TabsList className="w-full rounded-none border-b bg-transparent p-0">
                  <TabsTrigger
                    value="description"
                    className={`data-[state=active]:border-primary rounded-none border-b-2 px-4 py-3 ${
                      activeTab === "description"
                        ? "border-primary"
                        : "hover:border-muted-foreground/30 border-transparent"
                    }`}
                  >
                    توضیحات
                  </TabsTrigger>
                  <TabsTrigger
                    value="details"
                    className={`data-[state=active]:border-primary rounded-none border-b-2 px-4 py-3 ${
                      activeTab === "details" ? "border-primary" : "hover:border-muted-foreground/30 border-transparent"
                    }`}
                  >
                    جزئیات
                  </TabsTrigger>
                </TabsList>
                <TabsContent value="description" className="p-6">
                  {book.description ? (
                    <div className="prose prose-lg dark:prose-invert max-w-none">
                      <p>{book.description}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">توضیحاتی برای این کتاب ثبت نشده است.</p>
                  )}
                </TabsContent>
                <TabsContent value="details" className="p-6">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div>
                      <h3 className="mb-2 font-medium">اطلاعات کتاب</h3>
                      <ul className="space-y-2 text-sm">
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">عنوان:</span>
                          <span>{book.title}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">نویسنده:</span>
                          <span>{book.author}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">زبان:</span>
                          <span>{getLanguageText(book.language)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">سطح:</span>
                          <span>{getLevelText(book.level)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">تعداد صفحات:</span>
                          <span>{book.totalPages}</span>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h3 className="mb-2 font-medium">اطلاعات تکمیلی</h3>
                      <ul className="space-y-2 text-sm">
                        {book.categories && (
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">دسته‌بندی:</span>
                            <span>{book.categories.name}</span>
                          </li>
                        )}
                        {book.publishedAt && (
                          <li className="flex justify-between">
                            <span className="text-muted-foreground">تاریخ انتشار:</span>
                            <span>{formatDate(book.publishedAt)}</span>
                          </li>
                        )}
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">تاریخ افزودن:</span>
                          <span>{formatDate(book.createdAt)}</span>
                        </li>
                        <li className="flex justify-between">
                          <span className="text-muted-foreground">نوع دسترسی:</span>
                          <span>{book.isPremium ? "ویژه (پولی)" : "رایگان"}</span>
                        </li>
                      </ul>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">کتاب‌های مرتبط</h2>
              <RelatedBooks books={relatedBooks} />
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="mb-4 text-xl font-bold">عملیات</h2>
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={toggleBookmark}>
                  <BookMarked className="mr-2 size-4" />
                  {isBookmarked ? "حذف از نشانک‌ها" : "افزودن به نشانک‌ها"}
                </Button>

                {book.isPremium && (
                  <Button variant="outline" className="w-full justify-start" asChild>
                    <Link href={`/books/${book.slug}/purchase`}>
                      <Crown className="mr-2 size-4" />
                      خرید کتاب
                    </Link>
                  </Button>
                )}

                <Button variant="outline" className="w-full justify-start" asChild>
                  <Link href="/library">
                    <BookOpen className="mr-2 size-4" />
                    مشاهده کتاب‌های مشابه
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
