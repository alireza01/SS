"use client"

import { useState } from "react"

import Link from "next/link"

import { ArrowLeft, Bell, Eye, Shield, Languages } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"


interface UserSettings {
  id: string
  userId: string
  theme: "light" | "dark" | "system"
  fontSize: "small" | "medium" | "large"
  emailNotifications: boolean
  pushNotifications: boolean
  reviewReminders: boolean
  autoPlayPronunciation: boolean
  showTranslationHints: boolean
  createdAt: string
  updatedAt: string
}

interface SettingsClientProps {
  settings: UserSettings | null
}

export function SettingsClient({ settings }: SettingsClientProps) {
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("appearance")
  const [isLoading, setIsLoading] = useState(false)

  // تنظیمات پیش‌فرض
  const defaultSettings: UserSettings = {
    id: "",
    userId: "",
    theme: "system",
    fontSize: "medium",
    emailNotifications: true,
    pushNotifications: false,
    reviewReminders: true,
    autoPlayPronunciation: false,
    showTranslationHints: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  // استفاده از تنظیمات موجود یا پیش‌فرض
  const userSettings = settings || defaultSettings

  // وضعیت تنظیمات
  const [theme, setTheme] = useState<"light" | "dark" | "system">(userSettings.theme)
  const [fontSize, setFontSize] = useState<"small" | "medium" | "large">(userSettings.fontSize)
  const [emailNotifications, setEmailNotifications] = useState(userSettings.emailNotifications)
  const [pushNotifications, setPushNotifications] = useState(userSettings.pushNotifications)
  const [reviewReminders, setReviewReminders] = useState(userSettings.reviewReminders)
  const [autoPlayPronunciation, setAutoPlayPronunciation] = useState(userSettings.autoPlayPronunciation)
  const [showTranslationHints, setShowTranslationHints] = useState(userSettings.showTranslationHints)

  // ذخیره تنظیمات
  const saveSettings = async () => {
    setIsLoading(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error("کاربر احراز هویت نشده است")
      }

      const updatedSettings = {
        userId: userData.user.id,
        theme,
        fontSize,
        emailNotifications,
        pushNotifications,
        reviewReminders,
        autoPlayPronunciation,
        showTranslationHints,
        updatedAt: new Date().toISOString(),
      }

      if (settings) {
        // به‌روزرسانی تنظیمات موجود
        const { error } = await supabase.from("user_settings").update(updatedSettings).eq("id", settings.id)

        if (error) {
          throw error
        }
      } else {
        // ایجاد تنظیمات جدید
        const { error } = await supabase.from("user_settings").insert({
          ...updatedSettings,
          createdAt: new Date().toISOString(),
        })

        if (error) {
          throw error
        }
      }

      toast.success("تنظیمات با موفقیت ذخیره شد")

      // اعمال تنظیمات تم
      if (theme === "light") {
        document.documentElement.classList.remove("dark")
      } else if (theme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        // system
        if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
          document.documentElement.classList.add("dark")
        } else {
          document.documentElement.classList.remove("dark")
        }
      }

      // اعمال تنظیمات اندازه فونت
      document.documentElement.style.fontSize = fontSize === "small" ? "14px" : fontSize === "medium" ? "16px" : "18px"
    } catch (error) {
      console.error("خطا در ذخیره تنظیمات:", error)
      toast.error("خطا در ذخیره تنظیمات")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="ml-1 size-4" />
            بازگشت به داشبورد
          </Link>
        </Button>
      </div>

      <div className="flex flex-col gap-8 md:flex-row">
        <Card className="h-fit md:w-64">
          <CardContent className="p-4">
            <nav className="flex flex-row gap-2 md:flex-col">
              <Button
                variant={activeTab === "appearance" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("appearance")}
              >
                <Eye className="ml-2 size-4" />
                ظاهر
              </Button>
              <Button
                variant={activeTab === "notifications" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("notifications")}
              >
                <Bell className="ml-2 size-4" />
                اعلان‌ها
              </Button>
              <Button
                variant={activeTab === "learning" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("learning")}
              >
                <Languages className="ml-2 size-4" />
                یادگیری
              </Button>
              <Button
                variant={activeTab === "account" ? "default" : "ghost"}
                className="justify-start"
                onClick={() => setActiveTab("account")}
              >
                <Shield className="ml-2 size-4" />
                حساب کاربری
              </Button>
            </nav>
          </CardContent>
        </Card>

        <div className="flex-1">
          <Card>
            <CardHeader>
              <CardTitle>تنظیمات</CardTitle>
              <CardDescription>تنظیمات برنامه را مطابق با نیازهای خود شخصی‌سازی کنید.</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsContent value="appearance" className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">ظاهر</h3>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="theme">حالت نمایش</Label>
                        <Select value={theme} onValueChange={(value) => setTheme(value as any)}>
                          <SelectTrigger id="theme">
                            <SelectValue placeholder="انتخاب حالت نمایش" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="light">روشن</SelectItem>
                            <SelectItem value="dark">تاریک</SelectItem>
                            <SelectItem value="system">سیستم</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="fontSize">اندازه متن</Label>
                        <Select value={fontSize} onValueChange={(value) => setFontSize(value as any)}>
                          <SelectTrigger id="fontSize">
                            <SelectValue placeholder="انتخاب اندازه متن" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="small">کوچک</SelectItem>
                            <SelectItem value="medium">متوسط</SelectItem>
                            <SelectItem value="large">بزرگ</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notifications" className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">اعلان‌ها</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="emailNotifications">اعلان‌های ایمیلی</Label>
                          <p className="text-muted-foreground text-sm">دریافت اعلان‌ها و به‌روزرسانی‌ها از طریق ایمیل</p>
                        </div>
                        <Switch
                          id="emailNotifications"
                          checked={emailNotifications}
                          onCheckedChange={setEmailNotifications}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="pushNotifications">اعلان‌های پوش</Label>
                          <p className="text-muted-foreground text-sm">دریافت اعلان‌ها در مرورگر یا دستگاه موبایل</p>
                        </div>
                        <Switch
                          id="pushNotifications"
                          checked={pushNotifications}
                          onCheckedChange={setPushNotifications}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="reviewReminders">یادآوری مرور واژگان</Label>
                          <p className="text-muted-foreground text-sm">دریافت یادآوری برای مرور روزانه واژگان</p>
                        </div>
                        <Switch id="reviewReminders" checked={reviewReminders} onCheckedChange={setReviewReminders} />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="learning" className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">یادگیری</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="autoPlayPronunciation">پخش خودکار تلفظ</Label>
                          <p className="text-muted-foreground text-sm">پخش خودکار تلفظ کلمات هنگام مرور واژگان</p>
                        </div>
                        <Switch
                          id="autoPlayPronunciation"
                          checked={autoPlayPronunciation}
                          onCheckedChange={setAutoPlayPronunciation}
                        />
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                          <Label htmlFor="showTranslationHints">نمایش راهنمای ترجمه</Label>
                          <p className="text-muted-foreground text-sm">نمایش راهنما و ترجمه کلمات دشوار هنگام مطالعه</p>
                        </div>
                        <Switch
                          id="showTranslationHints"
                          checked={showTranslationHints}
                          onCheckedChange={setShowTranslationHints}
                        />
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="account" className="space-y-6">
                  <div>
                    <h3 className="mb-4 text-lg font-medium">حساب کاربری</h3>
                    <div className="space-y-4">
                      <Button variant="outline" asChild>
                        <Link href="/profile">ویرایش پروفایل</Link>
                      </Button>

                      <Separator />

                      <Button variant="outline" asChild>
                        <Link href="/auth/reset-password">تغییر رمز عبور</Link>
                      </Button>

                      <Separator />

                      <Button variant="outline" asChild>
                        <Link href="/subscription">مدیریت اشتراک</Link>
                      </Button>
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="mt-8 flex justify-end">
                <Button onClick={saveSettings} disabled={isLoading}>
                  {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
