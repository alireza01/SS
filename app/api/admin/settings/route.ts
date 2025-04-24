import { NextResponse } from "next/server"

import { createServerClient } from "@/lib/supabase/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const formData = await request.formData()
    
    const settings = {
      site_name: formData.get("siteName"),
      site_description: formData.get("siteDescription"),
      allow_registration: formData.get("allowRegistration") === "true",
      maintenance_mode: formData.get("maintenanceMode") === "true",
      updated_at: new Date().toISOString()
    }

    const { error } = await supabase
      .from("site_settings")
      .upsert(settings)

    if (error) throw error

    return NextResponse.json({ message: "Settings updated successfully" })
  } catch (error) {
    console.error("Error updating settings:", error)
    return NextResponse.json(
      { error: "Failed to update settings" },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching settings:", error)
    return NextResponse.json(
      { error: "Failed to fetch settings" },
      { status: 500 }
    )
  }
}