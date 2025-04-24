"use client"

import { type ReactNode, useEffect } from "react"

import { initGA, useGoogleAnalytics } from "@/lib/google/analytics"

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  // Initialize Google Analytics
  useEffect(() => {
    initGA()
  }, [])

  // Track page views
  useGoogleAnalytics()

  return <>{children}</>
}
