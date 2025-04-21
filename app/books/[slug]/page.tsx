import { notFound } from "next/navigation"

import { BookDetails } from "@/components/books/book-details"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { createServerClient } from "@/lib/supabase/server"

import type { Metadata } from "next"

interface BookPageProps {
  params: {
    slug: string
  }
}

export async function generateMetadata({ params }: BookPageProps): Promise<Metadata> {
  const supabase = createServerClient()

  const { data: book } = await supabase
    .from("books")
    .select(`
      title,
      description,
      author:author_id(name)
    `)
    .eq("slug", params.slug)
    .single()

  if (!book) {
    return {
      title: "کتاب یافت نشد",
      description: "متأسفانه کتاب مورد نظر یافت نشد.",
    }
  }

  return {
    title: `${book.title} | کتاب‌یار`,
    description: book.description || `کتاب ${book.title} نوشته ${Array.isArray(book.author) ? book.author[0]?.name : book.author}`,
  }
}

export async function generateStaticParams() {
  const supabase = createServerClient()
  
  const { data: books } = await supabase
    .from("books")
    .select("slug")
    .eq("isActive", true)
  
  return books?.map((book) => ({
    slug: book.slug,
  })) || []
}

export default async function BookPage({ params }: BookPageProps) {
  const supabase = createServerClient()

  // Get book details
  const { data: book } = await supabase
    .from("books")
    .select("*, categories(name)")
    .eq("slug", params.slug)
    .single()

  if (!book) {
    notFound()
  }

  // Get user session
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Get user reading progress if logged in
  let userProgress = null
  if (session) {
    const { data: progress } = await supabase
      .from("reading_progress")
      .select("currentPage, lastReadAt")
      .eq("userId", session.user.id)
      .eq("bookId", book.id)
      .single()

    userProgress = progress
  }

  // Get related books
  const { data: relatedBooks } = await supabase
    .from("books")
    .select("id, title, author, coverImage, level")
    .eq("level", book.level)
    .eq("isActive", true)
    .neq("id", book.id)
    .limit(4)

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-gray-100/50 to-white">
      <SiteHeader />
      <main className="flex-1 pt-16">
        <BookDetails 
          book={book} 
          userProgress={userProgress} 
          relatedBooks={relatedBooks || []} 
          isLoggedIn={!!session} 
        />
      </main>
      <SiteFooter />
    </div>
  )
}