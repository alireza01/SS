"use client"

import { useRef, useEffect } from "react"

import { motion, useMotionValue } from "framer-motion"

interface PageCurlEffectProps {
  width: number
  height: number
  progress: number
  direction: "top-right" | "bottom-right"
  className?: string
}

export function PageCurlEffect({ width, height, progress, direction, className }: PageCurlEffectProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const opacity = useMotionValue(progress)

  // Draw the page curl effect on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Set canvas dimensions
    canvas.width = width
    canvas.height = height

    // Draw the page curl effect
    const radius = Math.min(width, height) * 0.4 * progress
    const centerX = width
    const centerY = direction === "top-right" ? 0 : height

    // Create gradient for the curl shadow
    const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius)
    gradient.addColorStop(0, "rgba(0, 0, 0, 0.4)")
    gradient.addColorStop(0.7, "rgba(0, 0, 0, 0.2)")
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

    // Draw curl shadow
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 0.5, false)
    ctx.lineTo(centerX, centerY)
    ctx.closePath()
    ctx.fill()

    // Draw page edge
    ctx.strokeStyle = "rgba(0, 0, 0, 0.1)"
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 0.5, false)
    ctx.stroke()
  }, [width, height, progress, direction])

  return (
    <motion.canvas
      ref={canvasRef}
      className={className}
      style={{
        position: "absolute",
        top: 0,
        right: 0,
        width: `${width}px`,
        height: `${height}px`,
        pointerEvents: "none",
        opacity,
      }}
    />
  )
}
