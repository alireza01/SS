import { BookReader } from "@/components/reader/book-reader"
import { TextSelectionHandler } from "@/components/reader/text-selection-handler"
import { createServerClient } from "@/lib/supabase/server"

interface ReadPageProps {
  params: {
    slug: string
  }
  searchParams: {
    page?: string
    level?: string
  }
}

export default async function ReadPage({ 
  params: { _slug },
  searchParams 
}: ReadPageProps) {
  const _supabase = createServerClient()
  const page = searchParams.page ? Number.parseInt(searchParams.page) : 1
  const level = searchParams.level || "intermediate"

  // در یک پروژه واقعی، اطلاعات کتاب از دیتابیس دریافت می‌شود
  // const { data: book, error } = await _supabase
  //   .from("books")
  //   .select("id, title, author")
  //   .eq("slug", _slug)
  //   .single()

  // if (error || !book) {
  //   notFound()
  // }

  // استفاده از داده‌های نمونه
  const book = {
    id: "1",
    title: "اتم‌های عادت",
    author: "جیمز کلیر",
  }

  return (
    <div className="relative">
      <BookReader bookId={book.id} initialPage={page} userLevel={level as "beginner" | "intermediate" | "advanced"} />
      <TextSelectionHandler bookId={book.id} bookTitle={book.title} author={book.author} />
    </div>
  )
}
