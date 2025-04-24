import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from 'next/server'

import { createServerClient, type CookieOptions } from '@supabase/ssr'

import { SUPABASE_URL, SUPABASE_ANON_KEY, DEFAULT_COOKIE_OPTIONS, type Database } from "./config"

/**
 * Creates a Supabase client for middleware with proper cookie handling
 */
export function createMiddlewareClient(request: NextRequest) {
  const cookieStore = cookies()

  const supabase = createServerClient<Database>(
    SUPABASE_URL!,
    SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value,
              ...DEFAULT_COOKIE_OPTIONS,
              ...options,
            })
          } catch (error) {
            console.warn("Failed to set cookie in middleware:", error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              name,
              value: "",
              ...DEFAULT_COOKIE_OPTIONS,
              ...options,
              maxAge: 0,
            })
          } catch (error) {
            console.warn("Failed to remove cookie in middleware:", error)
          }
        },
      },
    }
  )

  return { supabase, response: NextResponse.next() }
} 