"use client"

import React from "react"

import Link from "next/link"

import { motion } from "framer-motion"
import { BookOpen, Users, BookText, Activity } from "lucide-react"

import { AdminSidebar } from "@/components/admin/admin-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

interface AdminDashboardProps {
  stats?: {
    total_books: number
    total_users: number
    total_words: number
    active_users_last_week: number
  }
  isLoading?: boolean
  error?: string
}

export function AdminDashboard({ stats, isLoading, error }: AdminDashboardProps) {
  if (error) {
    return (
      <div className="flex min-h-screen">
        <AdminSidebar />
        <div className="flex-1 p-8">
          <div className="border-destructive bg-destructive/10 rounded-lg border p-4">
            <p className="text-destructive">خطا در دریافت اطلاعات: {error}</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen">
      <AdminSidebar />
      <div className="flex-1 p-8">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">داشبورد مدیریت</h1>
          <p className="text-muted-foreground">خوش آمدید! آمار و اطلاعات کلی سیستم را مشاهده کنید.</p>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">تعداد کتاب‌ها</CardTitle>
                <BookOpen className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.total_books ?? 0}</div>
                    <p className="text-muted-foreground text-xs">کتاب در سیستم</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">تعداد کاربران</CardTitle>
                <Users className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.total_users ?? 0}</div>
                    <p className="text-muted-foreground text-xs">کاربر ثبت‌نام شده</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">تعداد واژگان</CardTitle>
                <BookText className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.total_words ?? 0}</div>
                    <p className="text-muted-foreground text-xs">واژه تعریف شده</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">کاربران فعال</CardTitle>
                <Activity className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <Skeleton className="h-8 w-20" />
                ) : (
                  <>
                    <div className="text-2xl font-bold">{stats?.active_users_last_week ?? 0}</div>
                    <p className="text-muted-foreground text-xs">در هفته گذشته</p>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>مدیریت کتاب‌ها</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  در این بخش می‌توانید کتاب‌های جدید اضافه کنید، کتاب‌های موجود را ویرایش کنید یا کتاب‌ها را حذف کنید.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild>
                    <Link href="/admin/books">مدیریت کتاب‌ها</Link>
                  </Button>
                  <Button variant="outline" asChild>
                    <Link href="/admin/books/add">افزودن کتاب جدید</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.6 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>مدیریت واژگان</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">
                  در این بخش می‌توانید واژگان کتاب‌ها را مدیریت کنید، معانی و توضیحات آن‌ها را ویرایش کنید و سطح دشواری
                  آن‌ها را تعیین کنید.
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button asChild>
                    <Link href="/admin/words">مدیریت واژگان</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
