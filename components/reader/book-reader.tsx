"use client"

import { useState, useRef } from "react"

import { useRouter } from "next/navigation"




import { createClient } from "@/lib/supabase/client"

interface Book {
  id: string
  title: string
  author: string
  coverImage: string
  totalPages: number
  content: {
    page: number
    text: string
  }[]
  slug: string
}

interface Word {
  id: string
  word: string
  meaning: string
  level: "beginner" | "intermediate" | "advanced"
  examples?: string[]
}

interface UserProgress {
  current_page: number
  last_read_at: string
  bookmarks?: number[]
}

interface SavedWord {
  id: string
  word: string
  status: "learning" | "reviewing" | "mastered"
  next_review_at: string
}

interface BookReaderProps {
  book: Book
  words: Word[]
  currentPage: number
  isPreview: boolean
  maxPreviewPages: number
  userProgress: UserProgress | null
  savedWords: SavedWord[]
}

export function BookReader({
  book,
  words,
  currentPage: initialPage,
  isPreview,
  maxPreviewPages,
  userProgress,
  savedWords: initialSavedWords,
}: BookReaderProps) {
  const router = useRouter()
  const supabase = createClient()
  const contentRef = useRef<HTMLDivElement>(null)
  
  // Core reading state
  const [page, setPage] = useState(initialPage)
  const [showSettings, setShowSettings] = useState(false)
  const [fontSize, setFontSize] = useState(18)
  const [lineHeight, setLineHeight] = useState(1.8)
  const [darkMode, setDarkMode] = useState(false)
  const [fontFamily, setFontFamily] = useState("Vazirmatn")
  const [direction, setDirection] = useState<"ltr" | "rtl">("ltr")
  
  // Word and translation state
  const [selectedWord, setSelectedWord] = useState<Word | null>(null)
  const [userSavedWords, setUserSavedWords] = useState<SavedWord[]>(initialSavedWords)
  const [isWordSaved, setIsWordSaved] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [translation, setTranslation] = useState("")
  const [showTranslationHints, setShowTranslationHints] = useState(false)
  const [isTranslationLoading, setIsTranslationLoading] = useState(false)
  const [translatedContent, setTranslatedContent] = useState<string | null>(null)
  const [showTranslation, setShowTranslation] = useState(false)
  
  // Reading progress and timing
  const [readingTime, setReadingTime] = useState(0)
  const [readingTimer, setReadingTimer] = useState<NodeJS.Timeout | null>(null)
  const [readingStartTime, setReadingStartTime] = useState<Date | null>(null)
  
  // UI state
  const [showPreviewMessage, setShowPreviewMessage] = useState(isPreview && page === maxPreviewPages)
  const [bookmarks, setBookmarks] = useState<number[]>(userProgress?.bookmarks || [])
  const [isCurrentPageBookmarked, setIsCurrentPageBookmarked] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [showPageTurnAnimation, setShowPageTurnAnimation] = useState(false)
  const [textSelectionEnabled, setTextSelectionEnabled] = useState(true)
  const [isDefinitionVisible, setIsDefinitionVisible] = useState(false)
  
  // Text-to-speech state
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechRate, setSpeechRate] = useState(1)
  const [speechPitch, setSpeechPitch] = useState(1)
  const [speechVoice, setSpeechVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [autoPlayPronunciation, setAutoPlayPronunciation] = useState(false)

  // ... rest of the existing code ...
}
