import * as React from "react"

import { cn } from "@/lib/utils"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  fullScreen?: boolean
  text?: string
  color?: "primary" | "secondary" | "accent"
  overlay?: boolean
}

export function Loading({
  size = "md",
  fullScreen = false,
  text,
  color = "primary",
  overlay = true,
  className,
  ...props
}: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  }

  const colorClasses = {
    primary: "border-primary",
    secondary: "border-secondary",
    accent: "border-accent",
  }

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen && overlay && "bg-background/80 fixed inset-0 z-50 backdrop-blur-sm",
        fullScreen && !overlay && "fixed inset-0 z-50",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "animate-spin rounded-full border-r-transparent",
          sizeClasses[size],
          colorClasses[color]
        )}
      />
      {text && (
        <p className={cn(
          "text-sm",
          color === "primary" && "text-primary",
          color === "secondary" && "text-secondary",
          color === "accent" && "text-accent"
        )}>
          {text}
        </p>
      )}
      <span className="sr-only">Loading...</span>
    </div>
  )
} 