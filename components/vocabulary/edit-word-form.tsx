"use client"

import React from 'react'

import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'

const formSchema = z.object({
  word: z.string().min(1, 'Word is required'),
  translation: z.string().min(1, 'Translation is required'),
  definition: z.string().min(1, 'Definition is required'),
  example: z.string().min(1, 'Example is required'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
})

type FormValues = z.infer<typeof formSchema>

interface EditWordFormProps {
  word: {
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
  onUpdate: (updatedWord: any) => void
  onClose: () => void
}

const EditWordForm = ({ word, onUpdate, onClose }: EditWordFormProps) => {
  const supabase = createClient()
  const form = useForm({
    defaultValues: {
      word: word.word,
      meaning: word.meaning,
      example: word.example || '',
      level: word.level,
    }
  })

  const onSubmit = async (data: any) => {
    try {
      const { error } = await supabase
        .from('user_words')
        .update({
          word: data.word,
          meaning: data.meaning,
          example: data.example || null,
          level: data.level,
          updatedAt: new Date().toISOString(),
        })
        .eq('id', word.id)

      if (error) throw error

      onUpdate({ ...word, ...data })
      onClose()
      toast.success('واژه با موفقیت به‌روزرسانی شد')
    } catch (error) {
      console.error('Error updating word:', error)
      toast.error('خطا در به‌روزرسانی واژه')
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="word">واژه</Label>
          <Input id="word" {...form.register('word')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="meaning">معنی</Label>
          <Input id="meaning" {...form.register('meaning')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="example">مثال</Label>
          <Textarea id="example" {...form.register('example')} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="level">سطح</Label>
          <Select
            value={form.watch('level')}
            onValueChange={(value) => form.setValue('level', value)}
          >
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
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose} type="button">
          انصراف
        </Button>
        <Button type="submit">
          ذخیره تغییرات
        </Button>
      </div>
    </form>
  )
}

export default EditWordForm
