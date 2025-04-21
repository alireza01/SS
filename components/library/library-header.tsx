"use client"

import React from "react"
import { useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { motion } from "framer-motion"
import { Search, SlidersHorizontal, BookOpen, BookText, Lightbulb, Briefcase, Heart, Music } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface Category {
  id: number
  name: string
  slug: string
}

interface LibraryHeaderProps {
  categories: Category[]
}

export function LibraryHeader({ categories }: LibraryHeaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [searchQuery, setSearchQuery] = useState(searchParams.get("q") || "")
  const [activeCategory, setActiveCategory] = useState(searchParams.get("category") || "all")
  const [sortOrder, setSortOrder] = useState(searchParams.get("sort") || "newest")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()

    const params = new URLSearchParams()
    if (searchQuery) params.set("q", searchQuery)
    if (activeCategory !== "all") params.set("category", activeCategory)
    if (sortOrder !== "newest") params.set("sort", sortOrder)

    router.push(`/library?${params.toString()}`)
  }

  const handleCategoryChange = (value: string) => {
    setActiveCategory(value)

    const params = new URLSearchParams(searchParams.toString())
    if (value === "all") {
      params.delete("category")
    } else {
      params.set("category", value)
    }

    router.push(`/library?${params.toString()}`)
  }

  const handleSortChange = (value: string) => {
    setSortOrder(value)

    const params = new URLSearchParams(searchParams.toString())
    if (value === "newest") {
      params.delete("sort")
    } else {
      params.set("sort", value)
    }

    router.push(`/library?${params.toString()}`)
  }

  // Default category icons
  const categoryIcons = {
    all: <BookOpen className="ml-2 size-4" />,
    fiction: <BookText className="ml-2 size-4" />,
    "self-help": <Lightbulb className="ml-2 size-4" />,
    business: <Briefcase className="ml-2 size-4" />,
    romance: <Heart className="ml-2 size-4" />,
    biography: <Music className="ml-2 size-4" />,
  }

  return (
    <div className="from-gold-100 to-gold-50 bg-gradient-to-b px-4 py-12 dark:from-gray-800 dark:to-gray-900">
      <div className="container mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-gold-800 dark:text-gold-200 mb-4 text-3xl font-bold md:text-4xl">کتابخانه</h1>
          <p className="text-gold-700 dark:text-gold-300 mx-auto max-w-2xl">
            از میان صدها کتاب انگلیسی با ترجمه هوشمند، کتاب مورد نظر خود را پیدا کنید
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="mx-auto mb-8 max-w-3xl"
        >
          <form onSubmit={handleSearch}>
            <div className="relative">
              <Search className="text-gold-400 absolute right-3 top-1/2 size-5 -translate-y-1/2" />
              <Input
                placeholder="جستجوی کتاب، نویسنده یا موضوع..."
                className="border-gold-200 focus-visible:ring-gold-400 rounded-full py-6 pl-4 pr-10 text-lg shadow-md dark:border-gray-700"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button
                type="submit"
                className="from-gold-300 to-gold-400 absolute inset-y-1 left-1 rounded-full bg-gradient-to-r text-white shadow-md hover:opacity-90"
              >
                جستجو
              </Button>
            </div>
          </form>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8 flex flex-col items-center justify-between gap-4 md:flex-row"
        >
          <Tabs value={activeCategory} onValueChange={handleCategoryChange} className="w-full md:w-auto">
            <TabsList className="h-auto flex-wrap rounded-full bg-white/50 p-1 dark:bg-gray-900/50">
              <TabsTrigger
                value="all"
                className="data-[state=active]:from-gold-300 data-[state=active]:to-gold-400 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:text-white"
              >
                <BookOpen className="ml-2 size-4" />
                همه
              </TabsTrigger>

              {categories.map((category) => (
                <TabsTrigger
                  key={category.slug}
                  value={category.slug}
                  className="data-[state=active]:from-gold-300 data-[state=active]:to-gold-400 rounded-full data-[state=active]:bg-gradient-to-r data-[state=active]:text-white"
                >
                  {categoryIcons[category.slug as keyof typeof categoryIcons] || <BookText className="ml-2 size-4" />}
                  {category.name}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>

          <div className="flex w-full items-center gap-3 md:w-auto">
            <Select value={sortOrder} onValueChange={handleSortChange}>
              <SelectTrigger className="border-gold-200 focus:ring-gold-400 w-full md:w-[180px] dark:border-gray-700">
                <SelectValue placeholder="مرتب‌سازی" />
              </SelectTrigger>
              <SelectContent className="border-gold-200 dark:border-gray-700">
                <SelectItem value="newest">جدیدترین</SelectItem>
                <SelectItem value="popular">محبوب‌ترین</SelectItem>
                <SelectItem value="rating">بیشترین امتیاز</SelectItem>
                <SelectItem value="price-asc">قیمت: کم به زیاد</SelectItem>
                <SelectItem value="price-desc">قیمت: زیاد به کم</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" className="border-gold-200 dark:border-gray-700">
              <SlidersHorizontal className="size-4" />
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
