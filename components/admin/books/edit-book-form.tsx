"use client"

import React from "react"
import { useState } from "react"

import { useRouter } from "next/navigation"

import { format } from "date-fns-jalali"
import { CalendarIcon, Upload, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"


interface Category {
  id: string
  name: string
}

interface Book {
  id: string
  title: string
  author: string
  description: string | null
  coverImage: string | null
  language: string
  level: string
  totalPages: number
  categoryId: string | null
  isPremium: boolean
  isActive: boolean
  publishedAt: string | null
  createdAt: string
  updatedAt: string
}

interface EditBookFormProps {
  book: Book
  categories: Category[]
}

export function EditBookForm({ book, categories }: EditBookFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date | undefined>(book.publishedAt ? new Date(book.publishedAt) : undefined)
  const [isPremium, setIsPremium] = useState(book.isPremium)
  const [isActive, setIsActive] = useState(book.isActive)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(book.coverImage)
  const [bookFile, setBookFile] = useState<File | null>(null)

  // مدیریت آپلود تصویر جلد
  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setCoverFile(file)
      setCoverPreview(URL.createObjectURL(file))
    }
  }

  // مدیریت آپلود فایل کتاب
  const handleBookFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setBookFile(e.target.files[0])
    }
  }

  // ارسال فرم
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const title = formData.get("title") as string
      const author = formData.get("author") as string
      const description = formData.get("description") as string
      const language = formData.get("language") as string
      const category = formData.get("category") as string
      const level = formData.get("level") as string
      const pages = Number.parseInt(formData.get("pages") as string)
      const publishDate = date?.toISOString()

      // آپلود تصویر جلد جدید (اگر تغییر کرده باشد)
      let coverUrl = book.coverImage
      if (coverFile) {
        const coverFileName = `${Date.now()}-${coverFile.name}`
        const { data: coverData, error: coverError } = await supabase.storage
          .from("book-covers")
          .upload(coverFileName, coverFile)

        if (coverError) throw coverError

        const {
          data: { publicUrl },
        } = supabase.storage.from("book-covers").getPublicUrl(coverFileName)

        coverUrl = publicUrl
      }

      // به‌روزرسانی کتاب
      const { error: bookError } = await supabase
        .from("books")
        .update({
          title,
          author,
          description,
          language,
          categoryId: category,
          level,
          totalPages: pages,
          coverImage: coverUrl,
          publishedAt: publishDate,
          isPremium,
          isActive,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", book.id)

      if (bookError) throw bookError

      // آپلود فایل کتاب جدید (اگر تغییر کرده باشد)
      if (bookFile) {
        const bookFileName = `${book.id}/${Date.now()}-${bookFile.name}`
        const { error: fileError } = await supabase.storage.from("book-files").upload(bookFileName, bookFile)

        if (fileError) throw fileError
      }

      toast.success("کتاب با موفقیت به‌روزرسانی شد")
      router.push("/admin/books")
    } catch (error) {
      console.error("خطا در به‌روزرسانی کتاب:", error)
      toast.error("خطا در به‌روزرسانی کتاب")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">ویرایش کتاب</h1>
        <Button variant="outline" onClick={() => router.push("/admin/books")}>
          <ArrowLeft className="ml-2 size-4" />
          بازگشت به لیست کتاب‌ها
        </Button>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>اطلاعات کتاب</CardTitle>
              <CardDescription>اطلاعات اصلی کتاب را ویرایش کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="title">عنوان کتاب</Label>
                  <Input
                    id="title"
                    name="title"
                    defaultValue={book.title}
                    placeholder="عنوان کتاب را وارد کنید"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">نویسنده</Label>
                  <Input
                    id="author"
                    name="author"
                    defaultValue={book.author}
                    placeholder="نام نویسنده را وارد کنید"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">توضیحات</Label>
                <Textarea
                  id="description"
                  name="description"
                  defaultValue={book.description || ""}
                  placeholder="توضیحات کتاب را وارد کنید"
                  rows={5}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="language">زبان</Label>
                  <Select name="language" defaultValue={book.language}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب زبان" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">انگلیسی</SelectItem>
                      <SelectItem value="persian">فارسی</SelectItem>
                      <SelectItem value="arabic">عربی</SelectItem>
                      <SelectItem value="french">فرانسوی</SelectItem>
                      <SelectItem value="german">آلمانی</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">دسته‌بندی</Label>
                  <Select name="category" defaultValue={book.categoryId || undefined}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب دسته‌بندی" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="fiction">داستانی</SelectItem>
                          <SelectItem value="non-fiction">غیرداستانی</SelectItem>
                          <SelectItem value="science">علمی</SelectItem>
                          <SelectItem value="history">تاریخی</SelectItem>
                          <SelectItem value="biography">زندگی‌نامه</SelectItem>
                          <SelectItem value="self-help">خودیاری</SelectItem>
                          <SelectItem value="business">کسب و کار</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="level">سطح</Label>
                  <Select name="level" defaultValue={book.level}>
                    <SelectTrigger>
                      <SelectValue placeholder="انتخاب سطح" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">مبتدی</SelectItem>
                      <SelectItem value="intermediate">متوسط</SelectItem>
                      <SelectItem value="advanced">پیشرفته</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="pages">تعداد صفحات</Label>
                  <Input
                    id="pages"
                    name="pages"
                    type="number"
                    min="1"
                    defaultValue={book.totalPages}
                    placeholder="تعداد صفحات"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>تاریخ انتشار</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className={cn("w-full justify-start text-right font-normal", !date && "text-muted-foreground")}
                      >
                        <CalendarIcon className="ml-2 size-4" />
                        {date ? format(date, "yyyy/MM/dd") : "انتخاب تاریخ"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>نوع دسترسی</Label>
                  <div className="flex items-center space-x-2 space-x-reverse pt-2">
                    <Switch id="premium" checked={isPremium} onCheckedChange={setIsPremium} />
                    <Label htmlFor="premium" className="mr-2">
                      {isPremium ? "نسخه ویژه (پولی)" : "نسخه رایگان"}
                    </Label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>وضعیت</Label>
                  <div className="flex items-center space-x-2 space-x-reverse pt-2">
                    <Switch id="active" checked={isActive} onCheckedChange={setIsActive} />
                    <Label htmlFor="active" className="mr-2">
                      {isActive ? "فعال" : "غیرفعال"}
                    </Label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تصویر جلد و فایل‌ها</CardTitle>
              <CardDescription>تصویر جلد و فایل‌های کتاب را به‌روزرسانی کنید.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>تصویر جلد</Label>
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
                  {coverPreview ? (
                    <div className="flex flex-col items-center">
                      <div className="relative mb-4 h-56 w-40">
                        <img
                          src={coverPreview || "/placeholder.svg"}
                          alt="پیش‌نمایش جلد"
                          className="size-full rounded-md object-cover"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => document.getElementById("cover")?.click()}
                        >
                          تغییر تصویر
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setCoverFile(null)
                            setCoverPreview(null)
                          }}
                        >
                          حذف تصویر
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      <Upload className="mb-2 size-10 text-gray-400" />
                      <p className="text-sm text-gray-500 dark:text-gray-400">فایل تصویر را اینجا بکشید یا کلیک کنید</p>
                      <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">PNG، JPG یا WEBP (حداکثر 2MB)</p>
                      <Input
                        id="cover"
                        name="cover"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleCoverChange}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => document.getElementById("cover")?.click()}
                      >
                        انتخاب فایل
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label>فایل کتاب</Label>
                <div className="rounded-lg border-2 border-dashed border-gray-300 p-6 text-center dark:border-gray-700">
                  <div className="flex flex-col items-center">
                    {bookFile ? (
                      <>
                        <div className="bg-muted mb-4 flex w-full items-center justify-center rounded-md p-2">
                          <p className="truncate text-sm font-medium">{bookFile.name}</p>
                        </div>
                        <Button type="button" variant="outline" size="sm" onClick={() => setBookFile(null)}>
                          حذف فایل
                        </Button>
                      </>
                    ) : (
                      <>
                        <Upload className="mb-2 size-10 text-gray-400" />
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          فایل کتاب را اینجا بکشید یا کلیک کنید
                        </p>
                        <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">PDF، EPUB یا TXT (حداکثر 50MB)</p>
                        <Input
                          id="book-file"
                          name="book-file"
                          type="file"
                          accept=".pdf,.epub,.txt"
                          className="hidden"
                          onChange={handleBookFileChange}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="mt-4"
                          onClick={() => document.getElementById("book-file")?.click()}
                        >
                          انتخاب فایل
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>محتوای کتاب</CardTitle>
            <CardDescription>برای ویرایش محتوای کتاب، به بخش مدیریت واژگان کتاب مراجعه کنید.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" asChild>
              <a href={`/admin/books/${book.id}/words`}>مدیریت واژگان کتاب</a>
            </Button>
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end">
          <Button type="submit" className="bg-[#D29E64] text-white hover:bg-[#BE8348]" disabled={isSubmitting}>
            {isSubmitting ? "در حال ذخیره..." : "به‌روزرسانی کتاب"}
          </Button>
        </div>
      </form>
    </div>
  )
}
