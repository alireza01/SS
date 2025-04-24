import { cookies } from 'next/headers'

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'

import type { Database } from './database.types'

export const createServerClient = () => {
  const cookieStore = cookies()
  
  return createRouteHandlerClient<Database>({
    cookies: () => cookieStore
  })
}

export const supabaseServer = createServerClient(); 