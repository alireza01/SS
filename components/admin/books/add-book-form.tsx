"use client"

import React from "react"
import { useState, useRef } from "react"

import { useRouter } from "next/navigation"

import { format } from "date-fns-jalali"
import { Upload, CalendarIcon, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"


interface Category {
  id: string
  name: string
}

interface AddBookFormProps {
  categories: Category[]
}

export function AddBookForm({ categories }: AddBookFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [date, setDate] = useState<Date>()
  const [isPremium, setIsPremium] = useState(false)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [bookFile, setBookFile] = useState<File | null>(null)
  const [bookContent, setBookContent] = useState("")
  const [activeTab, setActiveTab] = useState("info")
  const [selectedWord, setSelectedWord] = useState("")
  const [wordMeaning, setWordMeaning] = useState("")
  const [wordLevel, setWordLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate")
  const [wordExplanation, setWordExplanation] = useState("")
  const [definedWords, setDefinedWords] = useState<
    { word: string; meaning: string; level: string; explanation: string }[]
  >([])
  const contentRef = useRef<HTMLDivElement>(null)

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
      const file = e.target.files[0]
      setBookFile(file)

      // خواندن محتوای فایل
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target?.result) {
          setBookContent(event.target.result as string)
        }
      }
      reader.readAsText(file)
    }
  }

  // انتخاب کلمه در متن
  const handleTextSelection = () => {
    const selection = window.getSelection()
    if (selection && selection.toString().trim()) {
      setSelectedWord(selection.toString().trim())
    }
  }

  // افزودن معنی کلمه
  const addWordDefinition = () => {
    if (!selectedWord || !wordMeaning) {
      toast.error("لطفاً کلمه و معنی آن را وارد کنید")
      return
    }

    // افزودن کلمه به لیست
    setDefinedWords([
      ...definedWords,
      {
        word: selectedWord,
        meaning: wordMeaning,
        level: wordLevel,
        explanation: wordExplanation,
      },
    ])

    // پاک کردن فیلدها
    setSelectedWord("")
    setWordMeaning("")
    setWordExplanation("")
    setWordLevel("intermediate")

    toast.success("معنی کلمه اضافه شد")
  }

  // حذف معنی کلمه
  const removeWordDefinition = (word: string) => {
    setDefinedWords(definedWords.filter((w) => w.word !== word))
    toast.success("معنی کلمه حذف شد")
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

      // آپلود تصویر جلد
      let coverUrl = null
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

      // ایجاد کتاب جدید
      const { data: book, error: bookError } = await supabase
        .from("books")
        .insert({
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
          isActive: true,
        })
        .select()
        .single()

      if (bookError) throw bookError

      // آپلود محتوای کتاب
      if (bookContent && book) {
        // تقسیم محتوا به صفحات
        const contentPages = splitContentIntoPages(bookContent, 500) // هر صفحه حدود 500 کاراکتر

        // ذخیره صفحات در دیتابیس
        for (let i = 0; i < contentPages.length; i++) {
          await supabase.from("book_contents").insert({
            bookId: book.id,
            page: i + 1,
            content: contentPages[i],
          })
        }

        // به‌روزرسانی تعداد صفحات کتاب
        await supabase.from("books").update({ totalPages: contentPages.length }).eq("id", book.id)
      }

      // ذخیره معانی کلمات
      if (definedWords.length > 0 && book) {
        for (const word of definedWords) {
          await supabase.from("book_words").insert({
            bookId: book.id,
            word: word.word,
            meaning: word.meaning,
            explanation: word.explanation,
            level: word.level,
          })
        }
      }

      toast.success("کتاب با موفقیت اضافه شد")
      router.push("/admin-secure-dashboard-xyz123/books")
    } catch (error) {
      console.error("خطا در افزودن کتاب:", error)
      toast.error("خطا در افزودن کتاب")
    } finally {
      setIsSubmitting(false)
    }
  }

  // تقسیم محتوا به صفحات
  const splitContentIntoPages = (content: string, charsPerPage: number): string[] => {
    const pages: string[] = []
    let currentPage = ""
    const paragraphs = content.split(/\n\s*\n/)

    for (const paragraph of paragraphs) {
      if (currentPage.length + paragraph.length > charsPerPage) {
        pages.push(currentPage)
        currentPage = paragraph
      } else {
        currentPage += (currentPage ? "\n\n" : "") + paragraph
      }
    }

    if (currentPage) {
      pages.push(currentPage)
    }

    return pages
  }

  // هایلایت کلمات تعریف شده در متن
  const highlightDefinedWords = (text: string): string => {
    let highlightedText = text

    definedWords.forEach((word) => {
      const regex = new RegExp(`\\b${word.word}\\b`, "gi")
      let colorClass = ""

      switch (word.level) {
        case "beginner":
          colorClass = "word-beginner"
          break
        case "intermediate":
          colorClass = "word-intermediate"
          break
        case "advanced":
          colorClass = "word-advanced"
          break
      }

      highlightedText = highlightedText.replace(
        regex,
        `<span class="word ${colorClass}" data-word="${word.word}">$&</span>`,
      )
    })

    return highlightedText
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">افزودن کتاب جدید</h1>
        <Button variant="outline" onClick={() => router.push("/admin-secure-dashboard-xyz123/books")}>
          بازگشت به لیست کتاب‌ها
        </Button>
      </div>

      <Tabs defaultValue="info" value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="info">اطلاعات کتاب</TabsTrigger>
          <TabsTrigger value="content">محتوای کتاب</TabsTrigger>
          <TabsTrigger value="words">تعریف واژگان</TabsTrigger>
        </TabsList>

        <form onSubmit={handleSubmit}>
          <TabsContent value="info" className="mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>اطلاعات کتاب</CardTitle>
                  <CardDescription>اطلاعات اصلی کتاب را وارد کنید.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="title">عنوان کتاب</Label>
                      <Input id="title" name="title" placeholder="عنوان کتاب را وارد کنید" required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="author">نویسنده</Label>
                      <Input id="author" name="author" placeholder="نام نویسنده را وارد کنید" required />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">توضیحات</Label>
                    <Textarea id="description" name="description" placeholder="توضیحات کتاب را وارد کنید" rows={5} />
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div className="space-y-2">
                      <Label htmlFor="language">زبان</Label>
                      <Select name="language" defaultValue="english">
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
                      <Select name="category">
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
                      <Select name="level" defaultValue="intermediate">
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
                      <Input id="pages" name="pages" type="number" min="1" placeholder="تعداد صفحات" required />
                    </div>

                    <div className="space-y-2">
                      <Label>تاریخ انتشار</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-right font-normal",
                              !date && "text-muted-foreground",
                            )}
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

                  <div className="space-y-2">
                    <Label>نوع دسترسی</Label>
                    <div className="flex items-center space-x-2 space-x-reverse pt-2">
                      <Switch id="premium" checked={isPremium} onCheckedChange={setIsPremium} />
                      <Label htmlFor="premium" className="mr-2">
                        {isPremium ? "نسخه ویژه (پولی)" : "نسخه رایگان"}
                      </Label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تصویر جلد و فایل‌ها</CardTitle>
                  <CardDescription>تصویر جلد و فایل‌های کتاب را آپلود کنید.</CardDescription>
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
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="mb-2 size-10 text-gray-400" />
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            فایل تصویر را اینجا بکشید یا کلیک کنید
                          </p>
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
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500">TXT (حداکثر 10MB)</p>
                            <Input
                              id="book-file"
                              name="book-file"
                              type="file"
                              accept=".txt"
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
          </TabsContent>

          <TabsContent value="content" className="mt-4">
            <Card>
              <CardHeader>
                <CardTitle>محتوای کتاب</CardTitle>
                <CardDescription>محتوای کتاب را وارد یا ویرایش کنید.</CardDescription>
              </CardHeader>
              <CardContent>
                {bookContent ? (
                  <div className="space-y-4">
                    <div className="max-h-96 overflow-y-auto rounded-md border p-4">
                      <div
                        ref={contentRef}
                        className="prose prose-sm max-w-none"
                        dangerouslySetInnerHTML={{ __html: bookContent.replace(/\n/g, "<br />") }}
                        onMouseUp={handleTextSelection}
                      />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      برای ویرایش محتوا، فایل جدیدی آپلود کنید یا متن را در تب اطلاعات کتاب وارد کنید.
                    </p>
                  </div>
                ) : (
                  <div className="py-12 text-center">
                    <p className="text-muted-foreground mb-4">هنوز محتوایی برای کتاب وارد نشده است.</p>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setActiveTab("info")
                        setTimeout(() => document.getElementById("book-file")?.click(), 100)
                      }}
                    >
                      آپلود فایل کتاب
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="words" className="mt-4">
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>تعریف واژگان</CardTitle>
                  <CardDescription>کلمات را انتخاب کنید و معنی آن‌ها را وارد کنید.</CardDescription>
                </CardHeader>
                <CardContent>
                  {bookContent ? (
                    <div className="space-y-4">
                      <div className="max-h-96 overflow-y-auto rounded-md border p-4">
                        <div
                          ref={contentRef}
                          className="prose prose-sm max-w-none"
                          dangerouslySetInnerHTML={{
                            __html: highlightDefinedWords(bookContent.replace(/\n/g, "<br />")),
                          }}
                          onMouseUp={handleTextSelection}
                        />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        متن را انتخاب کنید تا کلمه در فیلد زیر وارد شود. سپس معنی و توضیحات آن را وارد کنید.
                      </p>
                    </div>
                  ) : (
                    <div className="py-12 text-center">
                      <p className="text-muted-foreground mb-4">ابتدا محتوای کتاب را وارد کنید.</p>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setActiveTab("content")
                        }}
                      >
                        وارد کردن محتوای کتاب
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>افزودن معنی کلمه</CardTitle>
                    <CardDescription>معنی و توضیحات کلمه انتخاب شده را وارد کنید.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="selected-word">کلمه انتخاب شده</Label>
                      <Input
                        id="selected-word"
                        value={selectedWord}
                        onChange={(e) => setSelectedWord(e.target.value)}
                        placeholder="کلمه را انتخاب کنید یا وارد کنید"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="word-meaning">معنی کلمه</Label>
                      <Input
                        id="word-meaning"
                        value={wordMeaning}
                        onChange={(e) => setWordMeaning(e.target.value)}
                        placeholder="معنی کلمه را وارد کنید"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="word-level">سطح دشواری</Label>
                      <Select value={wordLevel} onValueChange={(value: any) => setWordLevel(value)}>
                        <SelectTrigger>
                          <SelectValue placeholder="انتخاب سطح دشواری" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="beginner">مبتدی</SelectItem>
                          <SelectItem value="intermediate">متوسط</SelectItem>
                          <SelectItem value="advanced">پیشرفته</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="word-explanation">توضیحات (اختیاری)</Label>
                      <Textarea
                        id="word-explanation"
                        value={wordExplanation}
                        onChange={(e) => setWordExplanation(e.target.value)}
                        placeholder="توضیحات بیشتر درباره کلمه"
                        rows={3}
                      />
                    </div>
                    <Button
                      type="button"
                      onClick={addWordDefinition}
                      disabled={!selectedWord || !wordMeaning}
                      className="w-full"
                    >
                      افزودن معنی کلمه
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>کلمات تعریف شده</CardTitle>
                    <CardDescription>لیست کلماتی که معنی آن‌ها را تعریف کرده‌اید.</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {definedWords.length === 0 ? (
                      <p className="text-muted-foreground py-4 text-center">هنوز کلمه‌ای تعریف نشده است.</p>
                    ) : (
                      <div className="space-y-2">
                        {definedWords.map((word, index) => (
                          <div
                            key={index}
                            className="hover:bg-muted/50 flex items-center justify-between rounded-md border p-2"
                          >
                            <div>
                              <p className="font-medium">{word.word}</p>
                              <p className="text-muted-foreground text-sm">{word.meaning}</p>
                              <div className="mt-1 flex items-center">
                                <span
                                  className={`rounded-full px-2 py-0.5 text-xs ${
                                    word.level === "beginner"
                                      ? "bg-green-100 text-green-800"
                                      : word.level === "intermediate"
                                        ? "bg-blue-100 text-blue-800"
                                        : "bg-purple-100 text-purple-800"
                                  }`}
                                >
                                  {word.level === "beginner"
                                    ? "مبتدی"
                                    : word.level === "intermediate"
                                      ? "متوسط"
                                      : "پیشرفته"}
                                </span>
                              </div>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => removeWordDefinition(word.word)}
                              className="text-red-500 hover:bg-red-100 hover:text-red-700"
                            >
                              حذف
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <div className="mt-6 flex justify-end">
            <Button type="submit" className="bg-[#D29E64] text-white hover:bg-[#BE8348]" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  در حال ذخیره...
                </>
              ) : (
                "ذخیره کتاب"
              )}
            </Button>
          </div>
        </form>
      </Tabs>

      <style jsx global>{`
        .word {
          cursor: pointer;
          position: relative;
        }
        
        .word-beginner {
          border-bottom: 2px solid rgba(74, 222, 128, 0.8);
        }
        
        .word-intermediate {
          border-bottom: 2px solid rgba(59, 130, 246, 0.8);
        }
        
        .word-advanced {
          border-bottom: 2px solid rgba(168, 85, 247, 0.8);
        }
        
        .word:hover {
          background-color: rgba(209, 213, 219, 0.2);
        }
      `}</style>
    </div>
  )
}
