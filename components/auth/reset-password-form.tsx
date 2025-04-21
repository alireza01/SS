"use client"

import React from "react"
import { useState } from "react"

import { useRouter } from "next/navigation"

import { motion } from "framer-motion"
import { BookOpen, AlertCircle } from "lucide-react"
import { toast } from "sonner"

import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"


export function ResetPasswordForm() {
  const router = useRouter()
  const supabase = createClient()
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setFormError(null)

    // بررسی تطابق رمز عبور
    if (password !== confirmPassword) {
      setFormError("رمز عبور و تکرار آن مطابقت ندارند")
      setIsLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) {
        throw error
      }

      toast.success("رمز عبور با موفقیت تغییر یافت")
      router.push("/auth/login")
    } catch (error: any) {
      console.error("خطا در تغییر رمز عبور:", error)

      if (error.message.includes("password")) {
        setFormError("رمز عبور باید حداقل ۶ کاراکتر باشد")
      } else {
        setFormError(error.message || "خطا در تغییر رمز عبور. لطفاً دوباره تلاش کنید.")
      }
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
            <CardTitle className="text-center text-2xl font-bold">تغییر رمز عبور</CardTitle>
            <CardDescription className="text-center">رمز عبور جدید خود را وارد کنید</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {formError && (
              <Alert variant="destructive">
                <AlertCircle className="size-4" />
                <AlertDescription>{formError}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">رمز عبور جدید</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="********"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">تکرار رمز عبور جدید</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="********"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "در حال تغییر رمز عبور..." : "تغییر رمز عبور"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
