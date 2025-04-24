"use client"

import { Component, type ReactNode } from "react"

import { Button } from "@/components/ui/button"

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error("Error caught by error boundary:", error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="animate-in fade-in-50 flex min-h-[400px] w-full flex-col items-center justify-center rounded-md border border-dashed p-8 text-center">
          <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
            <h2 className="mb-2 text-xl font-semibold">خطایی رخ داد</h2>
            <p className="text-muted-foreground mb-4 text-sm">
              متأسفانه خطایی در اجرای برنامه رخ داده است. لطفاً صفحه را مجدداً بارگذاری کنید.
            </p>
            <Button
              onClick={() => {
                this.setState({ hasError: false })
                window.location.reload()
              }}
            >
              تلاش مجدد
            </Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ReactNode
) {
  return function WithErrorBoundary(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    )
  }
}