import { cookies } from 'next/headers'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'

import type { Database } from '../../types/database.types'

export const createServerClient = () => {
  return createServerComponentClient<Database>({ cookies })
}

export type ServerClient = ReturnType<typeof createServerClient> 