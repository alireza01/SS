import { cookies } from "next/headers"
import { createServerClient as createClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"
import type { Database } from "@/types/supabase"
import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"

/**
 * Creates a Supabase client for App Router server components
 * @returns Typed Supabase client instance
 */
export function createServerClient() {
  const cookieStore = cookies()

  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({
              value,
              ...options as Omit<ResponseCookie, "value">,
              name,
            })
          } catch (error) {
            console.warn("Failed to set cookie in middleware:", error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              value: "",
              maxAge: 0,
              ...options as Omit<ResponseCookie, "value">,
              name,
            })
          } catch (error) {
            console.warn("Failed to remove cookie in middleware:", error)
          }
        },
      },
    }
  )
} 