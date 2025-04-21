import { cookies } from "next/headers"
import type { NextRequest} from "next/server";
import { NextResponse } from "next/server"

import { createServerClient as _createServerClient } from "@supabase/ssr"

export function createServerClient(request: NextRequest) {
  const cookieStore = cookies()

  const supabase = _createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          try {
            cookieStore.set({ name, value, ...options })
          } catch (error) {
            // Handle cookie error
          }
        },
        remove(name: string, options: any) {
          try {
            cookieStore.set({ name, value: "", ...options })
          } catch (error) {
            // Handle cookie error
          }
        },
      },
    }
  )

  return { supabase, response: NextResponse.next() }
} 