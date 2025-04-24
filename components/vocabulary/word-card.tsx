"use client"

import { useState } from "react"

import { motion } from "framer-motion"
import { Volume2, MoreVertical, Pencil, Trash, BookOpen, Check } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Separator } from "@/components/ui/separator"
import EditWordForm from "@/components/vocabulary/edit-word-form"
import { createClient } from "@/lib/supabase/client"


interface UserWord {
  id: string
  word: string
  meaning: string
  example: string | null
  level: string
  status: string
  nextReviewAt: string | null
  createdAt: string
  books: {
    id: string
    title: string
  } | null
}

interface WordCardProps {
  word: UserWord
  onPlayPronunciation: (word: string) => void
  onDelete: (wordId: string) => void
  onUpdate: (updatedWord: UserWord) => void
}

export function WordCard({ word, onPlayPronunciation, onDelete, onUpdate }: WordCardProps) {
  const supabase = createClient()
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

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

  // تنظیم رنگ وضعیت
  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
      case "learning":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
      case "known":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
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

  // تبدیل وضعیت به فارسی
  const getStatusText = (status: string) => {
    switch (status) {
      case "new":
        return "جدید"
      case "learning":
        return "در حال یادگیری"
      case "known":
        return "آموخته شده"
      default:
        return status
    }
  }

  // حذف کلمه
  const handleDelete = async () => {
    setIsLoading(true)

    try {
      const { error } = await supabase.from("user_words").delete().eq("id", word.id)

      if (error) {
        throw error
      }

      // به‌روزرسانی آمار واژگان
      const { error: statsError } = await supabase.rpc("update_word_stats_on_delete", {
        word_status: word.status,
      })

      if (statsError) {
        console.error("خطا در به‌روزرسانی آمار واژگان:", statsError)
      }

      onDelete(word.id)
      toast.success("واژه با موفقیت حذف شد")
    } catch (error) {
      console.error("خطا در حذف واژه:", error)
      toast.error("خطا در حذف واژه")
    } finally {
      setIsLoading(false)
      setIsDeleteDialogOpen(false)
    }
  }

  // تغییر وضعیت کلمه به "آموخته شده"
  const handleMarkAsKnown = async () => {
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from("user_words")
        .update({
          status: "known",
          updatedAt: new Date().toISOString(),
        })
        .eq("id", word.id)
        .select()

      if (error) {
        throw error
      }

      // به‌روزرسانی آمار واژگان
      if (word.status !== "known") {
        const { error: statsError } = await supabase.rpc("update_word_stats_on_status_change", {
          old_status: word.status,
          new_status: "known",
        })

        if (statsError) {
          console.error("خطا در به‌روزرسانی آمار واژگان:", statsError)
        }
      }

      const updatedWord = { ...word, status: "known" }
      onUpdate(updatedWord)
      toast.success("واژه به عنوان آموخته شده علامت‌گذاری شد")
    } catch (error) {
      console.error("خطا در به‌روزرسانی وضعیت واژه:", error)
      toast.error("خطا در به‌روزرسانی وضعیت واژه")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }} layout>
      <Card className="h-full">
        <CardContent className="p-4">
          <div className="mb-2 flex items-start justify-between">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold">{word.word}</h3>
                <Button variant="ghost" size="icon" className="size-6" onClick={() => onPlayPronunciation(word.word)}>
                  <Volume2 className="size-4" />
                  <span className="sr-only">تلفظ</span>
                </Button>
              </div>
              <p className="text-muted-foreground">{word.meaning}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="size-8">
                  <MoreVertical className="size-4" />
                  <span className="sr-only">منو</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                  <Pencil className="ml-2 size-4" />
                  ویرایش
                </DropdownMenuItem>
                {word.status !== "known" && (
                  <DropdownMenuItem onClick={handleMarkAsKnown}>
                    <Check className="ml-2 size-4" />
                    علامت‌گذاری به عنوان آموخته شده
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="text-red-600 focus:text-red-600"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash className="ml-2 size-4" />
                  حذف
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {word.example && (
            <div className="text-muted-foreground mt-2 text-sm">
              <p className="italic">"{word.example}"</p>
            </div>
          )}

          <Separator className="my-3" />

          <div className="mt-2 flex flex-wrap gap-2">
            <Badge variant="outline" className={getLevelColor(word.level)}>
              {getLevelText(word.level)}
            </Badge>
            <Badge variant="outline" className={getStatusColor(word.status)}>
              {getStatusText(word.status)}
            </Badge>
            {word.books && (
              <Badge variant="outline" className="flex items-center">
                <BookOpen className="ml-1 size-3" />
                {word.books.title}
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* دیالوگ ویرایش کلمه */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>ویرایش واژه</DialogTitle>
            <DialogDescription>اطلاعات واژه را ویرایش کنید.</DialogDescription>
          </DialogHeader>
          <EditWordForm word={word} onUpdate={onUpdate} onClose={() => setIsEditDialogOpen(false)} />
        </DialogContent>
      </Dialog>

      {/* دیالوگ حذف کلمه */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>حذف واژه</DialogTitle>
            <DialogDescription>آیا از حذف این واژه اطمینان دارید؟</DialogDescription>
          </DialogHeader>
          <div className="mt-4 flex justify-end gap-2">
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              انصراف
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isLoading}>
              {isLoading ? "در حال حذف..." : "حذف"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </motion.div>
  )
}
