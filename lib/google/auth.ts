import { createClient } from "@/lib/supabase/client"

import type { Provider } from "@supabase/supabase-js"


// Google Auth Configuration
export const googleAuthConfig = {
  provider: "google" as Provider,
  options: {
    redirectTo: typeof window !== "undefined" ? `${window.location.origin}/auth/callback` : undefined,
    queryParams: {
      access_type: "offline",
      prompt: "consent",
    },
    scopes: "email profile",
  },
}

// Sign in with Google
export const signInWithGoogle = async () => {
  const supabase = createClient()

  try {
    const { data, error } = await supabase.auth.signInWithOAuth(googleAuthConfig)

    if (error) {
      throw error
    }

    return { success: true, data }
  } catch (error) {
    console.error("Error signing in with Google:", error)
    return { success: false, error }
  }
}

// Get Google user profile
export const getGoogleUserProfile = async () => {
  const supabase = createClient()

  try {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    if (error || !session) {
      throw error || new Error("No session found")
    }

    // Get user profile from Supabase
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("userId", session.user.id)
      .single()

    if (profileError) {
      throw profileError
    }

    return { success: true, profile, user: session.user }
  } catch (error) {
    console.error("Error getting Google user profile:", error)
    return { success: false, error }
  }
}
