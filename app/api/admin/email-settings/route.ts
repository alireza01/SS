import { NextResponse } from "next/server"

import { createServerClient } from "@/lib/supabase/server"

interface EmailSettings {
  smtp_host: string | null
  smtp_port: number
  smtp_username: string | null
  smtp_password?: string | null
  updated_at: string
}

export async function POST(request: Request) {
  try {
    const supabase = createServerClient()
    const formData = await request.formData()
    
    const settings: EmailSettings = {
      smtp_host: formData.get("smtpHost") as string,
      smtp_port: parseInt(formData.get("smtpPort") as string),
      smtp_username: formData.get("smtpUsername") as string,
      smtp_password: formData.get("smtpPassword") as string,
      updated_at: new Date().toISOString()
    }

    // Only update password if a new one is provided
    if (!settings.smtp_password) {
      delete settings.smtp_password
    }

    const { error } = await supabase
      .from("email_settings")
      .upsert(settings)

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