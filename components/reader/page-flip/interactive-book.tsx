"use client"

import { useState, useRef, useEffect } from "react"

import { motion, useMotionValue, useTransform, useAnimation, type PanInfo } from "framer-motion"
import { ChevronLeft, ChevronRight, Settings } from "lucide-react"

import { Button } from "@/components/ui/button"
import { useMediaQuery } from "@/hooks/use-media-query"
import { cn } from "@/lib/utils"

import { PageFlipSettings } from "./page-flip-settings"

interface PageContent {
  id: string
  content: string
  pageNumber: number
}

interface InteractiveBookProps {
  pages: PageContent[]
  initialPage?: number
  onPageChange?: (pageNumber: number) => void
  className?: string
  interactiveFlipEnabled?: boolean
  pageFlipSpeed?: number
  pageFlipThreshold?: number
  pageFlipEasing?: string
}

export function InteractiveBook({
  pages,
  initialPage = 1,
  onPageChange,
  className,
  interactiveFlipEnabled = true,
  pageFlipSpeed = 0.5, // seconds
  pageFlipThreshold = 0.3, // percentage of page width
  pageFlipEasing = "easeOut", // easing function
}: InteractiveBookProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(Math.min(Math.max(initialPage - 1, 0), pages.length - 1))
  const [isFlipping, setIsFlipping] = useState(false)
  const [flipDirection, setFlipDirection] = useState<"forward" | "backward">("forward")
  const [showSettings, setShowSettings] = useState(false)
  const [settings, setSettings] = useState({
    interactiveFlipEnabled: interactiveFlipEnabled,
    pageFlipSpeed: pageFlipSpeed,
    pageFlipThreshold: pageFlipThreshold,
    pageFlipEasing: pageFlipEasing,
  })

  const isMobile = useMediaQuery("(max-width: 768px)")
  const containerRef = useRef<HTMLDivElement>(null)
  const pageWidth = useMotionValue(0)
  const pageHeight = useMotionValue(0)

  // Motion values for the page flip animation
  const dragX = useMotionValue(0)
  const dragY = useMotionValue(0)
  const pageRotation = useMotionValue(0)
  const pageCurl = useMotionValue(0)
  const controls = useAnimation()
  const rotateY = useMotionValue(0)

  // Calculate the previous and next page indices
  const prevPageIndex = Math.max(currentPageIndex - 1, 0)
  const nextPageIndex = Math.min(currentPageIndex + 1, pages.length - 1)

  // Transform values for visual effects
  const shadowOpacity = useMotionValue(0)
  const scale = useTransform(dragX, [-pageWidth.get(), 0], [0.9, 1])
  const perspective = 1200

  // Update page dimensions when container size changes
  useEffect(() => {
    if (containerRef.current) {
      const updateDimensions = () => {
        const { width, height } = containerRef.current!.getBoundingClientRect()
        pageWidth.set(width)
        pageHeight.set(height)
      }

      updateDimensions()
      window.addEventListener("resize", updateDimensions)
      return () => window.removeEventListener("resize", updateDimensions)
    }
  }, [pageWidth, pageHeight])

  // Notify parent component when page changes
  useEffect(() => {
    if (onPageChange) {
      onPageChange(currentPageIndex + 1)
    }
  }, [currentPageIndex, onPageChange])

  // Handle page flip
  const handlePageFlip = (direction: "forward" | "backward") => {
    if (isFlipping) return

    setFlipDirection(direction)
    setIsFlipping(true)

    if (direction === "forward" && currentPageIndex < pages.length - 1) {
      // Animate page flip forward
      controls
        .start({
          rotateY: -180,
          transition: {
            duration: settings.pageFlipSpeed,
            ease: settings.pageFlipEasing as any,
          },
        })
        .then(() => {
          setCurrentPageIndex(currentPageIndex + 1)
          dragX.set(0)
          controls.set({ rotateY: 0 })
          setIsFlipping(false)
        })
    } else if (direction === "backward" && currentPageIndex > 0) {
      // Animate page flip backward
      dragX.set(-pageWidth.get())
      controls.set({ rotateY: -180 })
      controls
        .start({
          rotateY: 0,
          transition: {
            duration: settings.pageFlipSpeed,
            ease: settings.pageFlipEasing as any,
          },
        })
        .then(() => {
          setCurrentPageIndex(currentPageIndex - 1)
          setIsFlipping(false)
        })
    } else {
      setIsFlipping(false)
    }
  }

  // Handle drag start
  const handleDragStart = () => {
    if (!settings.interactiveFlipEnabled || isFlipping) return false
    setIsFlipping(true)
    return true
  }

  // Handle drag
  const handleDrag = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!settings.interactiveFlipEnabled) return

    // Determine drag direction and update dragX
    const newDragX = Math.min(0, info.offset.x)
    dragX.set(newDragX)

    // Update curl effect based on drag position
    const dragPercentage = Math.abs(newDragX) / pageWidth.get()
    pageCurl.set(dragPercentage * 20) // Max curl of 20px

    // Update drag Y position for natural page curl
    const dragYValue = (info.point.y - (containerRef.current?.getBoundingClientRect().top || 0)) / pageHeight.get()
    const yOffset = (0.5 - dragYValue) * 30 // Adjust the multiplier for more/less effect
    dragY.set(yOffset)
  }

  // Handle drag end
  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!settings.interactiveFlipEnabled) return

    const threshold = pageWidth.get() * settings.pageFlipThreshold
    const velocity = info.velocity.x
    const dragDistance = Math.abs(dragX.get())

    // Determine if we should complete the page turn or revert
    const shouldTurnPage = dragDistance > threshold || velocity < -500

    if (shouldTurnPage && currentPageIndex < pages.length - 1) {
      // Complete the page turn
      controls
        .start({
          rotateY: -180,
          transition: {
            duration: settings.pageFlipSpeed,
            ease: settings.pageFlipEasing as any,
          },
        })
        .then(() => {
          setCurrentPageIndex(currentPageIndex + 1)
          dragX.set(0)
          dragY.set(0)
          pageCurl.set(0)
          controls.set({ rotateY: 0 })
          setIsFlipping(false)
        })
    } else {
      // Revert the page turn
      controls
        .start({
          rotateY: 0,
          transition: {
            duration: settings.pageFlipSpeed / 2,
            ease: "easeOut",
          },
        })
        .then(() => {
          dragX.set(0)
          dragY.set(0)
          pageCurl.set(0)
          setIsFlipping(false)
        })
    }
  }

  // Update settings
  const updateSettings = (newSettings: Partial<typeof settings>) => {
    setSettings({ ...settings, ...newSettings })
  }

  type AnimationControls = {
    rotateY?: number
  }

  return (
    <div className={cn("relative flex size-full flex-col", className)}>
      {/* Top controls */}
      <div className="mb-4 flex items-center justify-between px-4">
        <div className="text-muted-foreground text-sm">
          صفحه {currentPageIndex + 1} از {pages.length}
        </div>
        <Button variant="ghost" size="icon" onClick={() => setShowSettings(!showSettings)}>
          <Settings className="size-5" />
          <span className="sr-only">تنظیمات</span>
        </Button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <PageFlipSettings settings={settings} updateSettings={updateSettings} onClose={() => setShowSettings(false)} />
      )}

      {/* Book container */}
      <div
        ref={containerRef}
        className="perspective-1000 relative flex-1 overflow-hidden rounded-lg bg-white shadow-lg dark:bg-gray-900"
        style={{ perspective: `${perspective}px` }}
      >
        {/* Current page */}
        <motion.div
          className="transform-style-3d backface-hidden absolute inset-0 size-full origin-left bg-white dark:bg-gray-900"
          style={{
            rotateY: (controls as AnimationControls).rotateY ?? rotateY.get(),
            boxShadow: isFlipping ? `rgba(0, 0, 0, ${shadowOpacity.get()}) 0px 0px 15px 0px` : "none",
            zIndex: isFlipping ? 10 : 1,
          }}
          animate={controls}
          drag={settings.interactiveFlipEnabled && !isFlipping ? "x" : false}
          dragConstraints={{ left: -pageWidth.get(), right: 0 }}
          dragElastic={0}
          onDragStart={handleDragStart}
          onDrag={handleDrag}
          onDragEnd={handleDragEnd}
          dragDirectionLock
        >
          {/* Page content */}
          <div
            className="prose prose-lg dark:prose-invert absolute inset-0 max-w-none overflow-y-auto p-8"
            style={{
              transform: isFlipping ? `rotateY(${rotateY.get()}deg) translateZ(${pageCurl.get()}px)` : "none",
            }}
            dangerouslySetInnerHTML={{ __html: pages[currentPageIndex].content }}
          />

          {/* Page curl effect */}
          {isFlipping && (
            <div
              className="absolute inset-y-0 right-0 w-px bg-gradient-to-l from-gray-300 to-transparent"
              style={{
                boxShadow: `rgba(0, 0, 0, 0.2) -2px 0px 5px 0px`,
                opacity: shadowOpacity.get(),
              }}
            />
          )}
        </motion.div>

        {/* Next page (visible during page flip) */}
        {isFlipping && flipDirection === "forward" && currentPageIndex < pages.length - 1 && (
          <div className="absolute inset-0 z-0 size-full bg-white dark:bg-gray-900">
            <div className="prose prose-lg dark:prose-invert max-w-none overflow-y-auto p-8">
              <div dangerouslySetInnerHTML={{ __html: pages[nextPageIndex].content }} />
            </div>
          </div>
        )}

        {/* Previous page (visible during backward page flip) */}
        {isFlipping && flipDirection === "backward" && currentPageIndex > 0 && (
          <div className="absolute inset-0 z-0 size-full bg-white dark:bg-gray-900">
            <div className="prose prose-lg dark:prose-invert max-w-none overflow-y-auto p-8">
              <div dangerouslySetInnerHTML={{ __html: pages[prevPageIndex].content }} />
            </div>
          </div>
        )}

        {/* Page corners for drag hints */}
        {settings.interactiveFlipEnabled && !isFlipping && (
          <>
            <div className="absolute right-0 top-0 z-20 size-16 cursor-pointer rounded-bl-lg bg-gradient-to-bl from-gray-200/50 to-transparent" />
            <div className="absolute bottom-0 right-0 z-20 size-16 cursor-pointer rounded-tl-lg bg-gradient-to-tl from-gray-200/50 to-transparent" />
          </>
        )}
      </div>

      {/* Navigation buttons */}
      <div className="mt-4 flex justify-between px-4">
        <Button
          variant="outline"
          onClick={() => handlePageFlip("backward")}
          disabled={isFlipping || currentPageIndex === 0}
        >
          <ChevronRight className="ml-2 size-4" />
          صفحه قبل
        </Button>
        <Button
          variant="outline"
          onClick={() => handlePageFlip("forward")}
          disabled={isFlipping || currentPageIndex === pages.length - 1}
        >
          صفحه بعد
          <ChevronLeft className="mr-2 size-4" />
        </Button>
      </div>

      {/* Global styles */}
      <style jsx global>{`
        .perspective-1000 {
          perspective: 1000px;
        }
        
        .transform-style-3d {
          transform-style: preserve-3d;
        }
        
        .backface-hidden {
          backface-visibility: hidden;
        }
        
        .origin-left {
          transform-origin: left center;
        }
      `}</style>
    </div>
  )
}
