import type { ReactNode } from "react"

import { BookOpen } from "lucide-react"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: {
    default: "احراز هویت | کتاب‌یار",
    template: "%s | کتاب‌یار",
  },
  description: "ورود، ثبت‌نام و مدیریت حساب کاربری در کتاب‌یار",
}

interface AuthLayoutProps {
  children: ReactNode
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="bg-background flex min-h-screen flex-col">
      <main className="flex flex-1 items-center justify-center py-8">
        <div className="container mx-auto max-w-md px-4">
          <div className="mb-8 flex justify-center">
            <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-12 items-center justify-center rounded-full">
              <BookOpen className="size-6" />
            </div>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}