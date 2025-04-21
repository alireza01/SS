"use client"

import { useState } from "react"

import { useRouter, useSearchParams } from "next/navigation"

import { useTheme } from "next-themes"

import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"

interface Book {
  id: string
  slug: string
  title: string
  author: string
  coverImage: string | null
  language: string
  level: string
  totalPages: number
  isPremium: boolean
  description?: string
}


interface UserProgress {
  currentPage: number
  lastReadAt: string
  readingTime?: number
}

interface UserSettings {
  fontSize: number
  lineHeight: number
  fontFamily: string
  showTranslationHints: boolean
  showPageTurnAnimation: boolean
  autoPlayPronunciation: boolean
}

interface UserBookmark {
  id: string
  page: number
  createdAt: string
}

interface UserHighlight {
  id: string
  text: string
  color: string
  note?: string
  page: number
  createdAt: string
}

interface BookReaderProps {
  book: Book
  content: string
  currentPage: number
  totalPages: number
  userProgress: UserProgress | null
  userLevel: string
  isPreview: boolean
  isLoggedIn: boolean
  userSettings: UserSettings
  userBookmarks: UserBookmark[]
  userHighlights: UserHighlight[]
  userId?: string
}

export function BookReader({
  book,
  content,
  currentPage,
  totalPages,
  userProgress,
  userLevel,
  isPreview,
  isLoggedIn,
  userSettings,
  userBookmarks = [],
  userHighlights = [],
  userId,
}: BookReaderProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()
  const { theme, setTheme } = useTheme()

  // وضعیت‌های کامپوننت
  const [direction, setDirection] = useState(0)
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [fontSize, setFontSize] = useState(userSettings.fontSize)
  const [lineHeight, setLineHeight] = useState(userSettings.lineHeight)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isWordTooltipVisible, setIsWordTooltipVisible] = useState(false)
  const [selectedWord, setSelectedWord] = useState<{
    word: string
    meaning: string
    explanation: string
    level: string
    position: { x: number; y: number }
  } | null>(null)
  const [isBookmarked, setIsBookmarked] = useState(false)
  const [isLoginDialogOpen, setIsLoginDialogOpen] = useState(false)
  const [isSubscriptionDialogOpen, setIsSubscriptionDialogOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [readingTime, setReadingTime] = useState(userProgress?.readingTime || 0)
  const [readingTimer, setReadingTimer] = useState<NodeJS.Timeout | null>(null)
  const [isFullscreen, setIsFullscreen] = useState(false)
  const [showControls, setShowControls] = useState(true)
  const [highlightedText, setHighlightedText] = useState<{
    text: string
    translation: string
    notes: string
  } | null>(null)
  const [bookmarks, setBookmarks] = useState<UserBookmark[]>(userBookmarks)
  const [highlights, setHighlights] = useState<UserHighlight[]>(userHighlights)
  const [activeTab, setActiveTab] = useState<"bookmarks" | "highlights" | "notes" | "settings">("bookmarks")
  const [showPageTurnAnimation, setShowPageTurnAnimation] = useState(userSettings.showPageTurnAnimation)
  const [showTranslationHints, setShowTranslationHints] = useState(userSettings.showTranslationHints)
  const [fontFamily, setFontFamily] = useState(userSettings.fontFamily)
  const [isTranslationLoading, setIsTranslationLoading] = useState(false)
  const [translatedContent, setTranslatedContent] = useState<string | null>(null)
  const [showTranslation, setShowTranslation] = useState(false)
  const [touchStartX, setTouchStartX] = useState(0)
  const [isSwipeEnabled, setIsSwipeEnabled] = useState(true)
  const [isTextToSpeechEnabled, setIsTextToSpeechEnabled] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechRate, setSpeechRate] = useState(1)
  const [speechPitch, setSpeechPitch] = useState(1)
  const [speechVoice, setSpeechVoice] = useState<SpeechSynthesisVoice | null>(null)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [isSettingsChanged, setIsSettingsChanged] = useState(false)
  const [textAlignment, setTextAlignment] = useState<"left" | "justify" | "right">("left")
  const [textColor, setTextColor] = useState<string>("text-foreground")
  const [backgroundColor, setBackgroundColor] = useState<string>("bg-background")
  const [marginSize, setMarginSize] = useState<number>(4)
  const [isAddNoteDialogOpen, setIsAddNoteDialogOpen] = useState(false)
  const [noteText, setNoteText] = useState("")
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string>("yellow")
  const [selectedHighlightId, setSelectedHighlightId] = useState<string | null>(null)
  const [isEditHighlightDialogOpen, setIsEditHighlightDialogOpen] = useState(false)
  const [editHighlightText, setEditHighlightText] = useState("")
  const [editHighlightNote, setEditHighlightNote] = useState("")
  const [editHighlightColor, setEditHighlightColor] = useState("yellow")
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<{ text: string; index: number }[]>([])
  const [currentSearchResultIndex, setCurrentSearchResultIndex] = useState(0)
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(false)
  const [scrollSpeed, setScrollSpeed] = useState(1)
  const [isScrolling, setIsScrolling] = useState(false)
  const [scrollInterval, setScrollInterval] = useState<NodeJS.Timeout | null>(null)
  const [pageHistory, setPageHistory] = useState<number[]>([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [isNavigatingHistory, setIsNavigatingHistory] = useState(false)
  const [isAIAnalysisDialogOpen, setIsAIAnalysisDialogOpen] = useState(false)
  const [aiAnalysisResult, setAiAnalysisResult] = useState<{
    summary: string
    keyPoints: string[]
    difficulty: string
    recommendations: string[]
  } | null>(null)
  const [isAIAnalysisLoading, setIsAIAnalysisLoading] = useState(false)
  const [showHighlightsInText, setShowHighlightsInText] = useState(true)
  const [textSelectionEnabled, setTextSelectionEnabled] = useState(true)
  const [autoPlayPronunciation, setAutoPlayPronunciation] = useState(userSettings.autoPlayPronunciation)
  const [isDefinitionVisible, setIsDefinitionVisible] = useState(false)
}
