import { Suspense } from "react"

import { notFound } from "next/navigation"

import { LibraryClient } from "@/components/library/library-client"
import { LibraryHeader } from "@/components/library/library-header"
import { Skeleton } from "@/components/ui/skeleton"
import { createServerClient } from "@/lib/supabase/server"
import { type Book } from "@/types/books"

export const metadata = {
  title: "کتابخانه | کتاب‌یار",
  description: "مجموعه کتاب‌های انگلیسی با امکان ترجمه هوشمند",
}

async function getCategories() {
  const supabase = createServerClient()

  const { data, error } = await supabase.from("categories").select("id, name, slug").order("name")

  if (error) {
    console.error("Error fetching categories:", error)
    return []
  }

  return data || []
}

async function getBooks(category?: string, level?: string, search?: string) {
  const supabase = createServerClient()

  let query = supabase.from("books").select(`
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
      createdAt
    `)

  if (category) {
    query = query.eq("categoryId", category)
  }

  if (level) {
    query = query.eq("level", level)
  }

  if (search) {
    query = query.or(`title.ilike.%${search}%,author.ilike.%${search}%`)
  }

  const { data, error } = await query.order("createdAt", { ascending: false })

  if (error) {
    console.error("Error fetching books:", error)
    return []
  }

  return data || []
}

async function getUserProgress() {
  const supabase = createServerClient()
  
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.user) return []

  const { data, error } = await supabase
    .from("user_progress")
    .select("bookId, currentPage")
    .eq("userId", session.session.user.id)

  if (error) {
    console.error("Error fetching user progress:", error)
    return []
  }

  return data || []
}

async function getUserBookmarks() {
  const supabase = createServerClient()
  
  const { data: session } = await supabase.auth.getSession()
  if (!session?.session?.user) return []

  const { data, error } = await supabase
    .from("bookmarks")
    .select("bookId")
    .eq("userId", session.session.user.id)

  if (error) {
    console.error("Error fetching bookmarks:", error)
    return []
  }

  return data?.map(b => b.bookId) || []
}

export default async function LibraryPage({
  searchParams,
}: {
  searchParams: { category?: string; level?: string; search?: string }
}) {
  const { category, level, search } = searchParams

  return (
    <div className="container py-8">
      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryHeader categories={await getCategories()} />
      </Suspense>

      <Suspense fallback={<LibrarySkeleton />}>
        <LibraryContent category={category} level={level} search={search} />
      </Suspense>
    </div>
  )
}

async function LibraryContent({
  category,
  level,
  search,
}: {
  category?: string
  level?: string
  search?: string
}) {
  const [categories, books, userProgress, userBookmarks] = await Promise.all([
    getCategories(),
    getBooks(category, level, search),
    getUserProgress(),
    getUserBookmarks(),
  ])

  if (!categories.length && !books.length) {
    notFound()
  }

  const isLoggedIn = userProgress.length > 0 || userBookmarks.length > 0

  return (
    <LibraryClient
      initialBooks={books}
      categories={categories}
      userProgress={userProgress}
      isLoggedIn={isLoggedIn}
    />
  )
}

function LibrarySkeleton() {
  return (
    <div className="space-y-8 mt-8">
      <div className="flex gap-4 flex-wrap">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-10 w-24" />
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[360px]" />
        ))}
      </div>
    </div>
  )
}