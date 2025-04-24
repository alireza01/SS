"use client"

import * as React from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import type { BaseWord, Word, WordStats } from "@/types/vocabulary"

import { WordSuggestions } from "./word-suggestions"

interface VocabularyClientProps {
  userWords: Word[]
  wordStats: WordStats | null
  userLevel: string
}

export function VocabularyClient({ userWords: initialWords, wordStats, userLevel }: VocabularyClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  
  const [words, setWords] = React.useState<Word[]>(initialWords)
  const [filteredWords, setFilteredWords] = React.useState<Word[]>(initialWords)
  const [searchQuery, setSearchQuery] = React.useState("")
  const [selectedStatus, setSelectedStatus] = React.useState<string>("all")
  const [selectedLevel, setSelectedLevel] = React.useState<string>("all")
  const [sortBy, setSortBy] = React.useState<string>("newest")
  const [isLoading, setIsLoading] = React.useState(false)
  const [isAddDialogOpen, setIsAddDialogOpen] = React.useState(false)
  const [activeTab, setActiveTab] = React.useState<string>("all")
  const [currentPage, setCurrentPage] = React.useState(1)
  const [wordsPerPage, setWordsPerPage] = React.useState(20)
  const [totalPages, setTotalPages] = React.useState(1)
  const [reviewCount, setReviewCount] = React.useState(0)
  
  // دریافت پارامترهای URL
  React.useEffect(() => {
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
  React.useEffect(() => {
    setIsLoading(true)
    
    let filtered = [...words]
    const now = new Date()
    
    // فیلتر بر اساس تب فعال
    if (activeTab === "review") {
      filtered = filtered.filter(word => {
        if (!word.nextReviewAt) return false;
        const reviewDate = new Date(word.nextReviewAt);
        return !isNaN(reviewDate.getTime()) && reviewDate <= now;
      });
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
    const getValidDate = (dateStr: string | null | undefined) => {
      if (!dateStr) return 0;
      const date = new Date(dateStr);
      return isNaN(date.getTime()) ? 0 : date.getTime();
    };

    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => getValidDate(b.createdAt) - getValidDate(a.createdAt));
        break;
      case "oldest":
        filtered.sort((a, b) => getValidDate(a.createdAt) - getValidDate(b.createdAt));
        break;
      case "alphabetical":
        filtered.sort((a, b) => a.word.localeCompare(b.word));
        break;
      case "review_date":
        filtered.sort((a, b) => getValidDate(a.nextReviewAt) - getValidDate(b.nextReviewAt));
        break;
      default:
        filtered.sort((a, b) => getValidDate(b.createdAt) - getValidDate(a.createdAt));
    }
    
    // صفحه‌بندی
    setTotalPages(Math.ceil(filtered.length / wordsPerPage))
    
    // نمایش کلمات صفحه فعلی
    const startIndex = (currentPage - 1) * wordsPerPage
    const endIndex = startIndex + wordsPerPage
    const paginatedWords = filtered.slice(startIndex, endIndex)
    
    setFilteredWords(paginatedWords)
    
    // محاسبه تعداد کلمات نیازمند مرور
    const reviewableWords = words.filter(word => {
      if (!word.nextReviewAt) return false;
      const reviewDate = new Date(word.nextReviewAt);
      return !isNaN(reviewDate.getTime()) && reviewDate <= now;
    });
    setReviewCount(reviewableWords.length)
    
    setIsLoading(false)
  }, [words, searchQuery, selectedStatus, selectedLevel, sortBy, currentPage, wordsPerPage, activeTab])
  
  // به‌روزرسانی URL با پارامترهای فیلتر
  React.useEffect(() => {
    const params = new URLSearchParams()
    
    if (selectedStatus !== "all") params.set("status", selectedStatus)
    if (selectedLevel !== "all") params.set("level", selectedLevel)
    if (sortBy !== "newest") params.set("sort", sortBy)
    if (currentPage !== 1) params.set("page", currentPage.toString())
    if (searchQuery) params.set("q", searchQuery)
    if (activeTab !== "all") params.set("tab", activeTab)
    
    const url = `/vocabulary${params.toString() ? `?${params.toString()}` : ""}`
    router.push(url)
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

  const handleAddWord = async (newWord: BaseWord) => {
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) return

      const vocabularyWord: Word = {
        ...newWord,
        userId: userData.user.id,
        status: "learning",
        nextReviewAt: new Date().toISOString(),
        createdAt: new Date().toISOString()
      }

      setWords((prevWords: Word[]) => [vocabularyWord, ...prevWords])
    } catch (error) {
      console.error("Error handling word addition:", error)
    }
  }

  const _wordStats = wordStats
  const _filteredWords = filteredWords
  const _isLoading = isLoading
  const _isAddDialogOpen = isAddDialogOpen
  const _setIsAddDialogOpen = setIsAddDialogOpen
  const _setWordsPerPage = setWordsPerPage
  const _reviewCount = reviewCount
  const _clearAllFilters = clearAllFilters
  const _changePage = changePage
  const _addWord = addWord

  return (
    <div className="space-y-6">
      <WordSuggestions userLevel={userLevel} onAddWord={handleAddWord} />
      {/* Existing vocabulary management UI */}
    </div>
  )
}
