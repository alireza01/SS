"use client"

import * as React from "react"

import { Button, type ButtonProps } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface ErrorCardProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  description: string
  retryButton?: Omit<ButtonProps, "children"> & {
    children: React.ReactNode
  }
  className?: string
}

const ErrorCard = React.forwardRef<HTMLDivElement, ErrorCardProps>(
  ({ title, description, retryButton, className, ...props }, ref) => {
    return (
      <div className={cn("container py-8", className)} ref={ref} {...props}>
        <Card>
          <CardHeader>
            <CardTitle>{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          {retryButton && (
            <CardContent className="flex flex-col items-center gap-4">
              <Button {...retryButton} />
            </CardContent>
          )}
        </Card>
      </div>
    )
  }
)
ErrorCard.displayName = "ErrorCard"

export { ErrorCard } 