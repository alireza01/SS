"use client"

import { useEffect, useState } from "react"

import Image from "next/image"
import Link from "next/link"

import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"


interface Stats {
  totalWords: number
  totalBooks: number
}

export function HeroSection() {
  const [stats, setStats] = useState<Stats>({ totalWords: 0, totalBooks: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch total learned words
        const { count: wordsCount } = await supabase
          .from("learned_words")
          .select("*", { count: "exact" })

        // Fetch total active books
        const { count: booksCount } = await supabase
          .from("books")
          .select("*", { count: "exact" })
          .eq("isActive", true)

        setStats({
          totalWords: wordsCount || 0,
          totalBooks: booksCount || 0,
        })
      } catch (error) {
        console.error("Error fetching stats:", error)
      }
    }

    fetchStats()
  }, [])

  return (
    <section className="from-gold-50 dark:to-background relative overflow-hidden bg-gradient-to-b to-white py-20 dark:from-gray-900">
      <div className="container relative z-10">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6 text-center md:text-right"
          >
            <h1 className="text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
              <span className="block">یادگیری زبان انگلیسی</span>
              <span className="from-gold-400 to-gold-600 block bg-gradient-to-r bg-clip-text text-transparent">
                با خواندن کتاب‌های اصلی
              </span>
            </h1>
            <p className="text-muted-foreground mx-auto max-w-xl text-lg md:mx-0 md:text-xl">
              با کتاب‌یار، کتاب‌های انگلیسی را بخوانید و معنی کلمات دشوار را با کمک هوش مصنوعی دریافت کنید.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row md:justify-start">
              <Button size="lg" asChild className="shadow-md">
                <Link href="/library">شروع مطالعه</Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">درباره کتاب‌یار</Link>
              </Button>
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl md:aspect-square">
              <Image
                src="/placeholder.jpg"
                alt="مطالعه کتاب با کتاب‌یار"
                width={600}
                height={600}
                className="object-cover"
                priority
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <p className="text-sm font-medium">کتاب‌یار</p>
                <h3 className="text-xl font-bold">یادگیری زبان با لذت مطالعه</h3>
              </div>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="absolute -bottom-6 -left-6 max-w-[200px] rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gold-100 flex size-10 items-center justify-center rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gold-600 size-5"
                  >
                    <path d="M12 20V10" />
                    <path d="m18 20-6-6-6 6" />
                    <path d="M18 4H6" />
                    <path d="M15 7H9" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-medium">+{stats.totalWords.toLocaleString("fa-IR")}</p>
                  <p className="text-muted-foreground">کلمه یاد گرفته شده</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="absolute -right-6 -top-6 max-w-[200px] rounded-lg bg-white p-4 shadow-lg dark:bg-gray-800"
            >
              <div className="flex items-center gap-3">
                <div className="bg-gold-100 flex size-10 items-center justify-center rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-gold-600 size-5"
                  >
                    <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-medium">+{stats.totalBooks.toLocaleString("fa-IR")}</p>
                  <p className="text-muted-foreground">کتاب انگلیسی</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
      <div className="absolute inset-x-0 top-0 h-full">
        <div className="from-gold-200/20 dark:from-gold-900/20 absolute left-0 top-0 size-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] via-transparent to-transparent"></div>
      </div>
    </section>
  )
}
