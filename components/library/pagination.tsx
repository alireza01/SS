"use client"

import * as React from "react"

import { ChevronLeft, ChevronRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

type PageItem = number | "..."

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const getPageNumbers = React.useCallback((): PageItem[] => {
    const delta = 2
    const range: number[] = []
    const rangeWithDots: PageItem[] = []
    let l: number | undefined

    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - delta && i <= currentPage + delta)) {
        range.push(i)
      }
    }

    range.forEach((i) => {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1)
        } else if (i - l !== 1) {
          rangeWithDots.push("...")
        }
      }
      rangeWithDots.push(i)
      l = i
    })

    return rangeWithDots
  }, [currentPage, totalPages])

  const handleKeyDown = React.useCallback((e: React.KeyboardEvent, page: number) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault()
      onPageChange(page)
    }
  }, [onPageChange])

  const handlePrevious = React.useCallback(() => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1)
    }
  }, [currentPage, onPageChange])

  const handleNext = React.useCallback(() => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1)
    }
  }, [currentPage, totalPages, onPageChange])

  return (
    <nav className="bg-white px-4 py-8 dark:bg-gray-900" aria-label="صفحه‌بندی">
      <div className="container mx-auto">
        <div className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            className={cn(
              "size-8 rounded-full",
              currentPage === 1 && "cursor-not-allowed opacity-50"
            )}
            onClick={handlePrevious}
            disabled={currentPage === 1}
            aria-label="صفحه قبل"
            aria-disabled={currentPage === 1}
          >
            <ChevronRight className="size-4" aria-hidden="true" />
          </Button>

          <div className="flex items-center gap-2" role="list">
            {getPageNumbers().map((page, index) => {
              if (typeof page === "number") {
                return (
                  <Button
                    key={index}
                    variant={page === currentPage ? "default" : "outline"}
                    className={cn(
                      "size-8 rounded-full",
                      page === currentPage
                        ? "from-gold-300 to-gold-400 bg-gradient-to-r text-white"
                        : "border-gold-200 dark:border-gray-700"
                    )}
                    onClick={() => onPageChange(page)}
                    onKeyDown={(e) => handleKeyDown(e, page)}
                    aria-label={`صفحه ${page}`}
                    aria-current={page === currentPage ? "page" : undefined}
                    role="listitem"
                    tabIndex={0}
                  >
                    {page}
                  </Button>
                )
              }
              return (
                <span
                  key={index}
                  className="text-muted-foreground px-2"
                  aria-hidden="true"
                  role="presentation"
                >
                  {page}
                </span>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            className={cn(
              "size-8 rounded-full",
              currentPage === totalPages && "cursor-not-allowed opacity-50"
            )}
            onClick={handleNext}
            disabled={currentPage === totalPages}
            aria-label="صفحه بعد"
            aria-disabled={currentPage === totalPages}
          >
            <ChevronLeft className="size-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
