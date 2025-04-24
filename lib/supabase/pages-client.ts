import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { type GetServerSidePropsContext } from 'next'
import { type Database } from '@/types/supabase'

/**
 * Creates a Supabase client for Pages Router getServerSideProps
 * @param context GetServerSidePropsContext from Next.js
 * @returns Typed Supabase client instance
 */
export function createPagesClient(context: GetServerSidePropsContext) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return context.req.cookies[name]
      },
      set(name: string, value: string, options: CookieOptions) {
        context.res.setHeader(
          'Set-Cookie',
          `${name}=${value}; Path=/; HttpOnly; SameSite=Lax${
            options.maxAge ? `; Max-Age=${options.maxAge}` : ''
          }`
        )
      },
      remove(name: string, options: CookieOptions) {
        context.res.setHeader(
          'Set-Cookie',
          `${name}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`
        )
      },
    },
  })
} 