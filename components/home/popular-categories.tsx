"use client"

import * as React from "react"

import Link from "next/link"

import { motion } from "framer-motion"
import { Book, Brain, Beaker, User2, Clock, Briefcase, type LucideIcon } from "lucide-react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"

interface Category {
  id: string
  name: string
  slug: string
  book_count: number
}

export function PopularCategories() {
  const [categories, setCategories] = React.useState<Category[]>([])
  const [isLoading, setIsLoading] = React.useState(true)
  const supabase = createClient()

  React.useEffect(() => {
    async function fetchCategories() {
      try {
        const { data, error } = await supabase
          .from("categories")
          .select("id, name, slug, book_count")
          .eq("isActive", true)
          .order("book_count", { ascending: false })
          .limit(6)

        if (error) throw error
        setCategories(data || [])
      } catch (error) {
        console.error("Error fetching categories:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchCategories()
  }, [])

  const getCategoryIcon = (slug: string): LucideIcon => {
    const iconMap: Record<string, LucideIcon> = {
      fiction: Book,
      "self-help": Brain,
      science: Beaker,
      biography: User2,
      history: Clock,
      business: Briefcase,
    }
    return iconMap[slug] || Book
  }

  if (isLoading) {
    return (
      <div className="bg-white py-20 dark:bg-gray-950">
        <div className="container">
          <div className="mx-auto mb-16 max-w-3xl text-center">
            <Skeleton className="mx-auto mb-4 h-10 w-64" />
            <Skeleton className="mx-auto h-6 w-96" />
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-48" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white py-20 dark:bg-gray-950">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">دسته‌بندی‌های محبوب</h2>
          <p className="text-muted-foreground text-lg">کتاب‌های مورد علاقه خود را بر اساس دسته‌بندی پیدا کنید.</p>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {categories.map((category: Category, index: number) => {
            const Icon = getCategoryIcon(category.slug)
            return (
              <motion.div
                key={category.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link href={`/categories/${category.slug}`}>
                  <Card className="border-gold-200 h-full transition-shadow hover:shadow-md dark:border-gray-800">
                    <CardContent className="flex flex-col items-center p-6 text-center">
                      <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 mb-4 flex size-16 items-center justify-center rounded-full">
                        <Icon className="size-10" />
                      </div>
                      <h3 className="mb-1 text-lg font-bold">{category.name}</h3>
                      <p className="text-muted-foreground text-sm">{category.book_count} کتاب</p>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
