import { cookies } from "next/headers"
import { NextResponse } from "next/server"

import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { z } from "zod"

const subscribeSchema = z.object({
  email: z.string().email("Invalid email address"),
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email } = subscribeSchema.parse(body)
    const supabase = createRouteHandlerClient({ cookies })

    const { error } = await supabase
      .from("newsletter_subscribers")
      .insert([{ email }])

    if (error) {
      if (error.code === "23505") {
        // Unique violation - email already exists
        return NextResponse.json(
          { message: "You are already subscribed to our newsletter" },
          { status: 409 }
        )
      }
      throw error
    }

    return NextResponse.json(
      { message: "Successfully subscribed to newsletter" },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error("Newsletter subscription error:", error)
    return NextResponse.json(
      { message: "An error occurred while subscribing to the newsletter" },
      { status: 500 }
    )
  }
} 