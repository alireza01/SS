"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  BookOpen,
  Users,
  Settings,
  LogOut,
  LayoutDashboard,
  BookText,
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("خروج موفقیت‌آمیز")
      router.push("/")
    } catch (error) {
      console.error("خطا در خروج:", error)
      toast.error("خطا در خروج. لطفاً دوباره تلاش کنید.")
    }
  }

  const navItems = [
    {
      title: "داشبورد",
      href: "/admin",
      icon: LayoutDashboard,
    },
    {
      title: "کتاب‌ها",
      href: "/admin/books",
      icon: BookOpen,
    },
    {
      title: "واژگان",
      href: "/admin/words",
      icon: BookText,
    },
    {
      title: "کاربران",
      href: "/admin/users",
      icon: Users,
    },
    {
      title: "تنظیمات",
      href: "/admin/settings",
      icon: Settings,
    },
  ]

  return (
    <div className="bg-background flex h-screen w-64 flex-col border-l">
      <div className="flex h-14 items-center border-b px-4">
        <h2 className="text-lg font-semibold">پنل مدیریت</h2>
      </div>
      <div className="flex-1 space-y-1 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 space-x-reverse rounded-lg px-3 py-2 text-sm font-medium ${
                isActive
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <Icon className="size-4" />
              <span>{item.title}</span>
            </Link>
          )
        })}
      </div>
      <div className="border-t p-4">
        <Button
          variant="ghost"
          className="w-full justify-start space-x-3 space-x-reverse text-red-600 hover:text-red-600"
          onClick={handleSignOut}
        >
          <LogOut className="size-4" />
          <span>خروج</span>
        </Button>
      </div>
    </div>
  )
}
