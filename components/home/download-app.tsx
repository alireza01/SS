"use client"

import { useState, useEffect } from "react"

import Image from "next/image"

import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

interface AppStats {
  downloads: number
  rating: number
  active_users: number
}

export function DownloadApp() {
  const [stats, setStats] = useState<AppStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchAppStats() {
      try {
        const { data, error } = await supabase
          .from("app_stats")
          .select("*")
          .single()

        if (error) throw error
        setStats(data)
      } catch (error) {
        console.error("Error fetching app stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAppStats()
  }, [])

  return (
    <section className="from-gold-50 dark:to-background overflow-hidden bg-gradient-to-b to-white px-4 py-16 dark:from-gray-900">
      <div className="container mx-auto">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-bold">
              کتاب‌یار را همه‌جا همراه داشته باشید
            </h2>
            <p className="text-muted-foreground mb-8">
              با اپلیکیشن کتاب‌یار، کتاب‌های مورد علاقه خود را در هر زمان و مکانی مطالعه کنید.
              امکانات پیشرفته مطالعه، پشتیبانی از حالت آفلاین و همگام‌سازی خودکار پیشرفت مطالعه.
            </p>

            <div className="mt-8 flex flex-wrap gap-4">
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => window.open('https://play.google.com/store/apps/details?id=com.yourapp', '_blank')}
              >
                <Image src="/images/google-play.svg" alt="Google Play" width={24} height={24} />
                دانلود از گوگل پلی
              </Button>
              <Button
                variant="outline"
                className="flex items-center gap-2"
                onClick={() => window.open('https://apps.apple.com/app/your-app/id123456789', '_blank')}
              >
                <Image src="/images/app-store.svg" alt="App Store" width={24} height={24} />
                دانلود از اپ استور
              </Button>
            </div>

            {stats && (
              <div className="flex items-center gap-4">
                <div className="flex -space-x-2 space-x-reverse">
                  <div className="bg-gold-100 flex size-8 items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                    <span className="text-gold-600 text-xs font-medium">
                      {stats.rating.toFixed(1)}
                    </span>
                  </div>
                </div>
                <div className="text-sm">
                  <p className="font-medium">+{stats.downloads.toLocaleString('fa-IR')} دانلود</p>
                  <p className="text-muted-foreground">
                    امتیاز {stats.rating.toFixed(1)} از ۵
                  </p>
                </div>
              </div>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative"
          >
            <div className="relative aspect-[4/5] md:translate-x-12 md:scale-110">
              <Image
                src="/images/app-preview.png"
                alt="اپلیکیشن کتاب‌یار"
                fill
                className="object-contain"
                priority
              />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}