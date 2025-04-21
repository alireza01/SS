"use client"

import React, { useState } from "react"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { createClient } from "@/lib/supabase/client"

const formSchema = z.object({
  word: z.string().min(1, "Word is required"),
  translation: z.string().min(1, "Translation is required"),
  definition: z.string().min(1, "Definition is required"),
  example: z.string().min(1, "Example is required"),
  difficulty: z.enum(["easy", "medium", "hard"]),
})

type FormValues = z.infer<typeof formSchema>

interface AddWordFormProps {
  userId: string
  onSuccess?: () => void
}

const AddWordForm = ({ userId, onSuccess }: AddWordFormProps) => {
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      word: "",
      translation: "",
      definition: "",
      example: "",
      difficulty: "medium",
    },
  })

  const onSubmit = async (data: FormValues) => {
    setIsLoading(true)

    try {
      const { error } = await supabase.from("vocabulary").insert({
        user_id: userId,
        word: data.word,
        translation: data.translation,
        definition: data.definition,
        example: data.example,
        difficulty: data.difficulty,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      toast.success("Word added successfully")
      form.reset()
      onSuccess?.()
    } catch (error: any) {
      console.error("Error adding word:", error)
      toast.error(error.message || "Failed to add word")
    } finally {
      setIsLoading(false)
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
                <Input placeholder="Enter word" {...field} disabled={isLoading} />
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
                <Input placeholder="Enter translation" {...field} disabled={isLoading} />
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
                <Textarea placeholder="Enter definition" {...field} disabled={isLoading} />
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
                <Textarea placeholder="Enter example usage" {...field} disabled={isLoading} />
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

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Adding word..." : "Add word"}
        </Button>
      </form>
    </Form>
  )
}

export default AddWordForm
