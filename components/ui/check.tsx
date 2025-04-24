import * as React from "react"

import { CheckIcon } from "lucide-react"

import { cn } from "@/lib/utils"

interface CheckProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  color?: "primary" | "secondary" | "success"
}

export function Check({
  className,
  size = "md",
  color = "primary",
  ...props
}: CheckProps) {
  const sizeClasses = {
    sm: "size-3",
    md: "size-4",
    lg: "size-5",
  }

  const colorClasses = {
    primary: "text-primary",
    secondary: "text-secondary",
    success: "text-success",
  }

  return (
    <div
      role="img"
      aria-label="check mark"
      className={cn("inline-flex items-center justify-center", className)}
      {...props}
    >
      <CheckIcon
        className={cn(
          sizeClasses[size],
          colorClasses[color]
        )}
      />
    </div>
  )
}
