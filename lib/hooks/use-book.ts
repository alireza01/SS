'use client'

import { useCallback, useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"

export interface Book {
  id: string
  slug: string
  title: string
  author: string
  description?: string
  coverImage?: string
  level?: string
  isPremium: boolean
  isActive: boolean
  categories?: { name: string }[]
}

interface UseBookResult {
  book: Book | null
  isLoading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export function useBook(slugOrId: string): UseBookResult {
  const [book, setBook] = useState<Book | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const supabase = createClient()

  const fetchBook = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      // Try fetching by slug first
      let { data, error: slugError } = await supabase
        .from("books")
        .select("*, categories(name)")
        .eq("slug", slugOrId)
        .single()

      // If not found by slug, try by ID
      if (slugError) {
        const { data: idData, error: idError } = await supabase
          .from("books")
          .select("*, categories(name)")
          .eq("id", slugOrId)
          .single()

        if (idError) {
          throw new Error("Book not found")
        }
        data = idData
      }

      setBook(data)
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch book"))
    } finally {
      setIsLoading(false)
    }
  }, [slugOrId, supabase])

  useEffect(() => {
    fetchBook()
  }, [fetchBook])

  return {
    book,
    isLoading,
    error,
    refetch: fetchBook
  }
}

export function useBookProgress(bookId: string) {
  const [progress, setProgress] = useState<{
    currentPage: number
    lastReadAt: string
    readingTime?: number
  } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  const fetchProgress = useCallback(async () => {
    const { data: session } = await supabase.auth.getSession()
    if (!session.session) {
      setIsLoading(false)
      return
    }

    const { data } = await supabase
      .from("reading_progress")
      .select("currentPage, lastReadAt, readingTime")
      .eq("userId", session.session.user.id)
      .eq("bookId", bookId)
      .maybeSingle()

    setProgress(data)
    setIsLoading(false)
  }, [bookId, supabase])

  useEffect(() => {
    fetchProgress()
  }, [fetchProgress])

  return { progress, isLoading }
} 