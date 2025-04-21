import { notFound, redirect } from "next/navigation"

import { ReadingAssistant } from "@/components/ai/reading-assistant"
import { BookReaderWithFlip } from "@/components/reader/page-flip/book-reader-with-flip"
import { createServerClient } from "@/lib/supabase/server"

import type { Metadata, ResolvingMetadata } from "next"

interface ReadPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
    preview?: string
    interactiveFlip?: string
  }
  parent: ResolvingMetadata
}

export async function generateMetadata(
  { params, searchParams }: ReadPageProps,
  parent: ResolvingMetadata,
): Promise<Metadata> {
  const supabase = createServerClient()

  // Get book details
  const { data: book } = await supabase
    .from("books")
    .select("title, author")
    .eq("slug", params.slug)
    .single()

  if (!book) {
    return {
      title: "مطالعه کتاب | کتاب‌یار",
      description: "پلتفرم مطالعه آنلاین کتاب‌یار",
    }
  }

  return {
    title: `مطالعه ${book.title} | کتاب‌یار`,
    description: `مطالعه کتاب ${book.title} نوشته ${book.author} در پلتفرم کتاب‌یار`,
    openGraph: {
      title: `مطالعه ${book.title} | کتاب‌یار`,
      description: `مطالعه کتاب ${book.title} نوشته ${book.author} در پلتفرم کتاب‌یار`,
      type: "article",
      authors: [book.author],
    },
  }
}

export async function generateStaticParams() {
  const supabase = createServerClient()
  
  const { data: books } = await supabase
    .from("books")
    .select("slug")
    .eq("isActive", true)
    .eq("isPremium", false) // Only pre-render free books
  
  return books?.map((book) => ({
    slug: book.slug,
  })) || []
}

export default async function ReadPage({ 
  params: { slug },
  searchParams: _searchParams,
  parent: _parent 
}: ReadPageProps) {
  const page = _searchParams.page ? Number.parseInt(_searchParams.page) : 1
  const isPreview = _searchParams.preview === "true"
  const interactiveFlip = _searchParams.interactiveFlip !== "false" // Default to true

  const supabase = createServerClient()

  // Get book details
  const { data: book } = await supabase
    .from("books")
    .select("*")
    .eq("slug", slug)
    .single()

  if (!book) {
    redirect("/library")
  }

  // Check user authentication
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // If book is premium and user is not logged in or not in preview mode, redirect to book details
  if (book.isPremium && (!session || !isPreview)) {
    // Check if user has purchased the book
    if (session) {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("userId", session.user.id)
        .eq("bookId", book.id)
        .maybeSingle()

      // If user hasn't purchased the book, redirect to book details
      if (!purchase) {
        redirect(`/books/${slug}`)
      }
    } else {
      redirect(`/books/${slug}`)
    }
  }

  // Get book contents
  const { data: contents } = await supabase
    .from("book_contents")
    .select("page, content")
    .eq("bookId", book.id)
    .order("page", { ascending: true })

  if (!contents || contents.length === 0) {
    redirect(`/books/${slug}`)
  }

  // Get user reading progress
  let userProgress = null
  if (session) {
    const { data: progress } = await supabase
      .from("reading_progress")
      .select("currentPage, lastReadAt, readingTime")
      .eq("userId", session.user.id)
      .eq("bookId", book.id)
      .maybeSingle()

    userProgress = progress
  }

  // Get user reading settings
  let interactiveFlipEnabled = true
  if (session) {
    const { data: settings } = await supabase
      .from("reading_settings")
      .select("interactiveFlipEnabled")
      .eq("userId", session.user.id)
      .maybeSingle()

    if (settings) {
      interactiveFlipEnabled = settings.interactiveFlipEnabled
    }
  }

  // Record book view
  if (session) {
    await supabase
      .from("book_views")
      .upsert({
        userId: session.user.id,
        bookId: book.id,
        page: page,
        viewedAt: new Date().toISOString(),
      }, {
        onConflict: 'userId,bookId,page'
      })
  }

  return (
    <div className="container mx-auto py-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BookReaderWithFlip
            book={book}
            contents={contents}
            currentPage={page}
            isPreview={isPreview}
            maxPreviewPages={5}
            userProgress={userProgress}
            isLoggedIn={!!session}
            interactiveFlipEnabled={interactiveFlipEnabled && interactiveFlip}
          />
        </div>

        <div className="space-y-8">
          {session && (
            <ReadingAssistant bookTitle={book.title} author={book.author} userLevel="intermediate" currentPage={page} />
          )}
        </div>
      </div>
    </div>
  )
}
