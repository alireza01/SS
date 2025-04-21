"use client"

import { useState } from "react"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { createClient } from "@/lib/supabase/client"


interface UserSettingsProps {
  userId: string
  initialLevel: string
}

export function UserSettings({ userId, initialLevel }: UserSettingsProps) {
  const [level, setLevel] = useState(initialLevel || "beginner")
  const [fontSize, setFontSize] = useState("medium")
  const [showTranslationHints, setShowTranslationHints] = useState(true)
  const [autoPlayAudio, setAutoPlayAudio] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const { theme, setTheme } = useTheme()
  const supabase = createClient()
  const { toast } = useToast()

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true)

      // بررسی وجود تنظیمات کاربر
      const { data: existingSettings } = await supabase
        .from("user_settings")
        .select("id")
        .eq("userId", userId)
        .maybeSingle()

      if (existingSettings) {
        // به‌روزرسانی تنظیمات موجود
        await supabase
          .from("user_settings")
          .update({
            level,
            fontSize,
            showTranslationHints,
            autoPlayAudio,
            theme: theme || "system",
            updatedAt: new Date().toISOString(),
          })
          .eq("id", existingSettings.id)
      } else {
        // ایجاد تنظیمات جدید
        await supabase.from("user_settings").insert({
          userId,
          level,
          fontSize,
          showTranslationHints,
          autoPlayAudio,
          theme: theme || "system",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })
      }

      // به‌روزرسانی پروفایل کاربر
      await supabase.from("profiles").update({ level }).eq("id", userId)

      toast({
        title: "تنظیمات ذخیره شد",
        description: "تنظیمات شما با موفقیت ذخیره شد.",
      })
    } catch (error) {
      console.error("خطا در ذخیره تنظیمات:", error)
      toast({
        variant: "destructive",
        title: "خطا در ذخیره تنظیمات",
        description: "مشکلی در ذخیره تنظیمات رخ داد. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">تنظیمات کاربری</h2>

      <Card>
        <CardHeader>
          <CardTitle>تنظیمات زبان</CardTitle>
          <CardDescription>سطح زبانی خود را مشخص کنید تا کلمات متناسب با سطح شما نمایش داده شوند.</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup value={level} onValueChange={setLevel} className="flex flex-col space-y-3">
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="beginner" id="beginner" />
              <Label htmlFor="beginner" className="font-medium">
                مبتدی
              </Label>
              <p className="text-muted-foreground mr-2 text-sm">تازه شروع به یادگیری زبان انگلیسی کرده‌اید.</p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="intermediate" id="intermediate" />
              <Label htmlFor="intermediate" className="font-medium">
                متوسط
              </Label>
              <p className="text-muted-foreground mr-2 text-sm">
                با مفاهیم پایه آشنا هستید و می‌توانید متون ساده را بخوانید.
              </p>
            </div>
            <div className="flex items-center space-x-2 space-x-reverse">
              <RadioGroupItem value="advanced" id="advanced" />
              <Label htmlFor="advanced" className="font-medium">
                پیشرفته
              </Label>
              <p className="text-muted-foreground mr-2 text-sm">
                تسلط خوبی به زبان انگلیسی دارید و فقط با کلمات تخصصی مشکل دارید.
              </p>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تنظیمات نمایش</CardTitle>
          <CardDescription>نحوه نمایش محتوا را سفارشی کنید.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>حالت نمایش</Label>
                <p className="text-muted-foreground text-sm">حالت روشن یا تاریک را انتخاب کنید.</p>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Button
                  variant={theme === "light" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTheme("light")}
                >
                  <Sun className="size-5" />
                </Button>
                <Button variant={theme === "dark" ? "default" : "outline"} size="icon" onClick={() => setTheme("dark")}>
                  <Moon className="size-5" />
                </Button>
                <Button
                  variant={theme === "system" ? "default" : "outline"}
                  size="icon"
                  onClick={() => setTheme("system")}
                >
                  <Monitor className="size-5" />
                </Button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>اندازه متن</Label>
                <p className="text-muted-foreground text-sm">اندازه متن را برای مطالعه راحت‌تر تنظیم کنید.</p>
              </div>
              <Select value={fontSize} onValueChange={setFontSize}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">کوچک</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="large">بزرگ</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>نمایش راهنمای ترجمه</Label>
                <p className="text-muted-foreground text-sm">نمایش کلمات دشوار با رنگ‌های متفاوت بر اساس سطح دشواری</p>
              </div>
              <Switch checked={showTranslationHints} onCheckedChange={setShowTranslationHints} />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>پخش خودکار تلفظ</Label>
                <p className="text-muted-foreground text-sm">پخش خودکار تلفظ کلمات هنگام نمایش معنی</p>
              </div>
              <Switch checked={autoPlayAudio} onCheckedChange={setAutoPlayAudio} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSaveSettings} disabled={isLoading}>
          {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
        </Button>
      </div>
    </div>
  )
}
