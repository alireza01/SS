import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import type { Database } from '../../types/database.types'

export const createClient = () => {
  return createClientComponentClient<Database>()
}

export type SupabaseClient = ReturnType<typeof createClient> 