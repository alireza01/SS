"use client"

import * as React from "react"
import type { HTMLAttributes, ForwardRefRenderFunction } from "react"

import { Card, CardContent } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

interface DashboardSkeletonProps extends HTMLAttributes<HTMLDivElement> {
  itemCount?: number
  cardCount?: number
}

const DashboardSkeleton: ForwardRefRenderFunction<HTMLDivElement, DashboardSkeletonProps> = (
  { className = "", itemCount = 3, cardCount = 4, ...props }, 
  ref
) => {
  return (
    <div className={cn("container space-y-8 py-8", className)} ref={ref} {...props} aria-label="Loading dashboard content">
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" aria-label="Loading title" />
        <Skeleton className="h-4 w-48" aria-label="Loading subtitle" />
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: cardCount }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" aria-label="Loading stat label" />
                  <Skeleton className="h-6 w-12" aria-label="Loading stat value" />
                </div>
                <Skeleton className="size-10 rounded-full" aria-label="Loading icon" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div className="space-y-6 md:col-span-2">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-6 w-48" aria-label="Loading section title" />
              <div className="space-y-4">
                {Array.from({ length: itemCount }).map((_, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <Skeleton className="size-12 rounded" aria-label="Loading item image" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-full" aria-label="Loading item title" />
                      <Skeleton className="h-3 w-3/4" aria-label="Loading item description" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <Skeleton className="mb-4 h-6 w-32" aria-label="Loading stats title" />
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" aria-label="Loading stat 1 label" />
                    <Skeleton className="h-4 w-16" aria-label="Loading stat 1 value" />
                  </div>
                  <Skeleton className="h-2 w-full" aria-label="Loading progress bar 1" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Skeleton className="h-4 w-24" aria-label="Loading stat 2 label" />
                    <Skeleton className="h-4 w-16" aria-label="Loading stat 2 value" />
                  </div>
                  <Skeleton className="h-2 w-full" aria-label="Loading progress bar 2" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
DashboardSkeleton.displayName = "DashboardSkeleton"

export { DashboardSkeleton } 