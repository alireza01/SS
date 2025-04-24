"use client"

import { useState, useEffect } from "react"


import { Search, BookOpen, Trash2, Volume2, SortAsc, SortDesc } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"


interface UserVocabularyProps {
  userId: string
}

interface VocabularyWord {
  id: string
  word: string
  persianMeaning: string
  explanation: string
  example: string
  difficultyLevel: string
  bookId: string | null
  bookTitle: string | null
  createdAt: string
  reviewCount: number
}

// Add interface for the database response
interface VocabularyDBResponse {
  id: string
  word: string
  persianMeaning: string
  explanation: string
  example: string
  difficultyLevel: string
  bookId: string | null
  books: {
    title: string | null
  } | null
  createdAt: string
  reviewCount: number
}

export function UserVocabulary({ userId }: UserVocabularyProps) {
  const [words, setWords] = useState<VocabularyWord[]>([])
  const [filteredWords, setFilteredWords] = useState<VocabularyWord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [activeTab, setActiveTab] = useState("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "alphabetical">("newest")
  const [filterLevel, setFilterLevel] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchVocabulary = async () => {
      try {
        setIsLoading(true)

        const { data, error } = await supabase
          .from("vocabulary")
          .select(`
            id,
            word,
            persianMeaning,
            explanation,
            example,
            difficultyLevel,
            bookId,
            books (title),
            createdAt,
            reviewCount
          `)
          .eq("userId", userId)
          .order("createdAt", { ascending: false })

        if (error) throw error

        // Type assertion to unknown first, then to VocabularyDBResponse[]
        const formattedWords = (data as unknown as VocabularyDBResponse[]).map((item) => ({
          ...item,
          bookTitle: item.books?.title || null,
        }))

        setWords(formattedWords)
        setFilteredWords(formattedWords)
      } catch (error) {
        console.error("خطا در دریافت واژگان:", error)
        toast.error("خطا در دریافت واژگان")
      } finally {
        setIsLoading(false)
      }
    }

    fetchVocabulary()
  }, [supabase, userId])

  // فیلتر و مرتب‌سازی واژگان
  useEffect(() => {
    let result = [...words]

    // فیلتر بر اساس جستجو
    if (searchTerm) {
      result = result.filter(
        (word) =>
          word.word.toLowerCase().includes(searchTerm.toLowerCase()) || word.persianMeaning.includes(searchTerm),
      )
    }

    // فیلتر بر اساس تب فعال
    if (activeTab === "beginner") {
      result = result.filter((word) => word.difficultyLevel === "beginner")
    } else if (activeTab === "intermediate") {
      result = result.filter((word) => word.difficultyLevel === "intermediate")
    } else if (activeTab === "advanced") {
      result = result.filter((word) => word.difficultyLevel === "advanced")
    }

    // فیلتر بر اساس سطح دشواری
    if (filterLevel) {
      result = result.filter((word) => word.difficultyLevel === filterLevel)
    }

    // مرتب‌سازی
    if (sortBy === "newest") {
      result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    } else if (sortBy === "oldest") {
      result.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
    } else if (sortBy === "alphabetical") {
      result.sort((a, b) => a.word.localeCompare(b.word))
    }

    setFilteredWords(result)
  }, [words, searchTerm, activeTab, sortBy, filterLevel])

  // حذف کلمه
  const handleDeleteWord = async (id: string) => {
    try {
      const { error } = await supabase.from("vocabulary").delete().eq("id", id)

      if (error) throw error

      setWords(words.filter((word) => word.id !== id))
      toast.success("کلمه با موفقیت حذف شد")
    } catch (error) {
      console.error("خطا در حذف کلمه:", error)
      toast.error("خطا در حذف کلمه")
    }
  }

  // پخش تلفظ کلمه
  const speakWord = (word: string) => {
    if ("speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(word)
      utterance.lang = "en-US"
      window.speechSynthesis.speak(utterance)
    }
  }

  // تبدیل تاریخ به فرمت فارسی
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
        <h2 className="text-2xl font-bold">واژگان من</h2>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <div className="relative w-full sm:w-64">
            <Search className="text-muted-foreground absolute left-2 top-2.5 size-4" />
            <Input
              placeholder="جستجو..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>

          <Button variant="outline" size="icon" onClick={() => setSortBy(sortBy === "newest" ? "oldest" : "newest")}>
            {sortBy === "newest" ? <SortDesc className="size-4" /> : <SortAsc className="size-4" />}
          </Button>

          <Button variant="outline" asChild>
            <a href="/vocabulary/review">مرور واژگان</a>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4">
          <TabsTrigger value="all">همه</TabsTrigger>
          <TabsTrigger value="beginner">مبتدی</TabsTrigger>
          <TabsTrigger value="intermediate">متوسط</TabsTrigger>
          <TabsTrigger value="advanced">پیشرفته</TabsTrigger>
        </TabsList>
      </Tabs>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="border-primary size-12 animate-spin rounded-full border-4 border-t-transparent"></div>
        </div>
      ) : filteredWords.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="text-muted-foreground mb-4 size-16 opacity-20" />
            <p className="mb-2 text-xl font-medium">واژه‌ای یافت نشد</p>
            <p className="text-muted-foreground max-w-md text-center">
              {searchTerm
                ? "هیچ واژه‌ای با معیارهای جستجوی شما یافت نشد. معیارهای جستجو را تغییر دهید."
                : "هنوز واژه‌ای به لیست واژگان شما اضافه نشده است. با مطالعه کتاب‌ها و ذخیره کلمات، آن‌ها در اینجا نمایش داده خواهند شد."}
            </p>
            {!searchTerm && (
              <Button className="mt-4" asChild>
                <a href="/library">مشاهده کتابخانه</a>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredWords.map((word) => (
            <Card key={word.id} className="overflow-hidden">
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="flex items-center">
                      {word.word}
                      <Button variant="ghost" size="icon" className="ml-1 size-6" onClick={() => speakWord(word.word)}>
                        <Volume2 className="size-4" />
                      </Button>
                    </CardTitle>
                    <CardDescription>{word.persianMeaning}</CardDescription>
                  </div>
                  <Badge
                    variant={
                      word.difficultyLevel === "beginner"
                        ? "default"
                        : word.difficultyLevel === "intermediate"
                          ? "secondary"
                          : "destructive"
                    }
                  >
                    {word.difficultyLevel === "beginner"
                      ? "مبتدی"
                      : word.difficultyLevel === "intermediate"
                        ? "متوسط"
                        : "پیشرفته"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {word.explanation && <p className="mb-2 text-sm">{word.explanation}</p>}
                {word.example && <p className="text-muted-foreground text-sm italic">{word.example}</p>}
              </CardContent>
              <CardFooter className="text-muted-foreground flex justify-between pt-2 text-xs">
                <div>{word.bookTitle ? `از کتاب: ${word.bookTitle}` : "افزوده شده توسط شما"}</div>
                <div className="flex items-center">
                  <span>{formatDate(word.createdAt)}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-1 size-6"
                    onClick={() => handleDeleteWord(word.id)}
                  >
                    <Trash2 className="size-3" />
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
