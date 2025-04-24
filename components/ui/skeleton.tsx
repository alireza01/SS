import * as React from "react"

import { cn } from "@/lib/utils"

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "card" | "text" | "avatar" | "button"
  animate?: boolean
}

function Skeleton({
  className,
  variant = "default",
  animate = true,
  ...props
}: SkeletonProps) {
  const variants = {
    default: "h-4 w-full",
    card: "h-[200px] w-full rounded-xl",
    text: "h-4 w-[250px]",
    avatar: "h-12 w-12 rounded-full",
    button: "h-10 w-[100px] rounded-md",
  }

  return (
    <div
      className={cn(
        "bg-muted",
        animate && "animate-pulse",
        variants[variant],
        className
      )}
      {...props}
    />
  )
}

export { Skeleton }
export type { SkeletonProps }
