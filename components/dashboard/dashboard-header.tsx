"use client"

import { useState, useEffect } from "react"

import Link from "next/link"
import { usePathname } from "next/navigation"

import { motion } from "framer-motion"
import { Book, BookOpen, User, Home, Menu } from "lucide-react"

import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { UserAccountNav } from "@/components/user-account-nav"
import { useSupabaseAuth } from "@/hooks/use-supabase-auth"

export function DashboardHeader() {
  const { user } = useSupabaseAuth()
  const pathname = usePathname()
  const [isScrolled, setIsScrolled] = useState(false)
  
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])
  
  const navItems = [
    { href: '/dashboard', label: 'داشبورد', icon: Home },
    { href: '/library', label: 'کتابخانه', icon: Book },
    { href: '/profile', label: 'پروفایل', icon: User },
  ]
  
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.3 }}
      className={`sticky top-0 z-40 w-full transition-all duration-200 ${
        isScrolled 
          ? 'bg-white/80 shadow-sm backdrop-blur-md dark:bg-gray-900/80' 
          : 'bg-transparent'
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="size-6" />
            <span className="hidden text-xl font-bold md:inline-block">کتاب‌یار</span>
          </Link>
          
          <nav className="hidden items-center space-x-6 md:flex rtl:space-x-reverse">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`hover:text-primary flex items-center text-sm font-medium transition-colors ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="ml-2 size-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>
        </div>
        
        <div className="flex items-center gap-2">
          <ThemeToggle />
          
          {user ? (
            <UserAccountNav user={user} />
          ) : (
            <Button asChild variant="default" size="sm">
              <Link href="/auth/login">ورود</Link>
            </Button>
          )}
          
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="size-5" />
                <span className="sr-only">منو</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="pr-0">
              <div className="px-7">
                <Link href="/" className="mb-8 mt-4 flex items-center gap-2">
                  <BookOpen className="size-6" />
                  <span className="text-xl font-bold">کتاب‌یار</span>
                </Link>
                
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`hover:text-primary flex items-center text-sm font-medium transition-colors ${
                          isActive 
                            ? 'text-primary' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Icon className="ml-2 size-4" />
                        {item.label}
                      </Link>
                    )
                  })}
                </nav>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </motion.header>
  )
}

export default DashboardHeader
