"use client"
import { X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"

interface PageFlipSettings {
  interactiveFlipEnabled: boolean
  pageFlipSpeed: number
  pageFlipThreshold: number
  pageFlipEasing: string
}

interface PageFlipSettingsProps {
  settings: PageFlipSettings
  updateSettings: (settings: Partial<PageFlipSettings>) => void
  onClose: () => void
}

export function PageFlipSettings({ settings, updateSettings, onClose }: PageFlipSettingsProps) {
  return (
    <Card className="mb-4">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle>تنظیمات ورق زدن</CardTitle>
          <CardDescription>تنظیمات نحوه ورق زدن کتاب را شخصی‌سازی کنید</CardDescription>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="size-4" />
          <span className="sr-only">بستن</span>
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="interactive-flip">ورق زدن تعاملی</Label>
            <p className="text-muted-foreground text-sm">امکان ورق زدن با کشیدن صفحه</p>
          </div>
          <Switch
            id="interactive-flip"
            checked={settings.interactiveFlipEnabled}
            onCheckedChange={(checked: boolean) => updateSettings({ interactiveFlipEnabled: checked })}
          />
        </div>

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
              onValueChange={(value: number[]) => updateSettings({ pageFlipSpeed: value[0] / 10 })}
              className="flex-1"
            />
            <span className="text-muted-foreground text-sm">سریع</span>
          </div>
          <p className="text-muted-foreground text-left text-xs">{settings.pageFlipSpeed.toFixed(1)} ثانیه</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flip-threshold">آستانه ورق زدن</Label>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground text-sm">کم</span>
            <Slider
              id="flip-threshold"
              value={[settings.pageFlipThreshold * 100]}
              min={10}
              max={50}
              step={5}
              onValueChange={(value: number[]) => updateSettings({ pageFlipThreshold: value[0] / 100 })}
              className="flex-1"
            />
            <span className="text-muted-foreground text-sm">زیاد</span>
          </div>
          <p className="text-muted-foreground text-left text-xs">{Math.round(settings.pageFlipThreshold * 100)}%</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="flip-easing">نوع انیمیشن</Label>
          <Select value={settings.pageFlipEasing} onValueChange={(value) => updateSettings({ pageFlipEasing: value })}>
            <SelectTrigger id="flip-easing">
              <SelectValue placeholder="انتخاب نوع انیمیشن" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easeOut">طبیعی (easeOut)</SelectItem>
              <SelectItem value="easeInOut">نرم (easeInOut)</SelectItem>
              <SelectItem value="easeIn">سریع در انتها (easeIn)</SelectItem>
              <SelectItem value="linear">یکنواخت (linear)</SelectItem>
              <SelectItem value="circOut">قوسی (circOut)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button
          variant="outline"
          className="w-full"
          onClick={() => {
            updateSettings({
              interactiveFlipEnabled: true,
              pageFlipSpeed: 0.5,
              pageFlipThreshold: 0.3,
              pageFlipEasing: "easeOut",
            })
          }}
        >
          بازنشانی به حالت پیش‌فرض
        </Button>
      </CardContent>
    </Card>
  )
}
