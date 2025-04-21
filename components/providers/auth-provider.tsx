"use client"

import React from "react"
import { useState, useEffect, createContext, useContext } from "react"

import { useRouter } from "next/navigation"

import { event } from "@/lib/google/analytics"
import { googleAuthConfig } from "@/lib/google/auth"
import { createClient } from "@/lib/supabase/client"

import type { User, Session } from "@supabase/supabase-js"

interface AuthContextType {
  user: User | null
  session: Session | null
  isLoading: boolean
  error: Error | null
  signUp: (email: string, password: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getSession = async () => {
      setIsLoading(true)
      try {
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()
        if (error) {
          throw error
        }

        setSession(session)
        setUser(session?.user ?? null)
      } catch (error) {
        console.error("Error getting session:", error)
        setError(error instanceof Error ? error : new Error("Unknown error occurred"))
      } finally {
        setIsLoading(false)
      }
    }

    getSession()

    try {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setIsLoading(false)
      })

      return () => {
        subscription.unsubscribe()
      }
    } catch (error) {
      console.error("Error setting up auth state change listener:", error)
      setError(error instanceof Error ? error : new Error("Unknown error occurred"))
      setIsLoading(false)
      return () => {}
    }
  }, [supabase.auth])

  const signUp = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      })
      if (error) {
        throw error
      }

      // Track signup event
      event({
        action: "sign_up",
        category: "authentication",
        label: "email",
      })

      router.push("/auth/verify")
    } catch (error) {
      console.error("Error signing up:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      if (error) {
        throw error
      }

      // Track signin event
      event({
        action: "sign_in",
        category: "authentication",
        label: "email",
      })

      router.push("/dashboard")
    } catch (error) {
      console.error("Error signing in:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signInWithGoogle = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth(googleAuthConfig)
      if (error) {
        throw error
      }

      // Track Google signin event
      event({
        action: "sign_in",
        category: "authentication",
        label: "google",
      })
    } catch (error) {
      console.error("Error signing in with Google:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const signOut = async () => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }

      // Track signout event
      event({
        action: "sign_out",
        category: "authentication",
      })

      router.push("/")
    } catch (error) {
      console.error("Error signing out:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const resetPassword = async (email: string) => {
    setIsLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })
      if (error) {
        throw error
      }

      // Track password reset event
      event({
        action: "reset_password",
        category: "authentication",
      })
    } catch (error) {
      console.error("Error resetting password:", error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const value = {
    user,
    session,
    isLoading,
    error,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    resetPassword,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useSupabaseAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useSupabaseAuth must be used within an AuthProvider")
  }
  return context
}
