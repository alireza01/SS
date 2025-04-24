"use server"

import type { ResponseCookie } from "next/dist/compiled/@edge-runtime/cookies"
import { cookies } from "next/headers"

import { createServerClient as createClient, type CookieOptions } from "@supabase/ssr"

import type { Database } from "@/types/supabase"

import { SUPABASE_URL, SUPABASE_ANON_KEY, DEFAULT_COOKIE_OPTIONS } from "./config"

import type { SupabaseClient } from "@supabase/supabase-js"

/**
 * Creates a Supabase client for App Router server components
 * @returns Promise with typed Supabase client instance
 */
async function createSupabaseClient(): Promise<SupabaseClient<Database>> {
  const cookieStore = cookies()

  return createClient<Database>(
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
              ...DEFAULT_COOKIE_OPTIONS,
              ...options as Omit<ResponseCookie, "value">,
              name,
              value,
            })
          } catch (error) {
            console.warn("Failed to set cookie in middleware:", error)
          }
        },
        remove(name: string, options: CookieOptions) {
          try {
            cookieStore.set({
              ...DEFAULT_COOKIE_OPTIONS,
              ...options as Omit<ResponseCookie, "value">,
              name,
              value: "",
              maxAge: 0,
            })
          } catch (error) {
            console.warn("Failed to remove cookie in middleware:", error)
          }
        },
      },
    }
  )
}

/**
 * Server action to get a Supabase client instance
 * This function ensures we always get a fresh client instance
 * @returns Promise with Supabase client instance
 */
export async function createServerClient(): Promise<SupabaseClient<Database>> {
  return await createSupabaseClient()
} 