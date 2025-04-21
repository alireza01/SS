import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { nanoid } from "nanoid"

export async function POST(request: Request) {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated and is admin
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Check for admin role
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single()

    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const { name, type } = await request.json()

    // Generate a secure API key
    const key = `sk_${nanoid(32)}`

    // Store the API key in the database
    const { data: apiKey, error } = await supabase
      .from("api_keys")
      .insert([
        {
          name,
          key,
          type,
          created_by: session.user.id,
        },
      ])
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json(apiKey)
  } catch (error) {
    console.error("Error generating API key:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
} 
