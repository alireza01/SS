"use client"

import { useEffect, useState, useRef } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, Search, SlidersHorizontal, BookOpen, X } from "lucide-react"

import { BookCard } from "@/components/library/book-card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"

type SortOption = "newest" | "oldest" | "title" | "author"
type Level = "all" | "beginner" | "intermediate" | "advanced"
type Language = "all" | "en" | "fr" | "de" | "es"

interface Book {
  id: string
  title: string
  author: string
  coverImage: string | null
  language: Language
  level: Level
  totalPages: number
  isPremium: boolean
  categoryId: string | null
  createdAt: string
}

interface Category {
  id: string
  name: string
  slug: string
}

interface UserProgress {
  bookId: string
  currentPage: number
}

interface LibraryClientProps {
  initialBooks: Book[]
  categories: Category[]
  userProgress: UserProgress[]
  isLoggedIn: boolean
}

export function LibraryClient({ initialBooks, categories, userProgress, isLoggedIn }: LibraryClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  // وضعیت‌های کامپوننت
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [filteredBooks, setFilteredBooks] = useState<Book[]>(initialBooks)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<Level>("all")
  const [selectedLanguage, setSelectedLanguage] = useState<Language>("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
  const [isLoading, setIsLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [booksPerPage, setBooksPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [showOnlyReading, setShowOnlyReading] = useState(false)
  const [showOnlyBookmarked, setShowOnlyBookmarked] = useState(false)
  const [userBookmarks, setUserBookmarks] = useState<string[]>([])

  const containerRef = useRef<HTMLDivElement>(null)

  // دریافت پارامترهای URL
  useEffect(() => {
    const category = searchParams.get("category") || "all"
    const level = searchParams.get("level") || "all"
    const language = searchParams.get("language") || "all"
    const type = searchParams.get("type") || "all"
    const sort = searchParams.get("sort") || "newest"
    const page = searchParams.get("page") || "1"
    const query = searchParams.get("q") || ""
    const reading = searchParams.get("reading") === "true"
    const bookmarked = searchParams.get("bookmarked") === "true"

    setSelectedCategory(category)
    setSelectedLevel(level as Level)
    setSelectedLanguage(language as Language)
    setSelectedType(type)
    setSortBy(sort as SortOption)
    setCurrentPage(Number.parseInt(page))
    setSearchQuery(query)
    setShowOnlyReading(reading)
    setShowOnlyBookmarked(bookmarked)
  }, [searchParams])

  // دریافت نشانک‌های کاربر
  useEffect(() => {
    const fetchUserBookmarks = async () => {
      if (!isLoggedIn) return

      try {
        const { data: userData } = await supabase.auth.getUser()
        if (!userData.user) return

        const { data: bookmarks } = await supabase.from("bookmarks").select("bookId").eq("userId", userData.user.id)

        if (bookmarks) {
          setUserBookmarks(bookmarks.map((b) => b.bookId))
        }
      } catch (error) {
        console.error("خطا در دریافت نشانک‌ها:", error)
      }
    }

    fetchUserBookmarks()
  }, [isLoggedIn, supabase])

  // فیلتر کردن کتاب‌ها بر اساس معیارهای انتخاب شده
  useEffect(() => {
    setIsLoading(true)

    let filtered = [...books]

    // جستجو در عنوان و نویسنده
    if (searchQuery) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          book.author.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }

    // فیلتر بر اساس دسته‌بندی
    if (selectedCategory !== "all") {
      filtered = filtered.filter((book) => book.categoryId === selectedCategory)
    }

    // فیلتر بر اساس سطح
    if (selectedLevel !== "all") {
      filtered = filtered.filter((book) => book.level === selectedLevel)
    }

    // فیلتر بر اساس زبان
    if (selectedLanguage !== "all") {
      filtered = filtered.filter((book) => book.language === selectedLanguage)
    }

    // فیلتر بر اساس نوع (رایگان/ویژه)
    if (selectedType !== "all") {
      filtered = filtered.filter((book) => (selectedType === "free" ? !book.isPremium : book.isPremium))
    }

    // فیلتر بر اساس در حال مطالعه
    if (showOnlyReading) {
      const readingBookIds = userProgress.map((p) => p.bookId)
      filtered = filtered.filter((book) => readingBookIds.includes(book.id))
    }

    // فیلتر بر اساس نشانک‌گذاری شده
    if (showOnlyBookmarked) {
      filtered = filtered.filter((book) => userBookmarks.includes(book.id))
    }

    // مرتب‌سازی
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "title":
        filtered.sort((a, b) => a.title.localeCompare(b.title))
        break
      case "author":
        filtered.sort((a, b) => a.author.localeCompare(b.author))
        break
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }

    // صفحه‌بندی
    setTotalPages(Math.ceil(filtered.length / booksPerPage))

    // نمایش کتاب‌های صفحه فعلی
    const startIndex = (currentPage - 1) * booksPerPage
    const endIndex = startIndex + booksPerPage
    const paginatedBooks = filtered.slice(startIndex, endIndex)

    setFilteredBooks(paginatedBooks)

    // به‌روزرسانی فیلترهای فعال
    const filters = []
    if (selectedCategory !== "all") {
      const category = categories.find((c) => c.id === selectedCategory)
      if (category) filters.push(category.name)
    }
    if (selectedLevel !== "all") {
      filters.push(selectedLevel === "beginner" ? "مبتدی" : selectedLevel === "intermediate" ? "متوسط" : "پیشرفته")
    }
    if (selectedLanguage !== "all") {
      filters.push(
        selectedLanguage === "en"
          ? "انگلیسی"
          : selectedLanguage === "fr"
            ? "فرانسوی"
            : selectedLanguage === "de"
              ? "آلمانی"
              : selectedLanguage === "es"
                ? "اسپانیایی"
                : selectedLanguage,
      )
    }
    if (selectedType !== "all") {
      filters.push(selectedType === "free" ? "رایگان" : "ویژه")
    }
    if (showOnlyReading) {
      filters.push("در حال مطالعه")
    }
    if (showOnlyBookmarked) {
      filters.push("نشانک‌گذاری شده")
    }
    setActiveFilters(filters)

    // اسکرول به بالای صفحه هنگام تغییر صفحه
    if (containerRef.current) {
      containerRef.current.scrollIntoView({ behavior: "smooth", block: "start" })
    }

    setIsLoading(false)
  }, [
    books,
    searchQuery,
    selectedCategory,
    selectedLevel,
    selectedLanguage,
    selectedType,
    sortBy,
    currentPage,
    booksPerPage,
    categories,
    showOnlyReading,
    showOnlyBookmarked,
    userProgress,
    userBookmarks,
  ])

  // به‌روزرسانی URL با پارامترهای فیلتر
  useEffect(() => {
    const params = new URLSearchParams()

    if (selectedCategory !== "all") params.set("category", selectedCategory)
    if (selectedLevel !== "all") params.set("level", selectedLevel)
    if (selectedLanguage !== "all") params.set("language", selectedLanguage)
    if (selectedType !== "all") params.set("type", selectedType)
    if (sortBy !== "newest") params.set("sort", sortBy)
    if (currentPage !== 1) params.set("page", currentPage.toString())
    if (searchQuery) params.set("q", searchQuery)
    if (showOnlyReading) params.set("reading", "true")
    if (showOnlyBookmarked) params.set("bookmarked", "true")

    const url = `/library${params.toString() ? `?${params.toString()}` : ""}`
    router.push(url)
  }, [
    router,
    selectedCategory,
    selectedLevel,
    selectedLanguage,
    selectedType,
    sortBy,
    currentPage,
    searchQuery,
    showOnlyReading,
    showOnlyBookmarked,
  ])

  // پاک کردن همه فیلترها
  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedCategory("all")
    setSelectedLevel("all")
    setSelectedLanguage("all")
    setSelectedType("all")
    setSortBy("newest")
    setCurrentPage(1)
    setShowOnlyReading(false)
    setShowOnlyBookmarked(false)
  }

  // تغییر صفحه
  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }

  // یافتن پیشرفت مطالعه کتاب
  const getBookProgress = (bookId: string) => {
    const progress = userProgress.find((p) => p.bookId === bookId)
    return progress ? progress.currentPage : 0
  }

  // بررسی نشانک‌گذاری کتاب
  const isBookmarked = (bookId: string) => {
    return userBookmarks.includes(bookId)
  }

  // رندر اسکلتون لودینگ
  const renderSkeletons = () => {
    return Array(booksPerPage)
      .fill(0)
      .map((_, index) => (
        <div key={index} className="animate-pulse">
          {viewMode === "grid" ? (
            <div className="flex flex-col">
              <Skeleton className="h-48 w-full rounded-md" />
              <Skeleton className="mt-2 h-4 w-3/4" />
              <Skeleton className="mt-1 h-3 w-1/2" />
              <div className="mt-2 flex gap-1">
                <Skeleton className="h-5 w-16 rounded-full" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
            </div>
          ) : (
            <div className="flex">
              <Skeleton className="h-28 w-20 rounded-md" />
              <div className="flex-1 pr-4">
                <Skeleton className="mt-1 h-5 w-3/4" />
                <Skeleton className="mt-1 h-4 w-1/2" />
                <div className="mt-2 flex gap-1">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
                <Skeleton className="mt-4 h-4 w-full" />
              </div>
            </div>
          )}
        </div>
      ))
  }

  return (
    <div ref={containerRef} className="container py-8">
      <div className="mb-8 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
        <div>
          <h1 className="text-3xl font-bold">کتابخانه</h1>
          <p className="text-muted-foreground">مجموعه‌ای از بهترین کتاب‌ها برای یادگیری زبان</p>
        </div>
        <div className="flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" className="lg:hidden">
                <SlidersHorizontal className="mr-2 size-4" />
                فیلترها
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>فیلترها</SheetTitle>
              </SheetHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile-search">جستجو</Label>
                  <Input
                    id="mobile-search"
                    type="search"
                    placeholder="جستجو در کتاب‌ها..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-sort">مرتب‌سازی</Label>
                  <Select value={sortBy} onValueChange={(value: SortOption) => setSortBy(value)}>
                    <SelectTrigger aria-label="مرتب‌سازی">
                      <SelectValue placeholder="انتخاب مرتب‌سازی" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">جدیدترین</SelectItem>
                      <SelectItem value="oldest">قدیمی‌ترین</SelectItem>
                      <SelectItem value="title">عنوان</SelectItem>
                      <SelectItem value="author">نویسنده</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-level">سطح</Label>
                  <Select value={selectedLevel} onValueChange={(value: Level) => setSelectedLevel(value)}>
                    <SelectTrigger aria-label="سطح">
                      <SelectValue placeholder="انتخاب سطح" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه</SelectItem>
                      <SelectItem value="beginner">مبتدی</SelectItem>
                      <SelectItem value="intermediate">متوسط</SelectItem>
                      <SelectItem value="advanced">پیشرفته</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="mobile-language">زبان</Label>
                  <Select value={selectedLanguage} onValueChange={(value: Language) => setSelectedLanguage(value)}>
                    <SelectTrigger aria-label="زبان">
                      <SelectValue placeholder="انتخاب زبان" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">همه</SelectItem>
                      <SelectItem value="en">انگلیسی</SelectItem>
                      <SelectItem value="fr">فرانسوی</SelectItem>
                      <SelectItem value="de">آلمانی</SelectItem>
                      <SelectItem value="es">اسپانیایی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <Tabs defaultValue={viewMode} onValueChange={(value) => setViewMode(value as "grid" | "list")}>
            <TabsList>
              <TabsTrigger value="grid" className="px-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              </TabsTrigger>
              <TabsTrigger value="list" className="px-3">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute right-3 top-1/2 size-5 -translate-y-1/2 text-gray-500" />
        <Input
          placeholder="جستجو در کتاب‌ها..."
          className="pl-3 pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {activeFilters.length > 0 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {activeFilters.map((filter, index) => (
            <Badge key={index} variant="secondary" className="px-3 py-1">
              {filter}
            </Badge>
          ))}
          <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-7">
            <X className="mr-1 size-3" />
            پاک کردن همه
          </Button>
        </div>
      )}

      {isLoading ? (
        <div
          className={
            viewMode === "grid" ? "grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5" : "space-y-4"
          }
        >
          {renderSkeletons()}
        </div>
      ) : filteredBooks.length > 0 ? (
        <AnimatePresence mode="wait">
          <motion.div
            key={viewMode}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    progress={getBookProgress(book.id)}
                    totalPages={book.totalPages}
                    isLoggedIn={isLoggedIn}
                    isBookmarked={isBookmarked(book.id)}
                    viewMode="grid"
                  />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    progress={getBookProgress(book.id)}
                    totalPages={book.totalPages}
                    isLoggedIn={isLoggedIn}
                    isBookmarked={isBookmarked(book.id)}
                    viewMode="list"
                  />
                ))}
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="bg-muted mb-4 flex size-16 items-center justify-center rounded-full">
            <BookOpen className="text-muted-foreground size-8" />
          </div>
          <h3 className="mb-2 text-xl font-medium">کتابی یافت نشد</h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            با معیارهای جستجوی فعلی کتابی یافت نشد. لطفاً معیارهای جستجو را تغییر دهید یا فیلترها را پاک کنید.
          </p>
          <Button onClick={clearAllFilters}>پاک کردن فیلترها</Button>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronRight className="size-4" />
          </Button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
            // نمایش دکمه‌های صفحه‌بندی با محدودیت
            if (page === 1 || page === totalPages || (page >= currentPage - 1 && page <= currentPage + 1)) {
              return (
                <Button
                  key={page}
                  variant={currentPage === page ? "default" : "outline"}
                  size="sm"
                  onClick={() => changePage(page)}
                  className="size-8 p-0"
                >
                  {page}
                </Button>
              )
            } else if (
              (page === currentPage - 2 && currentPage > 3) ||
              (page === currentPage + 2 && currentPage < totalPages - 2)
            ) {
              return (
                <span key={page} className="px-2">
                  ...
                </span>
              )
            }
            return null
          })}

          <Button
            variant="outline"
            size="icon"
            onClick={() => changePage(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronLeft className="size-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
