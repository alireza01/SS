"use client"

import { useState } from "react"

import Link from "next/link"

import { motion } from "framer-motion"
import { BookOpen, AlertCircle, Mail, ArrowLeft } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"


interface VerifyEmailFormProps {
  email?: string
}

export function VerifyEmailForm({ email }: VerifyEmailFormProps) {
  const supabase = createClient()
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleResendEmail = async () => {
    if (!email) {
      setFormError("ایمیل نامعتبر است")
      return
    }

    setIsLoading(true)
    setFormError(null)

    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
      })

      if (error) {
        throw error
      }

      toast.success("ایمیل تأیید مجدداً ارسال شد")
    } catch (error: any) {
      console.error("خطا در ارسال مجدد ایمیل تأیید:", error)
      setFormError(error.message || "خطا در ارسال مجدد ایمیل تأیید. لطفاً دوباره تلاش کنید.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-md px-4 py-12">
      <div className="mb-8 flex justify-center">
        <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-12 items-center justify-center rounded-full">
          <BookOpen className="size-6" />
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle className="text-center text-2xl font-bold">تأیید ایمیل</CardTitle>
            <CardDescription className="text-center">لطفاً ایمیل خود را برای تکمیل ثبت‌نام تأیید کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4 text-center">
              <div className="flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                  <Mail className="size-8" />
                </div>
              </div>
              <h3 className="text-xl font-bold">ایمیل تأیید ارسال شد</h3>
              <p className="text-muted-foreground">
                یک ایمیل تأیید به <span className="font-medium">{email || "آدرس ایمیل شما"}</span> ارسال شده است. لطفاً
                صندوق ورودی خود را بررسی کنید و روی لینک تأیید کلیک کنید.
              </p>
              <p className="text-muted-foreground text-sm">
                اگر ایمیلی دریافت نکردید، پوشه اسپم را بررسی کنید یا روی دکمه زیر کلیک کنید تا ایمیل تأیید مجدداً ارسال
                شود.
              </p>
              <Button onClick={handleResendEmail} disabled={isLoading || !email}>
                {isLoading ? "در حال ارسال..." : "ارسال مجدد ایمیل تأیید"}
              </Button>
            </div>
          </CardContent>
          <CardFooter className="text-center">
            <Link href="/auth/login" className="text-primary inline-flex items-center hover:underline">
              <ArrowLeft className="ml-2 size-4" />
              بازگشت به صفحه ورود
            </Link>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
