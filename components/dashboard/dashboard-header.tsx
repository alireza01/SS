"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { Book, BookOpen, User, Home, Menu } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ThemeToggle } from "@/components/theme-toggle"
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
          ? 'bg-white/80 dark:bg-gray-900/80 backdrop-blur-md shadow-sm' 
          : 'bg-transparent'
      }`}
    >
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6 md:gap-10">
          <Link href="/" className="flex items-center space-x-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-bold text-xl hidden md:inline-block">کتاب‌یار</span>
          </Link>
          
          <nav className="hidden md:flex items-center space-x-6 rtl:space-x-reverse">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                    isActive 
                      ? 'text-primary' 
                      : 'text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4 ml-2" />
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
                <Menu className="h-5 w-5" />
                <span className="sr-only">منو</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="pr-0">
              <div className="px-7">
                <Link href="/" className="flex items-center gap-2 mb-8 mt-4">
                  <BookOpen className="h-6 w-6" />
                  <span className="font-bold text-xl">کتاب‌یار</span>
                </Link>
                
                <nav className="flex flex-col gap-4">
                  {navItems.map((item) => {
                    const Icon = item.icon
                    const isActive = pathname === item.href
                    
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center text-sm font-medium transition-colors hover:text-primary ${
                          isActive 
                            ? 'text-primary' 
                            : 'text-muted-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4 ml-2" />
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
