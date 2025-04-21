"use client"

import { useState } from "react"

import Link from "next/link"
import { useRouter } from "next/navigation"

import {
  Search,
  Plus,
  MoreHorizontal,
  Pencil,
  Trash,
  FileText,
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Eye,
} from "lucide-react"
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
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { createClient } from "@/lib/supabase/client"


interface Book {
  id: string
  title: string
  author: string
  language: string
  level: string
  totalPages: number
  readers: number
  isActive: boolean
}

interface AdminBooksClientProps {
  initialBooks: Book[]
}

export function AdminBooksClient({ initialBooks }: AdminBooksClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [books, setBooks] = useState<Book[]>(initialBooks)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLanguage, setSelectedLanguage] = useState<string>("all")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isDeleting, setIsDeleting] = useState(false)
  const [bookToDelete, setBookToDelete] = useState<Book | null>(null)

  // فیلتر کردن کتاب‌ها
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLanguage = selectedLanguage === "all" || book.language === selectedLanguage
    const matchesLevel = selectedLevel === "all" || book.level === selectedLevel
    const matchesStatus = selectedStatus === "all" || (selectedStatus === "active" ? book.isActive : !book.isActive)

    return matchesSearch && matchesLanguage && matchesLevel && matchesStatus
  })

  // محاسبه صفحه‌بندی
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredBooks.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredBooks.length / itemsPerPage)

  // تغییر صفحه
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  // حذف کتاب
  const handleDeleteBook = async () => {
    if (!bookToDelete) return

    try {
      setIsDeleting(true)
      const { error } = await supabase.from("books").delete().eq("id", bookToDelete.id)

      if (error) throw error

      setBooks(books.filter((book) => book.id !== bookToDelete.id))
      toast.success("کتاب با موفقیت حذف شد")
    } catch (error) {
      console.error("خطا در حذف کتاب:", error)
      toast.error("خطا در حذف کتاب")
    } finally {
      setIsDeleting(false)
      setBookToDelete(null)
    }
  }

  // تغییر وضعیت کتاب (فعال/غیرفعال)
  const toggleBookStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from("books").update({ isActive: !currentStatus }).eq("id", id)

      if (error) throw error

      setBooks(books.map((book) => (book.id === id ? { ...book, isActive: !currentStatus } : book)))
      toast.success("وضعیت کتاب با موفقیت تغییر کرد")
    } catch (error) {
      console.error("خطا در تغییر وضعیت کتاب:", error)
      toast.error("خطا در تغییر وضعیت کتاب")
    }
  }

  // استخراج زبان‌های منحصر به فرد
  const uniqueLanguages = Array.from(new Set(books.map((book) => book.language)))

  // تولید شماره‌های صفحه برای صفحه‌بندی
  const pageNumbers = []
  for (let i = 1; i <= totalPages; i++) {
    pageNumbers.push(i)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مدیریت کتاب‌ها</h1>
        <Button className="bg-[#D29E64] text-white hover:bg-[#BE8348]" asChild>
          <Link href="/admin/books/add">
            <Plus className="ml-2 size-4" />
            افزودن کتاب جدید
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-4 md:flex-row">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
          <Input
            placeholder="جستجو بر اساس عنوان یا نویسنده..."
            className="pl-3 pr-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="زبان" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه زبان‌ها</SelectItem>
              {uniqueLanguages.map((language) => (
                <SelectItem key={language} value={language}>
                  {language === "english"
                    ? "انگلیسی"
                    : language === "persian"
                      ? "فارسی"
                      : language === "arabic"
                        ? "عربی"
                        : language}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedLevel} onValueChange={setSelectedLevel}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="سطح" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه سطوح</SelectItem>
              <SelectItem value="beginner">مبتدی</SelectItem>
              <SelectItem value="intermediate">متوسط</SelectItem>
              <SelectItem value="advanced">پیشرفته</SelectItem>
            </SelectContent>
          </Select>

          <Select value={selectedStatus} onValueChange={setSelectedStatus}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="وضعیت" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">همه وضعیت‌ها</SelectItem>
              <SelectItem value="active">فعال</SelectItem>
              <SelectItem value="inactive">غیرفعال</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-gray-800">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-12 text-center">#</TableHead>
                <TableHead>عنوان کتاب</TableHead>
                <TableHead>نویسنده</TableHead>
                <TableHead className="text-center">زبان</TableHead>
                <TableHead className="text-center">سطح</TableHead>
                <TableHead className="text-center">صفحات</TableHead>
                <TableHead className="text-center">خوانندگان</TableHead>
                <TableHead className="text-center">وضعیت</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {currentItems.length > 0 ? (
                currentItems.map((book, index) => (
                  <TableRow key={book.id}>
                    <TableCell className="text-center font-medium">{indexOfFirstItem + index + 1}</TableCell>
                    <TableCell className="font-medium">{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell className="text-center">
                      {book.language === "english"
                        ? "انگلیسی"
                        : book.language === "persian"
                          ? "فارسی"
                          : book.language === "arabic"
                            ? "عربی"
                            : book.language}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge
                        variant="outline"
                        className={
                          book.level === "beginner"
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                            : book.level === "intermediate"
                              ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                              : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
                        }
                      >
                        {book.level === "beginner" ? "مبتدی" : book.level === "intermediate" ? "متوسط" : "پیشرفته"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">{book.totalPages}</TableCell>
                    <TableCell className="text-center">{book.readers}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={book.isActive ? "default" : "secondary"}>
                        {book.isActive ? "فعال" : "غیرفعال"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-end space-x-2 space-x-reverse">
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/books/${book.id}`}>
                            <Eye className="size-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/books/${book.id}/words`}>
                            <FileText className="size-4" />
                          </Link>
                        </Button>
                        <Button variant="ghost" size="icon" asChild>
                          <Link href={`/admin/books/edit/${book.id}`}>
                            <Pencil className="size-4" />
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/books/${book.id}/read?page=1`} className="flex items-center">
                                <BookOpen className="ml-2 size-4" />
                                مشاهده کتاب
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => toggleBookStatus(book.id, book.isActive)}
                              className="flex items-center"
                            >
                              <Eye className="ml-2 size-4" />
                              {book.isActive ? "غیرفعال کردن" : "فعال کردن"}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => setBookToDelete(book)}
                              className="flex items-center text-red-600"
                            >
                              <Trash className="ml-2 size-4" />
                              حذف
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="py-6 text-center">
                    <div className="text-muted-foreground flex flex-col items-center justify-center">
                      <BookOpen className="mb-2 size-10" />
                      <p>هیچ کتابی یافت نشد</p>
                      <p className="text-sm">کتاب جدیدی اضافه کنید یا معیارهای جستجو را تغییر دهید</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {filteredBooks.length > 0 && (
          <div className="flex items-center justify-between border-t border-gray-200 px-4 py-3 dark:border-gray-700">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              نمایش {indexOfFirstItem + 1} تا {Math.min(indexOfLastItem, filteredBooks.length)} از{" "}
              {filteredBooks.length} کتاب
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronRight className="size-4" />
              </Button>
              {pageNumbers.map((number) => (
                <Button
                  key={number}
                  variant={currentPage === number ? "default" : "outline"}
                  size="sm"
                  className="px-4"
                  onClick={() => paginate(number)}
                >
                  {number}
                </Button>
              ))}
              <Button
                variant="outline"
                size="icon"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                <ChevronLeft className="size-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <AlertDialog open={!!bookToDelete} onOpenChange={(open) => !open && setBookToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف این کتاب اطمینان دارید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عمل غیرقابل بازگشت است. کتاب &quot;{bookToDelete?.title}&quot; و تمام داده‌های مرتبط با آن حذف خواهند
              شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>انصراف</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteBook}
              disabled={isDeleting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isDeleting ? "در حال حذف..." : "حذف کتاب"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
