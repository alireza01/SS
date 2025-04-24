"use client"

import { useState, useEffect } from "react"

import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"

interface Book {
  id: string
  title: string
  author: string
  coverImage: string | null
  description: string
  language: string
  level: string
  totalPages: number
  isPremium: boolean
  categoryId: string
  createdAt: string
  rating: number
  category: {
    id: string
    name: string
    slug: string
  }
  created_at: string
  difficulty_level: string
  is_published: boolean
}

interface Category {
  id: string
  name: string
  slug: string
}

export function Categories() {
  const [activeCategory, setActiveCategory] = useState("all")
  const [books, setBooks] = useState<Book[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchData() {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("categories")
          .select("*")
          .order("name")

        if (categoriesError) throw categoriesError
        setCategories(categoriesData)

        const { data: booksData, error: booksError } = await supabase
          .from("books")
          .select(`
            id,
            title,
            author,
            coverImage,
            description,
            language,
            level,
            totalPages,
            isPremium,
            categoryId,
            createdAt,
            rating,
            category:categories(id, name, slug),
            created_at,
            difficulty_level,
            is_published
          `)
          .eq("isActive", true)
          .order("rating", { ascending: false })
          .limit(8)

        if (booksError) throw booksError
        
        const formattedBooks: Book[] = (booksData || []).map(book => ({
          ...book,
          category: book.category[0],
          created_at: book.created_at || book.createdAt,
          difficulty_level: book.difficulty_level || book.level,
          is_published: book.is_published || true
        }))
        
        setBooks(formattedBooks)
      } catch (error) {
        console.error("Error fetching data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredBooks = activeCategory === "all" 
    ? books 
    : books.filter(book => book.category?.slug === activeCategory)

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-10 w-24" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-48" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <Tabs defaultValue="all" value={activeCategory} onValueChange={setActiveCategory}>
      <TabsList className="flex gap-2 overflow-x-auto pb-2">
        <TabsTrigger value="all">همه</TabsTrigger>
        {categories.map((category) => (
          <TabsTrigger key={category.id} value={category.slug}>
            {category.name}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value={activeCategory} className="mt-6">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
          {filteredBooks.map((book) => (
            <Card key={book.id} className="overflow-hidden">
              <div className="relative aspect-[2/3]">
                <img
                  src={book.coverImage || "/images/book-placeholder.svg"}
                  alt={book.title}
                  className="size-full object-cover"
                />
                <div className="absolute right-2 top-2 rounded-full bg-white/90 px-2 py-1 text-xs font-medium dark:bg-gray-800/90">
                  {book.rating?.toFixed(1) || "N/A"}
                </div>
              </div>
              <div className="p-3">
                <h3 className="line-clamp-1 text-sm font-medium">{book.title}</h3>
                <p className="text-muted-foreground text-xs">{book.author}</p>
              </div>
            </Card>
          ))}
        </div>
      </TabsContent>
    </Tabs>
  )
}