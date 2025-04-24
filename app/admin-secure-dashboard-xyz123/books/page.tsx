import { Suspense } from "react"

import Link from "next/link"


import { Plus, MoreVertical, Pencil, Trash2, Eye } from "lucide-react"

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
import { createServerClient } from "@/lib/supabase/app-server"
import type { Database } from "@/types/supabase"

type Book = Database["public"]["Tables"]["books"]["Row"]

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
async function BooksTable({ searchQuery = "" }: { searchQuery?: string }) {
  const supabase = await createServerClient()
  
  let query = supabase
    .from("books")
    .select<string, Book>()
    
  if (searchQuery) {
    query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`)
  }
  
  const { data: books, error } = await query.order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching books:", error)
    return <div className="text-red-500">Failed to load books</div>
  }

  if (!books || books.length === 0) {
    return <div className="text-muted-foreground">No books found</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <form action="" className="w-64">
          <Input
            name="search"
            placeholder="جستجو در کتاب‌ها..."
            defaultValue={searchQuery}
          />
        </form>
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
            {books.map((book: Book) => (
              <TableRow key={book.id}>
                <TableCell className="font-medium">{book.title}</TableCell>
                <TableCell>{book.author}</TableCell>
                <TableCell>
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    book.level === "beginner" ? "bg-primary text-primary-foreground" :
                    book.level === "intermediate" ? "bg-secondary text-secondary-foreground" :
                    "bg-destructive text-destructive-foreground"
                  }`}>
                    {book.level === "beginner" ? "مبتدی" :
                     book.level === "intermediate" ? "متوسط" :
                     "پیشرفته"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    book.is_active ? "bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100" :
                    "bg-secondary text-secondary-foreground"
                  }`}>
                    {book.is_active ? "منتشر شده" : "پیش‌نویس"}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    <p>{book.read_count || 0} خواننده</p>
                    <p className="text-muted-foreground">
                      {Math.round((book.rating || 0) * 100)}% رضایت
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

export default function BooksPage({
  searchParams
}: {
  searchParams?: { search?: string }
}) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مدیریت کتاب‌ها</h1>
      </div>

      <Suspense fallback={<BooksTableSkeleton />}>
        <BooksTable searchQuery={searchParams?.search} />
      </Suspense>
    </div>
  )
}
