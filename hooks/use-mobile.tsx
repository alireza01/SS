"use client"

import { useMediaQuery } from "./use-media-query"

export const breakpoints = {
  mobile: 640,
  tablet: 768,
  laptop: 1024,
  desktop: 1280,
} as const

export type Breakpoint = keyof typeof breakpoints

export function useIsMobile() {
  return useMediaQuery(`(max-width: ${breakpoints.mobile - 1}px)`)
}

export function useIsTablet() {
  return useMediaQuery(`(min-width: ${breakpoints.mobile}px) and (max-width: ${breakpoints.tablet - 1}px)`)
}

export function useIsDesktop() {
  return useMediaQuery(`(min-width: ${breakpoints.laptop}px)`)
}

export function useBreakpoint(breakpoint: Breakpoint) {
  return useMediaQuery(`(min-width: ${breakpoints[breakpoint]}px)`)
}

// Example usage:
// const isMobile = useIsMobile()
// const isTablet = useIsTablet()
// const isDesktop = useIsDesktop()
// const isLaptopOrLarger = useBreakpoint('laptop')
