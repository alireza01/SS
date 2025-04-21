import { BookOpen, Users, BookText, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createServerClient } from "@/lib/supabase/app-server"

export default async function AdminDashboard() {
  const supabase = createServerClient()

  // Fetch real statistics from Supabase
  const [
    { count: totalBooks },
    { count: totalUsers },
    { count: totalWords },
    { data: popularBooks },
    { data: popularWords }
  ] = await Promise.all([
    supabase.from("books").select("*", { count: "exact", head: true }),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
    supabase.from("words").select("*", { count: "exact", head: true }),
    supabase
      .from("book_reads")
      .select("book_id, books(title), count")
      .group("book_id, books(title)")
      .order("count", { ascending: false })
      .limit(5),
    supabase
      .from("word_searches")
      .select("word, count")
      .order("count", { ascending: false })
      .limit(5)
  ])

  // Calculate active readers (users who read in last 30 days)
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { count: activeReaders } = await supabase
    .from("book_reads")
    .select("user_id", { count: "exact", head: true })
    .gt("read_at", thirtyDaysAgo.toISOString())

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">داشبورد مدیریت</h1>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">کتاب‌ها</CardTitle>
            <BookOpen className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalBooks || 0}</div>
            {/* Monthly stats would require additional query */}
            <p className="text-muted-foreground text-xs">مجموع کتاب‌های موجود</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">کاربران</CardTitle>
            <Users className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsers || 0}</div>
            <p className="text-muted-foreground text-xs">مجموع کاربران ثبت‌نام شده</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">واژگان</CardTitle>
            <BookText className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalWords || 0}</div>
            <p className="text-muted-foreground text-xs">مجموع واژگان ثبت شده</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">خوانندگان فعال</CardTitle>
            <TrendingUp className="text-muted-foreground size-4" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReaders || 0}</div>
            <p className="text-muted-foreground text-xs">در 30 روز گذشته</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>کتاب‌های پرطرفدار</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularBooks?.map((book) => (
                <div key={book.book_id} className="flex items-center">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{book.books.title}</p>
                      <span className="text-muted-foreground text-sm">{book.count} خواننده</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div 
                        className="h-full rounded-full bg-[#D29E64]" 
                        style={{ 
                          width: `${(book.count / (popularBooks[0]?.count || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>واژگان پرجستجو</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {popularWords?.map((word) => (
                <div key={word.word} className="flex items-center">
                  <div className="w-full">
                    <div className="flex items-center justify-between">
                      <p className="font-medium">{word.word}</p>
                      <span className="text-muted-foreground text-sm">{word.count} جستجو</span>
                    </div>
                    <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                      <div 
                        className="h-full rounded-full bg-purple-500" 
                        style={{ 
                          width: `${(word.count / (popularWords[0]?.count || 1)) * 100}%` 
                        }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
