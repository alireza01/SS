"use client"

import { useState } from "react"

import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { createClient } from "@/lib/supabase/client"


interface ReadingSettingsProps {
  userId: string
  initialSettings?: {
    fontSize: number
    lineHeight: number
    fontFamily: string
    theme: "light" | "dark" | "system"
    interactiveFlipEnabled: boolean
    pageFlipSpeed: number
  }
}

export function ReadingSettings({ userId, initialSettings }: ReadingSettingsProps) {
  const supabase = createClient()
  const [settings, setSettings] = useState({
    fontSize: initialSettings?.fontSize || 18,
    lineHeight: initialSettings?.lineHeight || 1.6,
    fontFamily: initialSettings?.fontFamily || "serif",
    theme: initialSettings?.theme || "system",
    interactiveFlipEnabled: initialSettings?.interactiveFlipEnabled ?? true,
    pageFlipSpeed: initialSettings?.pageFlipSpeed || 0.5,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSaveSettings = async () => {
    if (!userId) {
      toast.error("لطفاً ابتدا وارد حساب کاربری خود شوید")
      return
    }

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("reading_settings")
        .upsert({
          userId,
          fontSize: settings.fontSize,
          lineHeight: settings.lineHeight,
          fontFamily: settings.fontFamily,
          theme: settings.theme,
          interactiveFlipEnabled: settings.interactiveFlipEnabled,
          pageFlipSpeed: settings.pageFlipSpeed,
          updatedAt: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      toast.success("تنظیمات با موفقیت ذخیره شد")
    } catch (error) {
      console.error("خطا در ذخیره تنظیمات:", error)
      toast.error("خطا در ذخیره تنظیمات")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>تنظیمات مطالعه</CardTitle>
        <CardDescription>تنظیمات نحوه نمایش و مطالعه کتاب‌ها را شخصی‌سازی کنید</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="font-size">اندازه متن</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">کوچک</span>
              <Slider
                id="font-size"
                value={[settings.fontSize]}
                min={14}
                max={24}
                step={1}
                onValueChange={(value: number[]) => setSettings({ ...settings, fontSize: value[0] })}
                className="flex-1"
              />
              <span className="text-muted-foreground text-sm">بزرگ</span>
            </div>
            <p className="text-muted-foreground text-left text-xs">{settings.fontSize}px</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="line-height">فاصله خطوط</Label>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground text-sm">کم</span>
              <Slider
                id="line-height"
                value={[settings.lineHeight * 10]}
                min={12}
                max={24}
                step={1}
                onValueChange={(value: number[]) => setSettings({ ...settings, lineHeight: value[0] / 10 })}
                className="flex-1"
              />
              <span className="text-muted-foreground text-sm">زیاد</span>
            </div>
            <p className="text-muted-foreground text-left text-xs">{settings.lineHeight.toFixed(1)}</p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="font-family">فونت</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) => setSettings({ ...settings, fontFamily: value })}
            >
              <SelectTrigger id="font-family">
                <SelectValue placeholder="انتخاب فونت" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="serif">سریف (Serif)</SelectItem>
                <SelectItem value="sans-serif">بدون سریف (Sans-serif)</SelectItem>
                <SelectItem value="monospace">مونواسپیس (Monospace)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="theme">حالت نمایش</Label>
            <Select value={settings.theme} onValueChange={(value: "light" | "dark" | "system") => setSettings({ ...settings, theme: value })}>
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
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-medium">تنظیمات ورق زدن</h3>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="interactive-flip">ورق زدن تعاملی</Label>
              <p className="text-muted-foreground text-sm">امکان ورق زدن با کشیدن صفحه</p>
            </div>
            <Switch
              id="interactive-flip"
              checked={settings.interactiveFlipEnabled}
              onCheckedChange={(checked: boolean) => setSettings({ ...settings, interactiveFlipEnabled: checked })}
            />
          </div>

          {settings.interactiveFlipEnabled && (
            <div className="space-y-2">
              <Label htmlFor="flip-speed">سرعت ورق زدن</Label>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground text-sm">آهسته</span>
                <Slider
                  id="flip-speed"
                  value={[settings.pageFlipSpeed * 10]}
                  min={1}
                  max={10}
                  step={1}
                  onValueChange={(value: number[]) => setSettings({ ...settings, pageFlipSpeed: value[0] / 10 })}
                  className="flex-1"
                />
                <span className="text-muted-foreground text-sm">سریع</span>
              </div>
              <p className="text-muted-foreground text-left text-xs">{settings.pageFlipSpeed.toFixed(1)} ثانیه</p>
            </div>
          )}
        </div>

        <div className="flex justify-end">
          <Button onClick={handleSaveSettings} disabled={isLoading}>
            {isLoading ? "در حال ذخیره..." : "ذخیره تنظیمات"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
