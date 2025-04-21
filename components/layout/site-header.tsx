"use client"

import * as React from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { BookOpen, Menu, Home, Library, Grid, Info } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { UserAccountNav } from "@/components/user-account-nav"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

import type { User } from "@supabase/supabase-js"

interface NavItem {
  href: string
  label: string
  icon: React.ElementType
}

const navItems: NavItem[] = [
  { href: "/", label: "صفحه اصلی", icon: Home },
  { href: "/library", label: "کتابخانه", icon: Library },
  { href: "/categories", label: "دسته‌بندی‌ها", icon: Grid },
  { href: "/about", label: "درباره ما", icon: Info },
]

export function SiteHeader() {
  const pathname = usePathname()
  const [user, setUser] = React.useState<User | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [error, setError] = React.useState<string | null>(null)
  const supabase = createClient()

  React.useEffect(() => {
    const getUser = async () => {
      try {
        setLoading(true)
        const { data, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        setUser(data.user)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch user")
      } finally {
        setLoading(false)
      }
    }

    getUser()

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      authListener.subscription.unsubscribe()
    }
  }, [supabase.auth])

  return (
    <header className="bg-gold-800/95 supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full border-b shadow-md backdrop-blur dark:bg-gray-900/95">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2 space-x-reverse transition-opacity hover:opacity-80">
            <BookOpen className="text-gold-200 size-6" />
            <span className="text-gold-200 inline-block text-xl font-bold md:text-2xl">کتاب‌یار</span>
          </Link>
          <nav className="hidden gap-6 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "hover:text-gold-200 flex items-center gap-2 text-sm font-medium transition-colors",
                  pathname === item.href ? "text-gold-200" : "text-gold-200/60"
                )}
              >
                <item.icon className="size-4" />
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {loading ? (
            <Skeleton className="h-10 w-20" />
          ) : error ? (
            <Button variant="destructive" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          ) : user ? (
            <UserAccountNav user={user} />
          ) : (
            <div className="hidden gap-2 md:flex">
              <Button variant="outline" asChild>
                <Link href="/auth/login">ورود</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/register">ثبت‌نام</Link>
              </Button>
            </div>
          )}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="text-gold-200 size-5" />
                <span className="sr-only">منو</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="pr-0">
              <div className="px-7">
                <Link href="/" className="mb-8 mt-4 flex items-center gap-2">
                  <BookOpen className="text-gold-200 size-6" />
                  <span className="text-gold-200 text-xl font-bold">کتاب‌یار</span>
                </Link>
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "hover:text-primary flex items-center text-sm font-medium transition-colors",
                          isActive ? "text-primary" : "text-muted-foreground"
                        )}
                      >
                        <Icon className="ml-2 size-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                  {!user && (
                    <>
                      <Button variant="outline" asChild className="w-full">
                        <Link href="/auth/login">ورود</Link>
                      </Button>
                      <Button asChild className="w-full">
                        <Link href="/auth/register">ثبت‌نام</Link>
                      </Button>
                    </>
                  )}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
