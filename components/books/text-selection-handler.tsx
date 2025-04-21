"use client"

import { useEffect, useState, useRef } from "react"

import { Copy, Highlighter, ImportIcon as Translate } from "lucide-react"
import { createPortal } from "react-dom"

import { Button } from "@/components/ui/button"

interface TextSelectionHandlerProps {
  onTranslate: (text: string) => void
  onHighlight: (text: string) => void
  onCopy: (text: string) => void
}

export function TextSelectionHandler({ onTranslate, onHighlight, onCopy }: TextSelectionHandlerProps) {
  const [showToolbar, setShowToolbar] = useState(false)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [selectedText, setSelectedText] = useState("")
  const toolbarRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection()

      if (!selection || selection.isCollapsed || !selection.toString().trim()) {
        setShowToolbar(false)
        return
      }

      const text = selection.toString().trim()
      setSelectedText(text)

      // محاسبه موقعیت تولبار
      const range = selection.getRangeAt(0)
      const rect = range.getBoundingClientRect()

      setPosition({
        top: rect.top - 40 + window.scrollY, // بالای متن انتخاب شده
        left: rect.left + rect.width / 2, // وسط متن انتخاب شده
      })

      setShowToolbar(true)
    }

    document.addEventListener("selectionchange", handleSelectionChange)

    return () => {
      document.removeEventListener("selectionchange", handleSelectionChange)
    }
  }, [])

  // مخفی کردن تولبار با کلیک خارج از آن
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target as Node)) {
        setShowToolbar(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  if (!showToolbar) return null

  return createPortal(
    <div
      ref={toolbarRef}
      className="fixed z-50 flex -translate-x-1/2 items-center gap-1 rounded-md border border-gray-200 bg-white p-1 shadow-md dark:border-gray-700 dark:bg-gray-800"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
      }}
    >
      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => {
          onTranslate(selectedText)
          setShowToolbar(false)
        }}
      >
        <Translate className="size-4" />
        <span className="sr-only">ترجمه</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => {
          onHighlight(selectedText)
          setShowToolbar(false)
        }}
      >
        <Highlighter className="size-4" />
        <span className="sr-only">هایلایت</span>
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="size-8"
        onClick={() => {
          onCopy(selectedText)
          setShowToolbar(false)
        }}
      >
        <Copy className="size-4" />
        <span className="sr-only">کپی</span>
      </Button>
    </div>,
    document.body,
  )
}
