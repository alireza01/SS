import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

import { createServerClient } from "./supabase/server"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string) {
  const d = new Date(date)
  return d.toLocaleDateString("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat("fa-IR").format(num)
}

export function isValidUrl(url: string) {
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function delay(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

export type UnknownObject = Record<string, unknown>

export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'

  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB']

  const i = Math.floor(Math.log(bytes) / Math.log(k))

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`
}

export function generateSlug(str: string) {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim()
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout)
      func(...args)
    }

    clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function groupBy<T>(array: T[], key: keyof T): { [key: string]: T[] } {
  return array.reduce((result, currentValue) => {
    const groupKey = String(currentValue[key])
    ;(result[groupKey] = result[groupKey] || []).push(currentValue)
    return result
  }, {} as { [key: string]: T[] })
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("fa-IR", {
    style: "currency",
    currency: "IRR",
  }).format(price)
}

export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, "") // Trim - from end of text
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + "..."
}

export function calculateReadingTime(text: string): number {
  const wordsPerMinute = 200
  const words = text.trim().split(/\s+/).length
  return Math.ceil(words / wordsPerMinute)
}

export function getWordDifficultyColor(level: string): string {
  switch (level) {
    case "beginner":
      return "bg-green-100 text-green-800 border-green-300"
    case "intermediate":
      return "bg-blue-100 text-blue-800 border-blue-300"
    case "advanced":
      return "bg-purple-100 text-purple-800 border-purple-300"
    default:
      return "bg-gray-100 text-gray-800 border-gray-300"
  }
}

export function getLevelText(level: string): string {
  switch (level) {
    case "beginner":
      return "مبتدی"
    case "intermediate":
      return "متوسط"
    case "advanced":
      return "پیشرفته"
    default:
      return level
  }
}

export interface SlugOptions {
  table: string
  maxLength?: number
  separator?: string
}

const defaultSlugOptions: Required<SlugOptions> = {
  table: "books",
  maxLength: 100,
  separator: "-"
}

/**
 * Generates a unique SEO-friendly slug from a string
 * Handles multiple languages including Persian/Arabic
 */
export async function generateUniqueSlug(
  str: string,
  options: Partial<SlugOptions> = {}
): Promise<string> {
  const { table, maxLength, separator } = { ...defaultSlugOptions, ...options }
  
  // Basic slug generation
  let slug = str
    .toLowerCase()
    // Handle Persian/Arabic characters
    .replace(/[^a-z0-9\u0600-\u06FF\s-]/g, "")
    // Replace spaces with separator
    .replace(/\s+/g, separator)
    // Remove multiple separators
    .replace(new RegExp(`${separator}+`, "g"), separator)
    // Trim separators from start and end
    .replace(new RegExp(`^${separator}+|${separator}+$`, "g"), "")
    
  // Trim to max length while respecting word boundaries
  if (maxLength && slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(new RegExp(`${separator}+$`), "")
  }

  // Check uniqueness in database
  const supabase = await createServerClient()
  let isUnique = false
  let counter = 0
  let uniqueSlug = slug

  while (!isUnique) {
    const { data } = await supabase
      .from(table)
      .select("slug")
      .eq("slug", uniqueSlug)
      .maybeSingle()

    if (!data) {
      isUnique = true
    } else {
      counter++
      uniqueSlug = `${slug}${separator}${counter}`
    }
  }

  return uniqueSlug
}

/**
 * Validates if a string is a valid slug
 */
export function isValidSlug(slug: string): boolean {
  const slugRegex = /^[a-z0-9\u0600-\u06FF]+(?:-[a-z0-9\u0600-\u06FF]+)*$/
  return slugRegex.test(slug)
}
