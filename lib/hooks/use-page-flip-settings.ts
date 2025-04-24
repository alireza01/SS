import { useEffect, useState } from "react"

import { createClient } from "@/lib/supabase/client"

export interface PageFlipSettings {
  interactiveFlipEnabled: boolean
  pageFlipSpeed: number
  pageFlipThreshold: number
  pageFlipEasing: string
}

const defaultSettings: PageFlipSettings = {
  interactiveFlipEnabled: true,
  pageFlipSpeed: 0.5,
  pageFlipThreshold: 0.3,
  pageFlipEasing: "easeOut",
}

export function usePageFlipSettings(userId?: string) {
  const [settings, setSettings] = useState<PageFlipSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function loadSettings() {
      if (!userId) {
        setIsLoading(false)
        return
      }

      try {
        const { data, error } = await supabase
          .from("reading_settings")
          .select("page_flip_settings")
          .eq("user_id", userId)
          .single()

        if (error) throw error

        if (data?.page_flip_settings) {
          setSettings(data.page_flip_settings as PageFlipSettings)
        }
      } catch (error) {
        console.error("Error loading page flip settings:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSettings()
  }, [userId, supabase])

  const updateSettings = async (newSettings: Partial<PageFlipSettings>) => {
    if (!userId) return

    const updatedSettings = { ...settings, ...newSettings }
    setSettings(updatedSettings)

    try {
      const { error } = await supabase
        .from("reading_settings")
        .upsert({
          user_id: userId,
          page_flip_settings: updatedSettings,
          updated_at: new Date().toISOString(),
        })

      if (error) throw error
    } catch (error) {
      console.error("Error saving page flip settings:", error)
      // Revert settings if save fails
      setSettings(settings)
    }
  }

  const resetSettings = () => {
    updateSettings(defaultSettings)
  }

  return {
    settings,
    isLoading,
    updateSettings,
    resetSettings,
  }
} 