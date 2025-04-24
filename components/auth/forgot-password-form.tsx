"use client"

import { useState } from "react"

import Link from "next/link"

import { motion } from "framer-motion"
import { BookOpen, AlertCircle, ArrowLeft, CheckCircle } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"


export function ForgotPasswordForm() {
  const supabase = createClient()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        throw error
      }

      setIsSuccess(true)
      toast.success("لینک بازیابی رمز عبور به ایمیل شما ارسال شد")
    } catch (error: any) {
      console.error("خطا در ارسال ایمیل بازیابی رمز عبور:", error)
      setFormError(error.message || "خطا در ارسال ایمیل بازیابی رمز عبور. لطفاً دوباره تلاش کنید.")
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
            <CardTitle className="text-center text-2xl font-bold">بازیابی رمز عبور</CardTitle>
            <CardDescription className="text-center">
              ایمیل خود را وارد کنید تا لینک بازیابی رمز عبور برای شما ارسال شود
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            {isSuccess ? (
              <div className="space-y-4 text-center">
                <div className="flex justify-center">
                  <div className="flex size-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
                    <CheckCircle className="size-8" />
                  </div>
                </div>
                <h3 className="text-xl font-bold">ایمیل ارسال شد</h3>
                <p className="text-muted-foreground">
                  لینک بازیابی رمز عبور به ایمیل <span className="font-medium">{email}</span> ارسال شد. لطفاً صندوق ورودی
                  خود را بررسی کنید.
                </p>
                <p className="text-muted-foreground text-sm">
                  اگر ایمیلی دریافت نکردید، پوشه اسپم را بررسی کنید یا{" "}
                  <button type="button" className="text-primary hover:underline" onClick={() => setIsSuccess(false)}>
                    دوباره تلاش کنید
                  </button>
                  .
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">ایمیل</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? "در حال ارسال..." : "ارسال لینک بازیابی"}
                </Button>
              </form>
            )}
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
