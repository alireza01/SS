import { BookOpen, BookMarked, BookText, TrendingUp } from "lucide-react"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface BookStatsProps {
  stats: {
    totalBooks: number
    totalPages: number
    totalReads: number
    premiumBooks: number
    freeBooks: number
    mostReadBook: {
      title: string
      author: string
      reads: number
    } | null
  }
}

export function BookStats({ stats }: BookStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">کل کتاب‌ها</CardTitle>
          <BookOpen className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalBooks}</div>
          <p className="text-muted-foreground text-xs">
            {stats.premiumBooks} کتاب ویژه و {stats.freeBooks} کتاب رایگان
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">کل صفحات</CardTitle>
          <BookText className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalPages}</div>
          <p className="text-muted-foreground text-xs">
            میانگین {Math.round(stats.totalPages / (stats.totalBooks || 1))} صفحه برای هر کتاب
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">تعداد مطالعه</CardTitle>
          <BookMarked className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalReads}</div>
          <p className="text-muted-foreground text-xs">
            میانگین {Math.round(stats.totalReads / (stats.totalBooks || 1))} مطالعه برای هر کتاب
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">پرمخاطب‌ترین کتاب</CardTitle>
          <TrendingUp className="text-muted-foreground size-4" />
        </CardHeader>
        <CardContent>
          <div className="truncate text-2xl font-bold">{stats.mostReadBook ? stats.mostReadBook.title : "نامشخص"}</div>
          <p className="text-muted-foreground text-xs">
            {stats.mostReadBook
              ? `${stats.mostReadBook.reads} مطالعه - ${stats.mostReadBook.author}`
              : "هنوز کتابی مطالعه نشده است"}
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
