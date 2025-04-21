"use client"

import { useState } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"

import { MoreHorizontal, Search, Plus, Pencil, Trash, BookOpen, FileText } from "lucide-react"
import { toast } from "sonner"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"


interface Book {
  id: string
  title: string
  author: string
  coverImage: string
  language: string
  level: string
  totalPages: number
  isPremium: boolean
  createdAt: string
  description: string
}

interface BooksTableClientProps {
  initialBooks: Book[]
}

export function BooksTableClient({ initialBooks }: BooksTableClientProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [searchQuery, setSearchQuery] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // فیلتر کردن کتاب‌ها بر اساس جستجو
  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  // حذف کتاب
  const deleteBook = async (id: string) => {
    setIsLoading(true)
    try {
      // حذف کتاب از دیتابیس
      const { error } = await supabase.from("books").delete().eq("id", id)

      if (error) throw error

      // به‌روزرسانی لیست کتاب‌ها
      setBooks(books.filter((book) => book.id !== id))
      toast.success("کتاب با موفقیت حذف شد")
    } catch (error) {
      console.error("خطا در حذف کتاب:", error)
      toast.error("خطا در حذف کتاب")
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
      setBookToDelete(null)
    }
  }

  // تبدیل تاریخ به فرمت فارسی
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date)
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative w-full max-w-sm">
          <Search className="text-muted-foreground absolute left-2.5 top-2.5 size-4" />
          <Input
            type="search"
            placeholder="جستجوی کتاب..."
            className="w-full pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button asChild>
          <Link href="/admin-secure-dashboard-xyz123/books/add">
            <Plus className="mr-2 size-4" /> افزودن کتاب
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">تصویر</TableHead>
              <TableHead>عنوان</TableHead>
              <TableHead>نویسنده</TableHead>
              <TableHead>زبان</TableHead>
              <TableHead>سطح</TableHead>
              <TableHead>صفحات</TableHead>
              <TableHead>نوع</TableHead>
              <TableHead>تاریخ افزودن</TableHead>
              <TableHead className="text-left">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  کتابی یافت نشد.
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div className="h-10 w-8 overflow-hidden rounded">
                      {book.coverImage ? (
                        <img
                          src={book.coverImage || "/placeholder.svg"}
                          alt={book.title}
                          className="size-full object-cover"
                        />
                      ) : (
                        <div className="bg-muted flex size-full items-center justify-center">
                          <BookOpen className="text-muted-foreground size-4" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.language}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={
                        book.level === "beginner"
                          ? "border-green-500 text-green-600"
                          : book.level === "intermediate"
                            ? "border-blue-500 text-blue-600"
                            : "border-purple-500 text-purple-600"
                      }
                    >
                      {book.level === "beginner" ? "مبتدی" : book.level === "intermediate" ? "متوسط" : "پیشرفته"}
                    </Badge>
                  </TableCell>
                  <TableCell>{book.totalPages}</TableCell>
                  <TableCell>
                    <Badge variant={book.isPremium ? "default" : "secondary"}>
                      {book.isPremium ? "ویژه" : "رایگان"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(book.createdAt)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="size-8 p-0">
                          <span className="sr-only">باز کردن منو</span>
                          <MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/admin-secure-dashboard-xyz123/books/edit/${book.id}`}>
                            <Pencil className="mr-2 size-4" />
                            <span>ویرایش</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin-secure-dashboard-xyz123/books/${book.id}/words`}>
                            <FileText className="mr-2 size-4" />
                            <span>مدیریت واژگان</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-red-600"
                          onClick={() => {
                            setBookToDelete(book.id)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="mr-2 size-4" />
                          <span>حذف</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف این کتاب مطمئن هستید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عمل غیرقابل بازگشت است. این کتاب به طور دائمی از سرور حذف خواهد شد و تمام داده‌های مرتبط با آن از بین
              خواهد رفت.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => bookToDelete && deleteBook(bookToDelete)}
              disabled={isLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {isLoading ? "در حال حذف..." : "بله، حذف شود"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
