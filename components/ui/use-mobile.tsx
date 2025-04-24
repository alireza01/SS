import * as React from "react"

type Breakpoint = "sm" | "md" | "lg" | "xl" | "2xl"

const BREAKPOINTS: Record<Breakpoint, number> = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  "2xl": 1536,
}

interface UseBreakpointOptions {
  breakpoint?: Breakpoint
  defaultValue?: boolean
}

export function useIsMobile(options: UseBreakpointOptions = {}) {
  const { breakpoint = "md", defaultValue = false } = options
  const [isMobile, setIsMobile] = React.useState<boolean>(defaultValue)
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
    const mql = window.matchMedia(`(max-width: ${BREAKPOINTS[breakpoint] - 1}px)`)
    
    const onChange = () => {
      setIsMobile(mql.matches)
    }

    mql.addEventListener("change", onChange)
    setIsMobile(mql.matches)

    return () => mql.removeEventListener("change", onChange)
  }, [breakpoint])

  return isClient ? isMobile : defaultValue
}

export function useIsBreakpoint(breakpoint: Breakpoint, defaultValue = false) {
  return useIsMobile({ breakpoint, defaultValue })
}
