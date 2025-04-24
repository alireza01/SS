"use client"

import { useState } from "react"

import { useRouter } from "next/navigation"

import { Search, Plus, Pencil, Trash, ArrowLeft } from "lucide-react"
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"


interface Book {
  id: string
  title: string
  author: string
}

interface Word {
  id: string
  bookId: string
  word: string
  meaning: string
  level: string
  createdAt: string
  updatedAt: string
}

interface BookWordsManagerProps {
  book: Book
  initialWords: Word[]
}

export function BookWordsManager({ book, initialWords }: BookWordsManagerProps) {
  const router = useRouter()
  const supabase = createClient()
  const [words, setWords] = useState<Word[]>(initialWords)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedLevel, setSelectedLevel] = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [currentWord, setCurrentWord] = useState<Word | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // فیلتر کردن واژگان
  const filteredWords = words.filter((word) => {
    const matchesSearch =
      word.word.toLowerCase().includes(searchQuery.toLowerCase()) ||
      word.meaning.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesLevel = selectedLevel === "all" || word.level === selectedLevel

    return matchesSearch && matchesLevel
  })

  // افزودن واژه جدید
  const handleAddWord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const wordText = formData.get("word") as string
      const meaning = formData.get("meaning") as string
      const level = formData.get("level") as string

      const { data, error } = await supabase
        .from("book_words")
        .insert({
          bookId: book.id,
          word: wordText,
          meaning,
          level,
        })
        .select()
        .single()

      if (error) throw error

      setWords([...words, data])
      setIsAddDialogOpen(false)
      toast.success("واژه با موفقیت اضافه شد")
    } catch (error) {
      console.error("خطا در افزودن واژه:", error)
      toast.error("خطا در افزودن واژه")
    } finally {
      setIsSubmitting(false)
    }
  }

  // ویرایش واژه
  const handleEditWord = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!currentWord) return
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const wordText = formData.get("word") as string
      const meaning = formData.get("meaning") as string
      const level = formData.get("level") as string

      const { data, error } = await supabase
        .from("book_words")
        .update({
          word: wordText,
          meaning,
          level,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", currentWord.id)
        .select()
        .single()

      if (error) throw error

      setWords(words.map((w) => (w.id === currentWord.id ? data : w)))
      setIsEditDialogOpen(false)
      setCurrentWord(null)
      toast.success("واژه با موفقیت ویرایش شد")
    } catch (error) {
      console.error("خطا در ویرایش واژه:", error)
      toast.error("خطا در ویرایش واژه")
    } finally {
      setIsSubmitting(false)
    }
  }

  // حذف واژه
  const handleDeleteWord = async () => {
    if (!currentWord) return
    setIsSubmitting(true)

    try {
      const { error } = await supabase.from("book_words").delete().eq("id", currentWord.id)

      if (error) throw error

      setWords(words.filter((w) => w.id !== currentWord.id))
      setIsDeleteDialogOpen(false)
      setCurrentWord(null)
      toast.success("واژه با موفقیت حذف شد")
    } catch (error) {
      console.error("خطا در حذف واژه:", error)
      toast.error("خطا در حذف واژه")
    } finally {
      setIsSubmitting(false)
    }
  }

  // تنظیم رنگ سطح دشواری
  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300"
    }
  }

  // تبدیل سطح دشواری به فارسی
  const getLevelText = (level: string) => {
    switch (level) {
      case "beginner":
        return "مبتدی"
      case "intermediate":
        return "متوسط"
      case "advanced":
        return "پیشرفته"
      default:
        return level
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">مدیریت واژگان کتاب</h1>
          <p className="text-muted-foreground">
            کتاب: {book.title} | نویسنده: {book.author}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push("/admin/books")}>
            <ArrowLeft className="ml-2 size-4" />
            بازگشت به لیست کتاب‌ها
          </Button>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#D29E64] text-white hover:bg-[#BE8348]">
                <Plus className="ml-2 size-4" />
                افزودن واژه جدید
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>افزودن واژه جدید</DialogTitle>
                <DialogDescription>واژه جدیدی به کتاب «{book.title}» اضافه کنید.</DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddWord}>
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="word">واژه انگلیسی</Label>
                    <Input id="word" name="word" placeholder="واژه انگلیسی را وارد کنید" required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="meaning">معنی و توضیحات (فارسی)</Label>
                    <Textarea
                      id="meaning"
                      name="meaning"
                      placeholder="معنی و توضیحات واژه را به فارسی وارد کنید"
                      rows={4}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="level">سطح دشواری</Label>
                    <Select name="level" defaultValue="intermediate">
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
                </div>
                <DialogFooter>
                  <DialogClose asChild>
                    <Button type="button" variant="outline">
                      انصراف
                    </Button>
                  </DialogClose>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "در حال ذخیره..." : "افزودن واژه"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>فیلتر و جستجو</CardTitle>
          <CardDescription>واژگان را بر اساس معیارهای مختلف فیلتر کنید.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-gray-500" />
              <Input
                placeholder="جستجو در واژگان..."
                className="pl-3 pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="سطح دشواری" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">همه سطوح</SelectItem>
                <SelectItem value="beginner">مبتدی</SelectItem>
                <SelectItem value="intermediate">متوسط</SelectItem>
                <SelectItem value="advanced">پیشرفته</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[50px]">#</TableHead>
                <TableHead>واژه</TableHead>
                <TableHead>معنی و توضیحات</TableHead>
                <TableHead className="w-[150px]">سطح دشواری</TableHead>
                <TableHead className="w-[120px] text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredWords.length > 0 ? (
                filteredWords.map((word, index) => (
                  <TableRow key={word.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell className="font-bold">{word.word}</TableCell>
                    <TableCell>
                      <div className="line-clamp-2 max-w-md">{word.meaning}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={getLevelColor(word.level)}>
                        {getLevelText(word.level)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setCurrentWord(word)
                            setIsEditDialogOpen(true)
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-red-500 hover:text-red-700"
                          onClick={() => {
                            setCurrentWord(word)
                            setIsDeleteDialogOpen(true)
                          }}
                        >
                          <Trash className="size-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="py-8 text-center">
                    <div className="text-muted-foreground flex flex-col items-center justify-center">
                      <p className="mb-2">هیچ واژه‌ای یافت نشد</p>
                      <p className="text-sm">واژه جدیدی اضافه کنید یا معیارهای جستجو را تغییر دهید</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* دیالوگ ویرایش واژه */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ویرایش واژه</DialogTitle>
            <DialogDescription>اطلاعات واژه «{currentWord?.word}» را ویرایش کنید.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditWord}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-word">واژه انگلیسی</Label>
                <Input
                  id="edit-word"
                  name="word"
                  placeholder="واژه انگلیسی را وارد کنید"
                  defaultValue={currentWord?.word}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-meaning">معنی و توضیحات (فارسی)</Label>
                <Textarea
                  id="edit-meaning"
                  name="meaning"
                  placeholder="معنی و توضیحات واژه را به فارسی وارد کنید"
                  rows={4}
                  defaultValue={currentWord?.meaning}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-level">سطح دشواری</Label>
                <Select name="level" defaultValue={currentWord?.level}>
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
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setIsEditDialogOpen(false)
                  setCurrentWord(null)
                }}
              >
                انصراف
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "در حال ذخیره..." : "ذخیره تغییرات"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* دیالوگ حذف واژه */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>آیا از حذف این واژه اطمینان دارید؟</AlertDialogTitle>
            <AlertDialogDescription>
              این عمل غیرقابل بازگشت است. واژه «{currentWord?.word}» از کتاب حذف خواهد شد.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setCurrentWord(null)
              }}
            >
              انصراف
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteWord}
              disabled={isSubmitting}
              className="bg-red-600 text-white hover:bg-red-700"
            >
              {isSubmitting ? "در حال حذف..." : "حذف واژه"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
