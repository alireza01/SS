import { NextResponse } from "next/server"

import { createServerClient } from "@/lib/supabase/app-server"
import type { Database } from "@/lib/supabase/database.types"

type EmailSettingsInsert = Database['public']['Tables']['email_settings']['Insert']
type EmailSettingsRow = Database['public']['Tables']['email_settings']['Row']

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const formData = await request.formData()
    
    const settings: Partial<EmailSettingsInsert> = {
      smtp_host: formData.get("smtpHost") as string,
      smtp_port: parseInt(formData.get("smtpPort") as string),
      smtp_username: formData.get("smtpUsername") as string,
      smtp_password: formData.get("smtpPassword") as string || null,
      updated_at: new Date().toISOString()
    }

    // Only update password if a new one is provided
    if (!settings.smtp_password) {
      delete settings.smtp_password
    }

    // Get existing settings first
    const { data: existingSettings, error: fetchError } = await supabase
      .from("email_settings")
      .select()
      .single()

    if (fetchError) {
      console.warn("No existing settings found, creating new record")
    } else if (existingSettings) {
      settings.id = existingSettings.id
    }

    const { error } = await supabase
      .from("email_settings")
      .upsert([settings])

    if (error) throw error

    return NextResponse.json({ message: "Email settings updated successfully" })
  } catch (error) {
    console.error("Error updating email settings:", error)
    return NextResponse.json(
      { error: "Failed to update email settings" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = createServerClient()
    
    const { data, error } = await supabase
      .from("email_settings")
      .select("smtp_host, smtp_port, smtp_username")
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching email settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch email settings" },
      { status: 500 }
    )
  }
}
