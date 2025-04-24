"use client"

import { useState, useEffect } from "react"

import Image from "next/image"

import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/client"

interface Testimonial {
  id: string
  name: string
  role: string
  content: string
  avatar_url: string | null
}

export function TestimonialSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [activeIndex, setActiveIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchTestimonials() {
      try {
        const { data, error } = await supabase
          .from("testimonials")
          .select("*")
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(3)

        if (error) throw error
        setTestimonials(data || [])
      } catch (error) {
        console.error("Error fetching testimonials:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestimonials()
  }, [])

  const nextTestimonial = () => {
    setActiveIndex((prev) => (prev + 1) % testimonials.length)
  }

  const prevTestimonial = () => {
    setActiveIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }

  if (isLoading) {
    return (
      <div className="px-4 py-16">
        <div className="container mx-auto">
          <Card className="border-gold-200 shadow-lg dark:border-gray-800">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <Skeleton className="size-24 rounded-full" />
                <div className="flex-1 space-y-4">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-4 w-1/2" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  if (testimonials.length === 0) {
    return null
  }

  return (
    <div className="px-4 py-16">
      <div className="container mx-auto">
        <div className="mb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="mb-4 text-3xl font-bold">نظرات کاربران</h2>
            <p className="text-muted-foreground">آنچه کاربران درباره کتاب‌یار می‌گویند</p>
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="relative"
        >
          <Card className="border-gold-200 shadow-lg dark:border-gray-800">
            <CardContent className="p-8">
              <div className="flex flex-col items-center gap-6 md:flex-row">
                <div className="shrink-0">
                  <div className="border-gold-100 dark:border-gold-900 relative size-24 overflow-hidden rounded-full border-4">
                    <Image
                      src={testimonials[activeIndex].avatar_url || "/images/default-avatar.svg"}
                      alt={testimonials[activeIndex].name}
                      fill
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="flex-1 text-center md:text-right">
                  <svg
                    className="text-gold-300 dark:text-gold-700 mx-auto mb-4 size-10 md:mr-0"
                    fill="currentColor"
                    viewBox="0 0 32 32"
                    aria-hidden="true"
                  >
                    <path d="M9.352 4C4.456 7.456 1 13.12 1 19.36c0 5.088 3.072 8.064 6.624 8.064 3.36 0 5.856-2.688 5.856-5.856 0-3.168-2.208-5.472-5.088-5.472-.576 0-1.344.096-1.536.192.48-3.264 3.552-7.104 6.624-9.024L9.352 4zm16.512 0c-4.8 3.456-8.256 9.12-8.256 15.36 0 5.088 3.072 8.064 6.624 8.064 3.264 0 5.856-2.688 5.856-5.856 0-3.168-2.304-5.472-5.184-5.472-.576 0-1.248.096-1.44.192.48-3.264 3.456-7.104 6.528-9.024L25.864 4z" />
                  </svg>
                  <p className="mb-6 text-lg">{testimonials[activeIndex].content}</p>
                  <div>
                    <h4 className="text-xl font-bold">{testimonials[activeIndex].name}</h4>
                    <p className="text-muted-foreground">{testimonials[activeIndex].role}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="absolute -bottom-6 left-1/2 flex -translate-x-1/2 gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="bg-background rounded-full"
            >
              <span className="sr-only">Previous testimonial</span>
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="bg-background rounded-full"
            >
              <span className="sr-only">Next testimonial</span>
              <svg className="size-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}