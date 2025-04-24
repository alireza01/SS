import { useState } from "react"

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { toast } from "sonner"

import type { Database } from '@/types/supabase'

interface UseNewsletterReturn {
  subscribe: (email: string) => Promise<void>
  loading: boolean
}

export function useNewsletter(): UseNewsletterReturn {
  const [loading, setLoading] = useState(false)
  const supabase = createClientComponentClient<Database>()

  const subscribe = async (email: string) => {
    try {
      setLoading(true)
      
      // First check if already subscribed
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select()
        .eq('email', email)
        .single()

      if (existing) {
        if (existing.status === 'unsubscribed') {
          // Re-subscribe
          const { error } = await supabase
            .from('newsletter_subscribers')
            .update({ status: 'active' })
            .eq('email', email)

          if (error) throw error
          toast.success("Welcome back! You've been resubscribed to our newsletter.")
          return
        }
        toast.error("This email is already subscribed to our newsletter.")
        return
      }

      // Add new subscriber
      const { error } = await supabase
        .from('newsletter_subscribers')
        .insert([
          { 
            email,
            status: 'active'
          }
        ])

      if (error) throw error

      toast.success("Successfully subscribed to newsletter!")
    } catch (error) {
      console.error("Newsletter subscription error:", error)
      toast.error(error instanceof Error ? error.message : "Failed to subscribe to newsletter")
      throw error
    } finally {
      setLoading(false)
    }
  }

  return {
    subscribe,
    loading,
  }
} 