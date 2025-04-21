import { redirect } from "next/navigation"

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
    redirect("/auth/login?callbackUrl=/admin-secure-dashboard-xyz123")
  }

  // دریافت اطلاعات کتاب
  const { data: book } = await supabase
    .from("books")
    .select("id, title, author")
    .eq("slug", slug)
    .single()

  if (!book) {
    redirect("/admin-secure-dashboard-xyz123/books")
  }

  // دریافت کلمات دشوار کتاب
  const { data: words } = await supabase
    .from("book_words")
    .select("*")
    .eq("bookId", book.id)
    .order("createdAt", { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت واژگان کتاب</h1>
          <p className="text-muted-foreground">
            {book.title} - {book.author}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div>
          <WordDefinitionGenerator bookId={book.id} />
        </div>

        <div>
          <WordsList words={words || []} bookId={book.id} />
        </div>
      </div>
    </div>
  )
}
