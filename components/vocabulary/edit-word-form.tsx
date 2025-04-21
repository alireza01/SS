"use client"

import React, { useEffect } from 'react'

import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { toast } from 'sonner'
import * as z from 'zod'

import { Button } from '@/components/ui/button'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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
  wordId: string
  initialData: FormValues
  onSuccess?: () => void
}

const EditWordForm = ({ wordId, initialData, onSuccess }: EditWordFormProps) => {
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData,
  })

  useEffect(() => {
    form.reset(initialData)
  }, [form, initialData])

  const onSubmit = async (data: FormValues) => {
    try {
      const { error } = await supabase
        .from('vocabulary')
        .update({
          word: data.word,
          translation: data.translation,
          definition: data.definition,
          example: data.example,
          difficulty: data.difficulty,
          updated_at: new Date().toISOString(),
        })
        .eq('id', wordId)

      if (error) throw error

      toast.success('Word updated successfully')
      onSuccess?.()
    } catch (error: any) {
      console.error('Error updating word:', error)
      toast.error(error.message || 'Failed to update word')
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="word"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Word</FormLabel>
              <FormControl>
                <Input placeholder="Enter word" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="translation"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Translation</FormLabel>
              <FormControl>
                <Input placeholder="Enter translation" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="definition"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Definition</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter definition" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="example"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Example</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter example usage" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="difficulty"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Difficulty</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Update word
        </Button>
      </form>
    </Form>
  )
}

export default EditWordForm
