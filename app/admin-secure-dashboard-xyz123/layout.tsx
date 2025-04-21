import type { ReactNode } from "react"

import Link from "next/link"
import { redirect } from "next/navigation"

import { BookOpen, LayoutDashboard, LogOut, Settings, Users, BookText, Key } from "lucide-react"

import { Button } from "@/components/ui/button"
import { createServerClient } from "@/lib/supabase/server"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const supabase = createServerClient()

  // بررسی احراز هویت کاربر
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    // اگر کاربر وارد نشده باشد، به صفحه ورود هدایت می‌شود
    redirect("/auth/login?callbackUrl=/admin-secure-dashboard-xyz123")
  }

  // در یک پروژه واقعی، باید بررسی شود که کاربر دسترسی مدیر دارد یا خیر
  // const { data: profile } = await supabase
  //   .from("profiles")
  //   .select("role")
  //   .eq("user_id", session.user.id)
  //   .single()

  // if (profile?.role !== "admin") {
  //   redirect("/dashboard")
  // }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Sidebar */}
      <aside className="w-64 overflow-y-auto border-l border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">پنل مدیریت</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">کتاب‌یار</p>
        </div>

        <nav className="mt-6 space-y-1 px-3">
          <Link
            href="/admin-secure-dashboard-xyz123"
            className="flex items-center rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900 dark:bg-gray-700 dark:text-gray-200"
          >
            <LayoutDashboard className="ml-2 size-5" />
            داشبورد
          </Link>

          <Link
            href="/admin-secure-dashboard-xyz123/books"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <BookOpen className="ml-2 size-5" />
            مدیریت کتاب‌ها
          </Link>

          <Link
            href="/admin-secure-dashboard-xyz123/words"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <BookText className="ml-2 size-5" />
            مدیریت واژگان
          </Link>

          <Link
            href="/admin-secure-dashboard-xyz123/users"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Users className="ml-2 size-5" />
            مدیریت کاربران
          </Link>

          <Link
            href="/admin-secure-dashboard-xyz123/api-keys"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Key className="ml-2 size-5" />
            مدیریت API
          </Link>

          <Link
            href="/admin-secure-dashboard-xyz123/settings"
            className="flex items-center rounded-md px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            <Settings className="ml-2 size-5" />
            تنظیمات
          </Link>
        </nav>

        <div className="mt-auto border-t border-gray-200 p-4 dark:border-gray-700">
          <form action="/api/auth/logout" method="post">
            <Button variant="ghost" className="w-full justify-start text-red-600 dark:text-red-400">
              <LogOut className="ml-2 size-5" />
              خروج
            </Button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-6">{children}</main>
    </div>
  )
}
