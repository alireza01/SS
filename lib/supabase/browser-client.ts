import { createBrowserClient as createClient } from "@supabase/ssr"
import type { Database } from "@/types/supabase"

/**
 * Creates a Supabase client for browser/client-side components
 * @returns Typed Supabase client instance
 */
export function createBrowserClient() {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
} 