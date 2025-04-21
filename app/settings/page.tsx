import { redirect } from "next/navigation"

import { SettingsClient } from "@/components/settings/settings-client"
import { createServerClient } from "@/lib/supabase/server"

import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "تنظیمات | کتاب‌یار",
  description: "مدیریت تنظیمات و شخصی‌سازی برنامه",
}

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

export default async function SettingsPage() {
  const supabase = createServerClient()

  try {
    // بررسی احراز هویت کاربر
    const {
      data: { session },
      error: authError,
    } = await supabase.auth.getSession()

    if (authError) throw authError
    if (!session) {
      redirect("/auth/login?redirect=/settings")
    }

    // دریافت تنظیمات کاربر
    const { data: settings, error: settingsError } = await supabase
      .from("user_settings")
      .select("*")
      .eq("userId", session.user.id)
      .single()

    if (settingsError && settingsError.code !== "PGRST116") {
      throw settingsError
    }

    return <SettingsClient settings={settings as UserSettings | null} />
  } catch (error) {
    console.error("Error in settings page:", error)
    throw error
  }
}
