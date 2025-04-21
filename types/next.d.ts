import { AppRouterInstance } from 'next/dist/shared/lib/app-router-context.shared-runtime'

declare module 'next/navigation' {
  export interface NavigateOptions {
    scroll?: boolean
    shallow?: boolean
  }

  export interface AppRouterInstance {
    refresh: () => void
    push: (href: string, options?: NavigateOptions) => void
    replace: (href: string, options?: NavigateOptions) => void
    prefetch: (href: string) => void
    back: () => void
    forward: () => void
  }
} 