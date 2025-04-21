import { createClient } from '@supabase/supabase-js'

import { handleError, AuthenticationError } from '@/lib/utils/error-handling'
import type { Database } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient<Database>(supabaseUrl, supabaseKey)

export const getServerSupabase = () => {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

// Helper functions for common database operations
export async function getUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) throw error
    if (!data) throw new AuthenticationError('Profile not found')
    
    return data
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateUserProfile(userId: string, updates: Partial<Database['public']['Tables']['profiles']['Update']>) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    if (!data) throw new AuthenticationError('Profile not found')
    
    return data
  } catch (error) {
    throw handleError(error)
  }
}

export async function getBooks(level?: string) {
  try {
    const query = supabase.from('books').select('*')
    if (level) {
      query.eq('level', level)
    }
    const { data, error } = await query

    if (error) throw error
    return data
  } catch (error) {
    throw handleError(error)
  }
}

export async function getUserProgress(userId: string, bookId?: string) {
  try {
    const query = supabase
      .from('user_progress')
      .select('*, books(*)')
      .eq('user_id', userId)
    
    if (bookId) {
      query.eq('book_id', bookId)
    }
    
    const { data, error } = await query

    if (error) throw error
    return data
  } catch (error) {
    throw handleError(error)
  }
}

export async function updateUserProgress(
  userId: string,
  bookId: string,
  updates: Partial<Database['public']['Tables']['user_progress']['Update']>
) {
  try {
    const { data, error } = await supabase
      .from('user_progress')
      .upsert({
        user_id: userId,
        book_id: bookId,
        ...updates,
      })
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to update progress')
    
    return data
  } catch (error) {
    throw handleError(error)
  }
}

export async function getUserVocabulary(userId: string, bookId?: string) {
  try {
    const query = supabase
      .from('vocabulary')
      .select('*, books(*)')
      .eq('user_id', userId)
    
    if (bookId) {
      query.eq('book_id', bookId)
    }
    
    const { data, error } = await query

    if (error) throw error
    return data
  } catch (error) {
    throw handleError(error)
  }
}

export async function addVocabularyWord(
  userId: string,
  word: Database['public']['Tables']['vocabulary']['Insert']
) {
  try {
    const { data, error } = await supabase
      .from('vocabulary')
      .insert({ ...word, user_id: userId })
      .select()
      .single()

    if (error) throw error
    if (!data) throw new Error('Failed to add vocabulary word')
    
    return data
  } catch (error) {
    throw handleError(error)
  }
} 