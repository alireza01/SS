import { redirect } from "next/navigation"


import { ResetPasswordForm } from "@/components/auth/reset-password-form"
import { createServerClient } from "@/lib/supabase/app-server"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "تغییر رمز عبور",
  description: "تغییر رمز عبور حساب کاربری در کتاب‌یار",
}

export default async function ResetPasswordPage() {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <ResetPasswordForm />
      </div>
    </div>
  )
}
