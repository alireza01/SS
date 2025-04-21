import { Suspense } from "react"

import Link from "next/link"

import { Plus, MoreVertical, Pencil, Trash2, Eye } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { createServerClient } from "@/lib/supabase/server"
import type { Book } from "@/types/books"

// Loading skeleton for the books table
function BooksTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-10 w-32 animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-16 w-full animate-pulse rounded bg-gray-200 dark:bg-gray-700" />
        ))}
      </div>
    </div>
  )
}

// Books table with real data
async function BooksTable() {
  const supabase = createServerClient()

  const { data: books } = await supabase
    .from("books")
    .select(`
      *,
      book_statistics (
        total_readers,
        completed_readers,
        average_progress
      )
    `)
    .order("created_at", { ascending: false })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Input
          placeholder="جستجو در کتاب‌ها..."
          className="w-64"
        />
        <Link href="/admin-secure-dashboard-xyz123/books/add">
          <Button>
            <Plus className="ml-2 size-4" />
            افزودن کتاب
          </Button>
        </Link>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead>نویسنده</TableHead>
              <TableHead>سطح</TableHead>
              <TableHead>وضعیت</TableHead>
              <TableHead>آمار خوانندگان</TableHead>
              <TableHead>تاریخ ایجاد</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books?.map((book: Book) => (
              <TableRow key={book.id}>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>
                  <Badge variant={
                    book.difficulty_level === "beginner" ? "default" :
                    book.difficulty_level === "intermediate" ? "secondary" :
                    "destructive"
                  }>
                    {book.difficulty_level === "beginner" ? "مبتدی" :
                     book.difficulty_level === "intermediate" ? "متوسط" :
                     "پیشرفته"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={book.is_published ? "success" : "secondary"}>
                    {book.is_published ? "منتشر شده" : "پیش‌نویس"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{book.book_statistics?.[0]?.total_readers || 0} خواننده</p>
                    <p className="text-muted-foreground">
                      {book.book_statistics?.[0]?.completed_readers || 0} تکمیل شده
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {new Date(book.created_at).toLocaleDateString("fa-IR")}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="size-8 p-0">
                        <MoreVertical className="size-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem asChild>
                        <Link href={`/admin-secure-dashboard-xyz123/books/${book.id}`}>
                          <Eye className="ml-2 size-4" />
                          مشاهده
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link href={`/admin-secure-dashboard-xyz123/books/edit/${book.id}`}>
                          <Pencil className="ml-2 size-4" />
                          ویرایش
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="ml-2 size-4" />
                        حذف
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}

export default function BooksPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مدیریت کتاب‌ها</h1>
      </div>

      <Suspense fallback={<BooksTableSkeleton />}>
        <BooksTable />
      </Suspense>
    </div>
  )
}