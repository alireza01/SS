import { createBrowserClient as createSupabaseBrowserClient } from '@supabase/ssr'

import type { Database } from "@/types/supabase"

import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase client for browser/client-side components
 * @returns Typed Supabase client instance
 */
export function createBrowserClient(): SupabaseClient<Database> {
  return createSupabaseBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  )
} 