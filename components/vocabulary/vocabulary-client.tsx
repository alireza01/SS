"use client"

import { useState, useEffect } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { createClient } from "@/lib/supabase/client"

import { WordSuggestions } from "./word-suggestions"

interface Word {
  id: string
  userId: string
  word: string
  meaning: string
  level: string
  status: string
  nextReviewAt: string
  createdAt: string
}

interface WordStats {
  totalWords: number
  learningWords: number
  knownWords: number
  reviewStreak: number
}

interface VocabularyClientProps {
  userWords: Word[]
  wordStats: WordStats | null
  userLevel: string
}

export function VocabularyClient({ userWords: initialWords, wordStats, userLevel }: VocabularyClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  // وضعیت‌های کامپوننت
  const [words, setWords] = useState<Word[]>(initialWords)
  const [filteredWords, setFilteredWords] = useState<Word[]>(initialWords)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [sortBy, setSortBy] = useState<string>("newest")
  const [isLoading, setIsLoading] = useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [wordsPerPage, setWordsPerPage] = useState(20)
  const [totalPages, setTotalPages] = useState(1)
  const [reviewCount, setReviewCount] = useState(0)
  
  // دریافت پارامترهای URL
  useEffect(() => {
    const status = searchParams.get("status") || "all"
    const level = searchParams.get("level") || "all"
    const sort = searchParams.get("sort") || "newest"
    const page = searchParams.get("page") || "1"
    const query = searchParams.get("q") || ""
    const tab = searchParams.get("tab") || "all"
    
    setSelectedStatus(status)
    setSelectedLevel(level)
    setSortBy(sort)
    setCurrentPage(Number.parseInt(page))
    setSearchQuery(query)
    setActiveTab(tab)
  }, [searchParams])
  
  // فیلتر کردن کلمات بر اساس معیارهای انتخاب شده
  useEffect(() => {
    setIsLoading(true)
    
    let filtered = [...words]
    
    // فیلتر بر اساس تب فعال
    if (activeTab === "review") {
      filtered = filtered.filter(word => new Date(word.nextReviewAt) <= new Date())
    } else if (activeTab === "learning") {
      filtered = filtered.filter(word => word.status === "learning")
    } else if (activeTab === "known") {
      filtered = filtered.filter(word => word.status === "known")
    }
    
    // جستجو در کلمه و معنی
    if (searchQuery) {
      filtered = filtered.filter(
        (word) =>
          word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
          word.meaning.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    }
    
    // فیلتر بر اساس وضعیت
    if (selectedStatus !== "all") {
      filtered = filtered.filter((word) => word.status === selectedStatus)
    }
    
    // فیلتر بر اساس سطح
    if (selectedLevel !== "all") {
      filtered = filtered.filter((word) => word.level === selectedLevel)
    }
    
    // مرتب‌سازی
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        filtered.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "alphabetical":
        filtered.sort((a, b) => a.word.localeCompare(b.word))
        break
      case "review_date":
        filtered.sort((a, b) => new Date(a.nextReviewAt).getTime() - new Date(b.nextReviewAt).getTime())
        break
      default:
        filtered.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    }
    
    // صفحه‌بندی
    setTotalPages(Math.ceil(filtered.length / wordsPerPage))
    
    // نمایش کلمات صفحه فعلی
    const startIndex = (currentPage - 1) * wordsPerPage
    const endIndex = startIndex + wordsPerPage
    const paginatedWords = filtered.slice(startIndex, endIndex)
    
    setFilteredWords(paginatedWords)
    
    // محاسبه تعداد کلمات نیازمند مرور
    const reviewableWords = words.filter(word => new Date(word.nextReviewAt) <= new Date())
    setReviewCount(reviewableWords.length)
    
    setIsLoading(false)
  }, [words, searchQuery, selectedStatus, selectedLevel, sortBy, currentPage, wordsPerPage, activeTab])
  
  // به‌روزرسانی URL با پارامترهای فیلتر
  useEffect(() => {
    const params = new URLSearchParams()
    
    if (selectedStatus !== "all") params.set("status", selectedStatus)
    if (selectedLevel !== "all") params.set("level", selectedLevel)
    if (sortBy !== "newest") params.set("sort", sortBy)
    if (currentPage !== 1) params.set("page", currentPage.toString())
    if (searchQuery) params.set("q", searchQuery)
    if (activeTab !== "all") params.set("tab", activeTab)
    
    const url = `/vocabulary${params.toString() ? `?${params.toString()}` : ""}`
    router.push(url, { scroll: false })
  }, [router, selectedStatus, selectedLevel, sortBy, currentPage, searchQuery, activeTab])
  
  // پاک کردن همه فیلترها
  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedStatus("all")
    setSelectedLevel("all")
    setSortBy("newest")
    setCurrentPage(1)
  }
  
  // تغییر صفحه
  const changePage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page)
    }
  }
  
  // افزودن کلمه جدید
  const addWord = async (newWord: Omit<Word, "id" | "userId" | "createdAt">) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const newWordWithId = {
        ...newWord,
        id: crypto.randomUUID(),
        userId: userData.user.id,
        createdAt: new Date().toISOString()
      }

      setWords(prev => [newWordWithId, ...prev])
    } catch (error) {
      console.error("Error adding word:", error)
    }
  }

  const handleAddWord = (newWord: Word) => {
    setWords(prev => [newWord, ...prev])
  }

  return (
    <div className="space-y-6">
      <WordSuggestions userLevel={userLevel} onAddWord={handleAddWord} />
      {/* Existing vocabulary management UI */}
    </div>
  )
}
