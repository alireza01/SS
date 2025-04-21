"use client"

import { motion } from "framer-motion"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function ThemeToggle() {
  const { setTheme, theme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-gold-800 dark:text-gold-200 hover:bg-gold-200/50 hover:text-gold-800 dark:hover:text-gold-200 rounded-full dark:hover:bg-gray-800"
        >
          <motion.div
            animate={{ rotate: theme === "dark" ? 180 : 0 }}
            transition={{ duration: 0.5, type: "spring", stiffness: 200 }}
          >
            <Sun className="size-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          </motion.div>
          <span className="sr-only">تغییر تم</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="border-gold-200 bg-white dark:border-gray-800 dark:bg-gray-900">
        <DropdownMenuItem
          onClick={() => setTheme("light")}
          className="text-gold-800 dark:text-gold-200 focus:bg-gold-200/50 focus:text-gold-800 dark:focus:text-gold-200 dark:focus:bg-gray-800"
        >
          روشن
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("dark")}
          className="text-gold-800 dark:text-gold-200 focus:bg-gold-200/50 focus:text-gold-800 dark:focus:text-gold-200 dark:focus:bg-gray-800"
        >
          تاریک
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setTheme("system")}
          className="text-gold-800 dark:text-gold-200 focus:bg-gold-200/50 focus:text-gold-800 dark:focus:text-gold-200 dark:focus:bg-gray-800"
        >
          سیستم
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
