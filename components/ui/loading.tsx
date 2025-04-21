import { cn } from "@/lib/utils"

interface LoadingProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg"
  fullScreen?: boolean
  text?: string
}

export function Loading({ size = "md", fullScreen = false, text, className, ...props }: LoadingProps) {
  const sizeClasses = {
    sm: "h-4 w-4 border-2",
    md: "h-8 w-8 border-3",
    lg: "h-12 w-12 border-4",
  }

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3",
        fullScreen && "bg-background/80 fixed inset-0 z-50 backdrop-blur-sm",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "border-primary animate-spin rounded-full border-r-transparent",
          sizeClasses[size]
        )}
      />
      {text && <p className="text-muted-foreground text-sm">{text}</p>}
    </div>
  )
} 