"use client"

import React from "react"
import { useEffect } from "react"

import { initGA, useGoogleAnalytics } from "@/lib/google/analytics"

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  // Initialize Google Analytics
  useEffect(() => {
    initGA()
  }, [])

  // Track page views
  useGoogleAnalytics()

  return <>{children}</>
}
