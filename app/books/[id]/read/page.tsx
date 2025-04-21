import { redirect } from "next/navigation"

import { ReadingAssistant } from "@/components/ai/reading-assistant"
import { BookReaderWithFlip } from "@/components/reader/page-flip/book-reader-with-flip"
import { createServerClient } from "@/lib/supabase/server"

import type { Metadata, ResolvingMetadata } from "next"

interface ReadPageProps {
  params: {
    id: string
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
  const bookId = params.id
  const supabase = createServerClient()

  // دریافت اطلاعات کتاب
  const { data: book } = await supabase.from("books").select("title, author").eq("id", bookId).single()

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

export default async function ReadPage({ 
  params: { id },
  searchParams: _searchParams,
  parent: _parent 
}: ReadPageProps) {
  const bookId = id
  const page = _searchParams.page ? Number.parseInt(_searchParams.page) : 1
  const isPreview = _searchParams.preview === "true"
  const interactiveFlip = _searchParams.interactiveFlip !== "false" // Default to true

  const supabase = createServerClient()

  // دریافت اطلاعات کتاب
  const { data: book } = await supabase.from("books").select("*").eq("id", bookId).single()

  if (!book) {
    redirect("/library")
  }

  // بررسی احراز هویت کاربر
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // اگر کتاب ویژه است و کاربر لاگین نیست یا در حالت پیش‌نمایش نیست، به صفحه جزئیات کتاب هدایت می‌شود
  if (book.isPremium && (!session || !isPreview)) {
    // بررسی خرید کتاب
    if (session) {
      const { data: purchase } = await supabase
        .from("purchases")
        .select("id")
        .eq("userId", session.user.id)
        .eq("bookId", bookId)
        .maybeSingle()

      // اگر کاربر کتاب را خریداری نکرده است، به صفحه جزئیات کتاب هدایت می‌شود
      if (!purchase) {
        redirect(`/books/${bookId}`)
      }
    } else {
      redirect(`/books/${bookId}`)
    }
  }

  // دریافت محتوای کتاب
  const { data: contents } = await supabase
    .from("book_contents")
    .select("page, content")
    .eq("bookId", bookId)
    .order("page", { ascending: true })

  if (!contents || contents.length === 0) {
    redirect(`/books/${bookId}`)
  }

  // دریافت پیشرفت مطالعه کاربر
  let userProgress = null
  if (session) {
    const { data: progress } = await supabase
      .from("reading_progress")
      .select("currentPage, lastReadAt, readingTime")
      .eq("userId", session.user.id)
      .eq("bookId", bookId)
      .maybeSingle()

    userProgress = progress
  }

  // دریافت تنظیمات خواندن کاربر
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

  // ثبت بازدید کتاب
  if (session) {
    await supabase
      .from("book_views")
      .insert({
        userId: session.user.id,
        bookId: bookId,
        page: page,
        viewedAt: new Date().toISOString(),
      })
      .onConflict(["userId", "bookId", "page"])
      .ignore()
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
