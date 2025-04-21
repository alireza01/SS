"use client"

import { useEffect, useState } from "react"

import Image from "next/image"

import { motion } from "framer-motion"
import { Brain, BookOpen, Save, Volume2 } from "lucide-react"

import { createClient } from "@/lib/supabase/client"

interface Stats {
  totalUsers: number
}

export function AppFeatures() {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0 })
  const supabase = createClient()

  useEffect(() => {
    async function fetchStats() {
      try {
        const { count } = await supabase
          .from("users")
          .select("*", { count: "exact" })
          .eq("active", true)

        setStats({ totalUsers: count || 0 })
      } catch (error) {
        console.error("Error fetching user stats:", error)
      }
    }

    fetchStats()
  }, [])

  const features = [
    {
      icon: <Brain className="size-6" />,
      title: "ترجمه هوشمند با هوش مصنوعی",
      description: "با استفاده از هوش مصنوعی پیشرفته، معنی دقیق کلمات با توجه به بافت متن ارائه می‌شود.",
    },
    {
      icon: <BookOpen className="size-6" />,
      title: "تشخیص سطح دشواری کلمات",
      description: "کلمات بر اساس سطح دشواری (مبتدی، متوسط، پیشرفته) دسته‌بندی و با رنگ‌های متفاوت نمایش داده می‌شوند.",
    },
    {
      icon: <Save className="size-6" />,
      title: "ذخیره پیشرفت مطالعه",
      description: "پیشرفت مطالعه شما به صورت خودکار ذخیره می‌شود و می‌توانید از همان جایی که متوقف شده‌اید، ادامه دهید.",
    },
    {
      icon: <Volume2 className="size-6" />,
      title: "تلفظ صوتی کلمات",
      description: "با کلیک روی آیکون صدا، تلفظ صحیح کلمات را بشنوید و مهارت شنیداری خود را تقویت کنید.",
    },
  ]

  return (
    <section className="bg-gray-50 py-20 dark:bg-gray-900">
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">ویژگی‌های منحصر به فرد کتاب‌یار</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              کتاب‌یار با ویژگی‌های پیشرفته خود، تجربه مطالعه کتاب‌های انگلیسی را برای شما متحول می‌کند.
            </p>

            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-12 shrink-0 items-center justify-center rounded-full">
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
                    className="size-6"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m15.5 9-4.5 4.5L9.5 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">ترجمه هوشمند با هوش مصنوعی</h3>
                  <p className="text-muted-foreground">
                    با استفاده از هوش مصنوعی پیشرفته، معنی دقیق کلمات با توجه به بافت متن ارائه می‌شود.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-12 shrink-0 items-center justify-center rounded-full">
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
                    className="size-6"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m15.5 9-4.5 4.5L9.5 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">تشخیص سطح دشواری کلمات</h3>
                  <p className="text-muted-foreground">
                    کلمات بر اساس سطح دشواری (مبتدی، متوسط، پیشرفته) دسته‌بندی و با رنگ‌های متفاوت نمایش داده می‌شوند.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-12 shrink-0 items-center justify-center rounded-full">
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
                    className="size-6"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m15.5 9-4.5 4.5L9.5 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">ذخیره پیشرفت مطالعه</h3>
                  <p className="text-muted-foreground">
                    پیشرفت مطالعه شما به صورت خودکار ذخیره می‌شود و می‌توانید از همان جایی که متوقف شده‌اید، ادامه دهید.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-12 shrink-0 items-center justify-center rounded-full">
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
                    className="size-6"
                  >
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m15.5 9-4.5 4.5L9.5 12" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-2 text-xl font-bold">تلفظ صوتی کلمات</h3>
                  <p className="text-muted-foreground">
                    با کلیک روی آیکون صدا، تلفظ صحیح کلمات را بشنوید و مهارت شنیداری خود را تقویت کنید.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="/placeholder.jpg"
                alt="ویژگی‌های کتاب‌یار"
                width={800}
                height={600}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="text-xl font-bold">رابط کاربری مدرن</h3>
                <p className="text-sm">طراحی زیبا و کاربرپسند</p>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
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
                    <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                </div>
                <div className="text-sm">
                  <p className="font-medium">+۵۰۰۰</p>
                  <p className="text-muted-foreground">کاربر فعال</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
