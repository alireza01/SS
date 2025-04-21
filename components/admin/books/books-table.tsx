"use client"

import { useState, ReactNode } from "react"

import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "sonner"

import { MoreHorizontal, Pencil, Trash, Search, BookOpen, FileText, Eye, Filter } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
  coverImage: string | null
  language: string
  level: string
  totalPages: number
  isPremium: boolean
  createdAt: string
  description?: string
}

interface BooksTableProps {
  books: Book[]
}

export function BooksTable({ books: initialBooks }: BooksTableProps) {
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [searchTerm, setSearchTerm] = useState("")
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [filterLevel, setFilterLevel] = useState<string | null>(null)
  const [filterPremium, setFilterPremium] = useState<boolean | null>(null)

  const router = useRouter()
  const supabase = createClient()

  // فیلتر کردن کتاب‌ها
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesLevel = filterLevel ? book.level === filterLevel : true
    const matchesPremium = filterPremium !== null ? book.isPremium === filterPremium : true

    return matchesSearch && matchesLevel && matchesPremium
  })

  // حذف کتاب
  const handleDeleteBook = async () => {
    if (!bookToDelete) return

    try {
      setIsLoading(true)

      // حذف کتاب از دیتابیس
      const { error } = await supabase.from("books").delete().eq("id", bookToDelete.id)

      if (error) throw error

      // به‌روزرسانی لیست کتاب‌ها
      setBooks(books.filter((book) => book.id !== bookToDelete.id))

      toast.success("کتاب با موفقیت حذف شد", {
        description: `کتاب "${bookToDelete.title}" با موفقیت حذف شد.`
      })

      // بستن دیالوگ
      setIsDeleteDialogOpen(false)
      setBookToDelete(null)

      // به‌روزرسانی صفحه
      window.location.reload()
    } catch (error) {
      console.error("خطا در حذف کتاب:", error)
      toast.error("خطا در حذف کتاب", {
        description: "مشکلی در حذف کتاب رخ داد. لطفاً دوباره تلاش کنید."
      })
    } finally {
      setIsLoading(false)
    }
  }

  // فرمت تاریخ
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
      <div className="flex flex-col justify-between gap-4 sm:flex-row">
        <div className="relative w-full sm:w-64">
          <Search className="text-muted-foreground absolute left-2 top-2.5 size-4" />
          <Input
            placeholder="جستجو..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>

        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 size-4" />
                سطح
                {filterLevel && (
                  <Badge variant="secondary" className="ml-2">
                    {filterLevel === "beginner" ? "مبتدی" : filterLevel === "intermediate" ? "متوسط" : "پیشرفته"}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterLevel(null)}>همه سطوح</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterLevel("beginner")}>مبتدی</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterLevel("intermediate")}>متوسط</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterLevel("advanced")}>پیشرفته</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Filter className="mr-2 size-4" />
                نوع
                {filterPremium !== null && (
                  <Badge variant="secondary" className="ml-2">
                    {filterPremium ? "ویژه" : "رایگان"}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setFilterPremium(null)}>همه کتاب‌ها</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPremium(true)}>کتاب‌های ویژه</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setFilterPremium(false)}>کتاب‌های رایگان</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>عنوان</TableHead>
              <TableHead>نویسنده</TableHead>
              <TableHead>سطح</TableHead>
              <TableHead>تعداد صفحات</TableHead>
              <TableHead>نوع</TableHead>
              <TableHead>تاریخ افزودن</TableHead>
              <TableHead className="text-right">عملیات</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredBooks.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="py-8 text-center">
                  <div className="flex flex-col items-center justify-center text-muted-foreground">
                    <BookOpen className="mb-2 size-12 opacity-20" />
                    <p>کتابی یافت نشد</p>
                    <p className="text-sm">می‌توانید کتاب جدیدی اضافه کنید یا معیارهای جستجو را تغییر دهید.</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell className="font-medium">{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    {book.level === "beginner" ? (
                      <Badge variant="default">مبتدی</Badge>
                    ) : book.level === "intermediate" ? (
                      <Badge variant="secondary">متوسط</Badge>
                    ) : (
                      <Badge variant="destructive">پیشرفته</Badge>
                    )}
                  </TableCell>
                  <TableCell>{book.totalPages}</TableCell>
                  <TableCell>
                    {book.isPremium ? (
                      <Badge variant="default">ویژه</Badge>
                    ) : (
                      <Badge variant="outline">رایگان</Badge>
                    )}
                  </TableCell>
                  <TableCell>{formatDate(book.createdAt)}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="size-4" />
                          <span className="sr-only">منو</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>عملیات</DropdownMenuLabel>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin-secure-dashboard-xyz123/books/edit/${book.id}`}>
                            <Pencil className="mr-2 size-4" />
                            ویرایش
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin-secure-dashboard-xyz123/books/${book.id}/pages`}>
                            <FileText className="mr-2 size-4" />
                            مدیریت صفحات
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/admin-secure-dashboard-xyz123/books/${book.id}/words`}>
                            <BookOpen className="mr-2 size-4" />
                            مدیریت واژگان
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link href={`/books/${book.id}`} target="_blank">
                            <Eye className="mr-2 size-4" />
                            مشاهده
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => {
                            setBookToDelete(book)
                            setIsDeleteDialogOpen(true)
                          }}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="mr-2 size-4" />
                          حذف
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

      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>حذف کتاب</DialogTitle>
            <DialogDescription>
              آیا از حذف کتاب "{bookToDelete?.title}" اطمینان دارید؟ این عمل غیرقابل بازگشت است و تمام اطلاعات مربوط به
              این کتاب حذف خواهد شد.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isLoading}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={handleDeleteBook} disabled={isLoading}>
              {isLoading ? "در حال حذف..." : "حذف"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
