"use client"

import Image from "next/image"

import { motion } from "framer-motion"

export function HowItWorks() {
  const steps = [
    {
      title: "انتخاب کتاب",
      description: "از میان کتاب‌های متنوع، کتاب مورد علاقه خود را انتخاب کنید.",
      icon: (
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
          <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
        </svg>
      ),
    },
    {
      title: "تعیین سطح زبانی",
      description: "سطح زبان انگلیسی خود را مشخص کنید: مبتدی، متوسط یا پیشرفته.",
      icon: (
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
          <path d="M2 20h.01" />
          <path d="M7 20v-4" />
          <path d="M12 20v-8" />
          <path d="M17 20V8" />
          <path d="M22 4v16" />
        </svg>
      ),
    },
    {
      title: "مطالعه هوشمند",
      description: "کلمات دشوار با رنگ‌های متفاوت مشخص می‌شوند. با کلیک روی هر کلمه، معنی و توضیحات آن را ببینید.",
      icon: (
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
          <circle cx="12" cy="12" r="10" />
          <path d="m15 9-6 6" />
          <path d="m9 9 6 6" />
        </svg>
      ),
    },
    {
      title: "یادگیری و پیشرفت",
      description: "پیشرفت مطالعه و کلمات یادگرفته شده را پیگیری کنید و با تمرین منظم، مهارت زبانی خود را ارتقا دهید.",
      icon: (
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
          <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
        </svg>
      ),
    },
  ]

  return (
    <section className="bg-white py-20 dark:bg-gray-950">
      <div className="container">
        <div className="mx-auto mb-16 max-w-3xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">چگونه کار می‌کند؟</h2>
          <p className="text-muted-foreground text-lg">
            با چهار گام ساده، مطالعه کتاب‌های انگلیسی را شروع کنید و مهارت زبانی خود را ارتقا دهید.
          </p>
        </div>

        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="order-2 md:order-1">
            <div className="space-y-8">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex gap-4"
                >
                  <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-12 shrink-0 items-center justify-center rounded-full">
                    {step.icon}
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
            className="order-1 md:order-2"
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl shadow-2xl">
              <Image
                src="/placeholder.svg?height=600&width=800"
                alt="نحوه کار کتاب‌یار"
                width={800}
                height={600}
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
              <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                <h3 className="text-xl font-bold">مطالعه هوشمند</h3>
                <p className="text-sm">یادگیری زبان انگلیسی با لذت مطالعه</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
