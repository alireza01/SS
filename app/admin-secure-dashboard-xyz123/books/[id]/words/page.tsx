import { NextResponse } from "next/server"

import { WordDefinitionGenerator } from "@/components/ai/word-definition-generator"
import { WordsList } from "@/components/words-list"
import { createServerClient } from "@/lib/supabase/server"

interface WordsPageProps {
  params: {
    slug: string
  }
}

export default async function WordsPage({ params }: WordsPageProps) {
  const { slug } = params
  const supabase = await createServerClient()

  // بررسی احراز هویت کاربر
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.redirect(new URL("/auth/login?callbackUrl=/admin-secure-dashboard-xyz123", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  }

  // دریافت اطلاعات کتاب
  const { data: bookData } = await supabase
    .from("books")
    .select("*")  // Select all fields to match the Book type
    .eq("slug", slug)
    .single()

  if (!bookData) {
    return NextResponse.redirect(new URL("/admin-secure-dashboard-xyz123/books", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"))
  }

  // دریافت کلمات دشوار کتاب
  const { data: words } = await supabase
    .from("book_words")
    .select("*")
    .eq("bookId", bookData.id)
    .order("createdAt", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت واژگان کتاب</h1>
          <p className="text-muted-foreground">
            {bookData.title} - {bookData.author}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <WordDefinitionGenerator bookId={bookData.id} />
        </div>

        <div>
          <WordsList words={words || []} bookId={bookData.id} />
        </div>
      </div>
    </div>
  )
}
