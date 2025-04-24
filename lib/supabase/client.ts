"use client"

import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/types/supabase"

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config"

/**
 * Creates a Supabase client for client-side (browser) usage
 * @returns Typed Supabase client instance
 * @throws Error if environment variables are not set
 */
export function createClient() {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error("Missing required Supabase environment variables")
  }
  return createBrowserClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)
}
