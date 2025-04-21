import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { createServerClient } from "@/lib/supabase/app-server"

export default async function SettingsPage() {
  const supabase = createServerClient()
  
  const { data: settings } = await supabase
    .from("site_settings")
    .select("*")
    .single()

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">تنظیمات سایت</h1>

      <Card>
        <CardHeader>
          <CardTitle>تنظیمات عمومی</CardTitle>
          <CardDescription>تنظیمات پایه‌ای سایت را در اینجا مدیریت کنید</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action="/api/admin/settings" method="POST" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-name">نام سایت</Label>
              <Input 
                id="site-name" 
                name="siteName" 
                defaultValue={settings?.site_name || "کتاب‌یار"} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="site-description">توضیحات سایت</Label>
              <Input 
                id="site-description" 
                name="siteDescription"
                defaultValue={settings?.site_description || "پلتفرم آموزش زبان از طریق مطالعه"}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="registration">ثبت‌نام کاربران</Label>
                <p className="text-muted-foreground text-sm">
                  اجازه ثبت‌نام کاربران جدید در سایت
                </p>
              </div>
              <Switch 
                id="registration" 
                name="allowRegistration"
                defaultChecked={settings?.allow_registration}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="maintenance">حالت تعمیر و نگهداری</Label>
                <p className="text-muted-foreground text-sm">
                  فعال کردن حالت تعمیر و نگهداری سایت
                </p>
              </div>
              <Switch 
                id="maintenance" 
                name="maintenanceMode"
                defaultChecked={settings?.maintenance_mode}
              />
            </div>

            <Button type="submit" className="mt-4">
              ذخیره تنظیمات
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>تنظیمات ایمیل</CardTitle>
          <CardDescription>پیکربندی سیستم ارسال ایمیل</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <form action="/api/admin/email-settings" method="POST" className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="smtp-host">SMTP Host</Label>
              <Input 
                id="smtp-host" 
                name="smtpHost"
                defaultValue={settings?.smtp_host} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-port">SMTP Port</Label>
              <Input 
                id="smtp-port" 
                name="smtpPort"
                type="number"
                defaultValue={settings?.smtp_port || 587} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-user">SMTP Username</Label>
              <Input 
                id="smtp-user" 
                name="smtpUsername"
                defaultValue={settings?.smtp_username} 
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="smtp-pass">SMTP Password</Label>
              <Input 
                id="smtp-pass" 
                name="smtpPassword"
                type="password"
                placeholder="••••••••"
              />
            </div>

            <Button type="submit">
              ذخیره تنظیمات ایمیل
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
