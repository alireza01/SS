import { createClient } from '@supabase/supabase-js'
import { SUPABASE_URL, SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, type Database } from './config'

import { handleError, AuthenticationError } from '@/lib/utils/error-handling'

// Create a single supabase client for interacting with your database
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY)

/**
 * Creates a Supabase client with service role for admin operations
 * @returns Supabase client with admin privileges
 */
export function getServerSupabase() {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable')
  }

  return createClient<Database>(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY, {
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

export async function updateUserProfile(
  userId: string, 
  updates: Partial<Database['public']['Tables']['profiles']['Update']>
) {
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
    const query = supabase
      .from('books')
      .select('*, categories(*)')
      .eq('isActive', true)
    
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
      .select('*, books!inner(*)')
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
        last_read_at: new Date().toISOString(),
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
      .select('*, books!inner(*)')
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

export const getServiceSupabase = () => {
  if (!SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Missing Supabase service key')
  }
  
  return createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
} 