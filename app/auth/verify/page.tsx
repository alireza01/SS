import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { VerifyEmailForm } from "@/components/auth/verify-email-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "تأیید ایمیل",
  description: "تأیید آدرس ایمیل برای تکمیل ثبت‌نام در کتاب‌یار",
}

interface VerifyPageProps {
  searchParams: { [key: string]: string | string[] | undefined }
}

export default async function VerifyPage({ searchParams }: VerifyPageProps) {
  const supabase = createServerClient()
  const { data: { session } } = await supabase.auth.getSession()

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <div className="mx-auto flex w-full flex-col justify-center space-y-6 sm:w-[350px]">
        <VerifyEmailForm email={searchParams.email as string} />
      </div>
    </div>
  )
}