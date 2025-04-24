"use client"


import Link from "next/link"
import { useRouter } from "next/navigation"

import { BookOpen, UserIcon, Settings, LogOut } from "lucide-react"
import { toast } from "sonner"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { createClient } from "@/lib/supabase/client"

import type { User } from "@supabase/supabase-js"

interface UserAccountNavProps {
  user: User & {
    username?: string
  }
}

export function UserAccountNav({ user }: UserAccountNavProps) {
  const router = useRouter()
  const supabase = createClient()
  const avatarUrl = user?.user_metadata?.avatar_url as string | undefined

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      toast.success("خروج موفقیت‌آمیز")
      router.replace("/")
    } catch (error) {
      console.error("خطا در خروج:", error)
      toast.error("خطا در خروج. لطفاً دوباره تلاش کنید.")
    }
  }

  // استخراج حرف اول نام کاربر یا ایمیل
  const getInitials = () => {
    if (user.user_metadata?.name) {
      return user.user_metadata.name.charAt(0).toUpperCase()
    }
    if (user.email) {
      return user.email.charAt(0).toUpperCase()
    }
    return "U"
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative size-8 rounded-full">
          <Avatar className="size-8">
            <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="تصویر پروفایل" />
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <div className="flex items-center justify-start gap-2 p-2">
          <div className="flex flex-col space-y-1 leading-none">
            {user.user_metadata?.name && <p className="font-medium">{user.user_metadata.name}</p>}
            {user.email && <p className="text-muted-foreground w-[200px] truncate text-sm">{user.email}</p>}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/dashboard" className="cursor-pointer">
            <BookOpen className="ml-2 size-4" />
            <span>داشبورد</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/review" className="cursor-pointer">
            <BookOpen className="ml-2 size-4" />
            <span>مرور واژگان</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/profile/${user.username}`} className="cursor-pointer">
            <UserIcon className="ml-2 size-4" />
            <span>پروفایل</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/settings" className="cursor-pointer">
            <Settings className="ml-2 size-4" />
            <span>تنظیمات</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600" onSelect={handleSignOut}>
          <LogOut className="ml-2 size-4" />
          <span>خروج</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
