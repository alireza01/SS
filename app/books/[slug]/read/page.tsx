import { redirect } from "next/navigation"

import { ReadingAssistant } from "@/components/ai/reading-assistant"
import { BookReaderWithFlip } from "@/components/reader/page-flip/book-reader-with-flip"
import { createServerClient } from "@/lib/supabase/server"

import type { Metadata } from "next"

interface ReadPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
    preview?: string
    interactiveFlip?: string
  }
}

export async function generateMetadata(
  { params }: ReadPageProps,
): Promise<Metadata> {
  const supabase = await createServerClient()

  // Get book details
  const { data: book } = await supabase
    .from("books")
    .select(`
      title,
      author:author_id(name)
    `)
    .eq("slug", params.slug)
    .single()

  if (!book) {
    return {
      title: "مطالعه کتاب | کتاب‌یار",
      description: "پلتفرم مطالعه آنلاین کتاب‌یار",
    }
  }

  const authorData = book.author as { name: string | null } | { name: string | null }[]
  const authorName = Array.isArray(authorData) 
    ? authorData[0]?.name || "نویسنده ناشناس"
    : authorData?.name || "نویسنده ناشناس"

  return {
    title: `مطالعه ${book.title} | کتاب‌یار`,
    description: `مطالعه کتاب ${book.title} نوشته ${authorName} در پلتفرم کتاب‌یار`,
    openGraph: {
      title: `مطالعه ${book.title} | کتاب‌یار`,
      description: `مطالعه کتاب ${book.title} نوشته ${authorName} در پلتفرم کتاب‌یار`,
      type: "article",
      authors: [authorName],
    },
  }
}

export async function generateStaticParams() {
  const supabase = await createServerClient()
  
  const { data: books } = await supabase
    .from("books")
    .select("*")
    .eq("is_active", true)
    .eq("is_premium", false) // Only pre-render free books
  
  return (books || []).map((book) => ({
    slug: book.slug,
  }))
}

export default async function ReadPage({ 
  params: { slug },
  searchParams: _searchParams,
}: Omit<ReadPageProps, 'parent'>) {
  const page = _searchParams.page ? Number.parseInt(_searchParams.page) : 1
  const isPreview = _searchParams.preview === "true"
  const interactiveFlip = _searchParams.interactiveFlip !== "false" // Default to true

  const supabase = await createServerClient()

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
  if (book.is_premium && (!session || !isPreview)) {
    // Check if user has purchased the book
    if (session) {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("user_id", session.user.id)
        .eq("book_id", book.id)
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
    .eq("book_id", book.id)
    .order("page", { ascending: true })

  if (!contents || contents.length === 0) {
    redirect(`/books/${slug}`)
  }

  // Transform contents to ensure type safety
  const typedContents = (contents ?? []).map(item => ({
    page: Number(item.page),
    content: String(item.content)
  }))

  // Get user reading progress
  let userProgress = null
  if (session) {
    const { data: progress } = await supabase
      .from("reading_progress")
      .select("current_page, last_read_at, reading_time")
      .eq("user_id", session.user.id)
      .eq("book_id", book.id)
      .maybeSingle()

    userProgress = progress
  }

  // Get user reading settings
  let interactiveFlipEnabled = true
  if (session) {
    const { data: settings } = await supabase
      .from("reading_settings")
      .select("interactive_flip_enabled")
      .eq("user_id", session.user.id)
      .maybeSingle()

    if (settings) {
      interactiveFlipEnabled = settings.interactive_flip_enabled
    }
  }

  // Record book view
  if (session) {
    await supabase
      .from("book_views")
      .upsert({
        user_id: session.user.id,
        book_id: book.id,
        page: page,
        viewed_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id,book_id,page'
      })
  }

  // Inside ReadPage function, transform userProgress before passing to BookReaderWithFlip
  const transformedUserProgress = userProgress ? {
    currentPage: userProgress.current_page,
    lastReadAt: userProgress.last_read_at,
  } : null

  return (
    <div className="container mx-auto py-4">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <BookReaderWithFlip
            book={book}
            contents={typedContents}
            currentPage={page}
            isPreview={isPreview}
            maxPreviewPages={5}
            userProgress={transformedUserProgress}
            isLoggedIn={!!session}
            interactiveFlipEnabled={interactiveFlipEnabled && interactiveFlip}
          />
        </div>

        <div className="space-y-8">
          {session && (
            <ReadingAssistant 
              bookTitle={book.title} 
              author={book.author_id} 
              userLevel="intermediate" 
              currentPage={page} 
            />
          )}
        </div>
      </div>
    </div>
  )
}
