import { redirect } from "next/navigation"


import { LoginForm } from "@/components/auth/login-form"
import { createServerClient } from "@/lib/supabase/app-server"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ورود به حساب کاربری",
  description: "وارد حساب کاربری خود در کتاب‌یار شوید",
}

interface LoginPageProps {
  searchParams: {
    redirect?: string
    error?: string
  }
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const redirectUrl = searchParams.redirect || "/dashboard"
  const errorMessage = searchParams.error
  const supabase = createServerClient()

  try {
    // بررسی احراز هویت کاربر
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error) {
      console.error("Error checking auth session:", error.message)
      throw error
    }

    // اگر کاربر قبلاً وارد شده است، به صفحه مورد نظر هدایت می‌شود
    if (session) {
      redirect(redirectUrl)
    }

    return (
      <div className="container relative flex min-h-[600px] flex-col items-center justify-center">
        <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
          <div className="flex flex-col space-y-2 text-center">
            <h1 className="text-2xl font-semibold tracking-tight">ورود به حساب کاربری</h1>
            <p className="text-muted-foreground text-sm">
              برای ورود به حساب کاربری خود، از ایمیل و رمز عبور استفاده کنید
            </p>
          </div>
          <LoginForm redirectUrl={redirectUrl} errorMessage={errorMessage} />
        </div>
      </div>
    )
  } catch (error) {
    return (
      <div className="container flex min-h-[600px] items-center justify-center">
        <div className="text-center">
          <h1 className="mb-4 text-2xl font-bold">خطا در بارگذاری صفحه</h1>
          <p className="text-muted-foreground mb-4">متأسفانه در بارگذاری صفحه مشکلی پیش آمده است.</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-4 py-2"
          >
            تلاش مجدد
          </button>
        </div>
      </div>
    )
  }
}
