import { createServerClient as createClient } from "@supabase/ssr"
import type { GetServerSidePropsContext } from "next"
import type { Database } from "@/types/supabase"

/**
 * Creates a Supabase client for Pages Router getServerSideProps
 * @param context GetServerSidePropsContext from Next.js
 * @returns Typed Supabase client instance
 */
export function createPagesClient(context: GetServerSidePropsContext) {
  return createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return context.req.cookies[name]
        },
        set(name: string, value: string, options: any) {
          context.res.setHeader(
            "Set-Cookie",
            `${name}=${value}; Path=/; HttpOnly; SameSite=Lax`
          )
        },
        remove(name: string) {
          context.res.setHeader(
            "Set-Cookie",
            `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
          )
        },
      },
    }
  )
} 