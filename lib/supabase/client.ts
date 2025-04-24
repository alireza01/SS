"use client"

import { createBrowserClient } from "@supabase/ssr"

import type { Database } from "@/types/supabase"

import { SUPABASE_URL, SUPABASE_ANON_KEY } from "./config"

/**
 * Creates a Supabase client for client-side (browser) usage
 * @returns Typed Supabase client instance
 */
export function createClient() {
  return createBrowserClient<Database>(SUPABASE_URL!, SUPABASE_ANON_KEY!)
}
