import { Suspense } from "react"


import { BookDetails } from "@/components/books/book-details"
import { BookDetailsLoading } from "@/components/books/book-details-loading"
import { ErrorBoundary } from "@/components/error-boundary"
import { SiteFooter } from "@/components/layout/site-footer"
import { SiteHeader } from "@/components/layout/site-header"
import { createServerClient } from "@/lib/supabase/server"

import type { Metadata } from "next"

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

interface SupabaseRelatedBook {
  id: string;
  title: string;
  author: { name: string | null }[] | null; // Corrected type
  cover_image: string | null;
  level: string;
  slug: string;
}

interface BookAuthor {
  id: string
  name: string
  bio: string | null
}

interface SupabaseBookCategory {
  category: {
    id: string;
    name: string;
    slug: string;
  };
}

interface BookCategory {
  id: string
  name: string
  slug: string
}

interface BookDetailsProps {
  book: Book
  userProgress: UserProgress | null
  relatedBooks: RelatedBook[]
  isLoggedIn: boolean
}

interface BookAuthorResponse {
  name: string | null
}

async function getBookData(slug: string): Promise<BookDetailsProps> {
  const supabase = await createServerClient()

  // Get book details with categories and author info
  const { data: bookData, error: bookError } = await supabase
    .from("books")
    .select(`
      *,
      categories:book_to_categories(
        category:book_categories(
          id,
          name,
          slug
        )
      ),
      author:author_id(
        id,
        name,
        bio
      )
    `)
    .eq("slug", slug)
    .single()

  if (bookError || !bookData) {
    // Instead of redirecting, we'll throw an error that will be caught by the error boundary
    throw new Error("Book not found")
  }

  // Get user progress
  const { data: userProgress } = await supabase
    .from("user_progress")
    .select("*")
    .eq("book_id", bookData.id)
    .single()

  // Get related books - now also selecting slug
  const { data: relatedBooks = [] }: { data: SupabaseRelatedBook[] | null } = await supabase
    .from("books")
    .select(`
      id,
      title,
      author:author_id(name),
      cover_image,
      level,
      slug
    `)
    .neq("id", bookData.id)
    .limit(4)

  // Get user session to determine login status
  const { data: { session } } = await supabase.auth.getSession()

  const book: Book = {
    id: bookData.id,
    title: bookData.title,
    description: bookData.description,
    coverImage: bookData.cover_image,
    language: bookData.language,
    level: bookData.level,
    totalPages: bookData.total_pages,
    isPremium: bookData.is_premium,
    publishedAt: bookData.published_at,
    createdAt: bookData.created_at,
    categories: bookData.categories?.map((c: SupabaseBookCategory) => c.category) || [],
    author: bookData.author?.name || "Unknown Author",
    slug: bookData.slug
  }

  // Ensure relatedBooks is never null and matches the RelatedBook interface
  const processedRelatedBooks: RelatedBook[] = (relatedBooks || []).map((book: SupabaseRelatedBook) => ({
    id: book.id,
    title: book.title,
    author: book.author?.[0]?.name ?? "Unknown Author",
    coverImage: book.cover_image,
    level: book.level,
    slug: book.slug
  }))

  return {
    book,
    userProgress: userProgress || null,
    relatedBooks: processedRelatedBooks,
    isLoggedIn: !!session
  }
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string }
}): Promise<Metadata> {
  try {
    const bookData = await getBookData(params.slug)
    return {
      title: bookData.book.title,
      description: bookData.book.description || undefined,
    }
  } catch (error) {
    return {
      title: "Book Not Found",
      description: "The requested book could not be found",
    }
  }
}

export async function generateStaticParams() {
  const supabase = await createServerClient()
  
  const { data: books } = await supabase
    .from("books")
    .select("slug")
    .eq("is_active", true)
  
  return (books || []).map((book) => ({
    slug: book.slug,
  }))
}

export default async function BookPage({ params }: { params: { slug: string } }) {
  const bookData = await getBookData(params.slug)

  return (
    <>
      <SiteHeader />
      <main className="container relative mx-auto min-h-screen w-full max-w-7xl px-6 py-16 lg:px-8 lg:py-20">
        <ErrorBoundary fallback={<div>Something went wrong</div>}>
          <Suspense fallback={<BookDetailsLoading />}>
            <BookDetails {...bookData} />
          </Suspense>
        </ErrorBoundary>
      </main>
      <SiteFooter />
    </>
  )
}