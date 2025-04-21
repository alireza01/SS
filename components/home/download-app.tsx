"use client"

import Image from "next/image"

import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"

export function DownloadApp() {
  return (
    <section className="from-gold-50 dark:to-background bg-gradient-to-b to-white py-20 dark:from-gray-900">
      <div className="container">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="relative order-2 md:order-1"
          >
            <div className="relative mx-auto aspect-square max-w-md">
              <Image
                src="/placeholder.svg?height=600&width=600"
                alt="اپلیکیشن کتاب‌یار"
                width={600}
                height={600}
                className="object-contain"
              />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="order-1 md:order-2"
          >
            <h2 className="mb-6 text-3xl font-bold md:text-4xl">اپلیکیشن کتاب‌یار را دانلود کنید</h2>
            <p className="text-muted-foreground mb-8 text-lg">
              با اپلیکیشن کتاب‌یار، در هر زمان و هر مکان به کتاب‌های مورد علاقه خود دسترسی داشته باشید و مطالعه خود را
              ادامه دهید.
            </p>

            <div className="flex flex-col gap-4 sm:flex-row">
              <Button size="lg" className="gap-2">
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
                  className="size-5"
                >
                  <path d="M12 19a7 7 0 1 0 0-14 7 7 0 0 0 0 14Z" />
                  <path d="M12 19v2" />
                  <path d="M12 3V1" />
                  <path d="m4.93 4.93 1.41 1.41" />
                  <path d="m17.66 17.66 1.41 1.41" />
                  <path d="M19 12h2" />
                  <path d="M3 12h2" />
                  <path d="m17.66 6.34 1.41-1.41" />
                  <path d="m4.93 19.07 1.41-1.41" />
                </svg>
                دانلود از بازار
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
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
                  className="size-5"
                >
                  <path d="M17 2H7a5 5 0 0 0-5 5v10a5 5 0 0 0 5 5h10a5 5 0 0 0 5-5V7a5 5 0 0 0-5-5Z" />
                  <path d="M12 15.5A3.5 3.5 0 1 0 8.5 12a3.5 3.5 0 0 0 3.5 3.5Z" />
                  <path d="M18 7h.01" />
                </svg>
                دانلود مستقیم
              </Button>
            </div>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex -space-x-2 space-x-reverse">
                <div className="bg-gold-100 flex size-8 items-center justify-center rounded-full border-2 border-white dark:border-gray-900">
                  <span className="text-gold-600 text-xs font-medium">4.9</span>
                </div>
                <div className="size-8 overflow-hidden rounded-full border-2 border-white dark:border-gray-900">
                  <Image
                    src="/placeholder.svg?height=32&width=32"
                    alt="کاربر"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="size-8 overflow-hidden rounded-full border-2 border-white dark:border-gray-900">
                  <Image
                    src="/placeholder.svg?height=32&width=32"
                    alt="کاربر"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
                <div className="size-8 overflow-hidden rounded-full border-2 border-white dark:border-gray-900">
                  <Image
                    src="/placeholder.svg?height=32&width=32"
                    alt="کاربر"
                    width={32}
                    height={32}
                    className="object-cover"
                  />
                </div>
              </div>
              <div className="text-sm">
                <p className="font-medium">+۵۰۰۰ دانلود</p>
                <p className="text-muted-foreground">امتیاز ۴.۹ از ۵</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
