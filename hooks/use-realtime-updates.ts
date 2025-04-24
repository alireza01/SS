import { useEffect } from 'react'

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

import type { Database } from '@/types/supabase'

import type { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js'

type TableRow = { [key: string]: any }

type SubscriptionCallback<T extends TableRow> = (payload: RealtimePostgresChangesPayload<T>) => void

interface UseRealtimeUpdatesOptions<T extends TableRow> {
  table: string
  onInsert?: SubscriptionCallback<T>
  onUpdate?: SubscriptionCallback<T>
  onDelete?: SubscriptionCallback<T>
  filter?: {
    column: string
    value: any
  }
}

export function useRealtimeUpdates<T extends TableRow>({
  table,
  onInsert,
  onUpdate,
  onDelete,
  filter
}: UseRealtimeUpdatesOptions<T>) {
  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    let channel: RealtimeChannel

    const setupSubscription = async () => {
      try {
        const query = supabase
          .channel(`${table}-changes`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: table,
              ...(filter && { filter: `${filter.column}=eq.${filter.value}` })
            },
            (payload: RealtimePostgresChangesPayload<T>) => {
              switch (payload.eventType) {
                case 'INSERT':
                  onInsert?.(payload)
                  break
                case 'UPDATE':
                  onUpdate?.(payload)
                  break
                case 'DELETE':
                  onDelete?.(payload)
                  break
              }
            }
          )

        channel = query.subscribe((status, err) => {
          if (status === 'SUBSCRIBED') {
            console.log(`Subscribed to ${table} changes`)
          }
          if (status === 'CHANNEL_ERROR') {
            console.error(`Error subscribing to ${table} changes:`, err)
          }
        })
      } catch (error) {
        console.error(`Error setting up subscription for ${table}:`, error)
      }
    }

    setupSubscription()

    return () => {
      if (channel) {
        supabase.removeChannel(channel)
      }
    }
  }, [table, onInsert, onUpdate, onDelete, filter, supabase])
}

// Example usage for books:
export function useBookUpdates(bookId?: string) {
  return useRealtimeUpdates<Database['public']['Tables']['books']['Row']>({
    table: 'books',
    ...(bookId && {
      filter: {
        column: 'id',
        value: bookId
      }
    })
  })
}

// Example usage for vocabulary:
export function useVocabularyUpdates(userId?: string) {
  return useRealtimeUpdates<Database['public']['Tables']['vocabulary']['Row']>({
    table: 'vocabulary',
    ...(userId && {
      filter: {
        column: 'user_id',
        value: userId
      }
    })
  })
}

// Example usage for user progress:
export function useUserProgressUpdates(userId: string) {
  return useRealtimeUpdates<Database['public']['Tables']['user_progress']['Row']>({
    table: 'user_progress',
    filter: {
      column: 'user_id',
      value: userId
    }
  })
}