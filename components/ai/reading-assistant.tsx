"use client"

import { useState } from "react"

import { Sparkles, Languages, BookOpen, Loader2 } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { translateText, getWordDefinition, analyzeText } from "@/lib/gemini"


interface ReadingAssistantProps {
  bookTitle: string
  author: string
  userLevel: string
  currentPage: number
}

export function ReadingAssistant({ bookTitle, author, userLevel, currentPage }: ReadingAssistantProps) {
  const [inputText, setInputText] = useState("")
  const [translatedText, setTranslatedText] = useState("")
  const [wordDefinition, setWordDefinition] = useState<{
    word: string
    meaning: string
    explanation: string
    examples: string[]
    level: string
  } | null>(null)
  const [keywords, setKeywords] = useState<{ word: string; level: string }[]>([])
  const [isTranslating, setIsTranslating] = useState(false)
  const [isDefining, setIsDefining] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState("translate")

  // ترجمه متن
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      toast.error("لطفاً متنی برای ترجمه وارد کنید")
      return
    }

    setIsTranslating(true)
    try {
      const result = await translateText(inputText)
      setTranslatedText(result)
    } catch (error) {
      console.error("خطا در ترجمه متن:", error)
      toast.error("خطا در ترجمه متن")
    } finally {
      setIsTranslating(false)
    }
  }

  // دریافت معنی کلمه
  const handleDefineWord = async () => {
    if (!inputText.trim()) {
      toast.error("لطفاً کلمه‌ای برای معنی وارد کنید")
      return
    }

    setIsDefining(true)
    try {
      const result = await getWordDefinition(inputText)
      setWordDefinition({
        word: inputText,
        meaning: result.meaning,
        explanation: result.explanation,
        examples: result.examples || [],
        level: result.level || "intermediate",
      })
    } catch (error) {
      console.error("خطا در دریافت معنی کلمه:", error)
      toast.error("خطا در دریافت معنی کلمه")
    } finally {
      setIsDefining(false)
    }
  }

  // تحلیل متن و استخراج کلمات کلیدی
  const handleAnalyzeText = async () => {
    if (!inputText.trim()) {
      toast.error("لطفاً متنی برای تحلیل وارد کنید")
      return
    }

    setIsAnalyzing(true)
    try {
      const result = await analyzeText(inputText)
      setKeywords(result)
    } catch (error) {
      console.error("خطا در تحلیل متن:", error)
      toast.error("خطا در تحلیل متن")
    } finally {
      setIsAnalyzing(false)
    }
  }

  // تنظیم رنگ سطح دشواری
  const getLevelColor = (level: string) => {
    switch (level) {
      case "beginner":
        return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400"
      case "intermediate":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400"
      case "advanced":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400"
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>دستیار مطالعه</CardTitle>
        <CardDescription>
          کتاب: {bookTitle} - صفحه {currentPage}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="translate" onValueChange={setActiveTab}>
          <TabsList className="mb-4 grid grid-cols-3">
            <TabsTrigger value="translate">ترجمه</TabsTrigger>
            <TabsTrigger value="define">معنی کلمه</TabsTrigger>
            <TabsTrigger value="analyze">تحلیل متن</TabsTrigger>
          </TabsList>

          <div className="space-y-4">
            <Textarea
              placeholder={
                activeTab === "translate"
                  ? "متن انگلیسی را برای ترجمه وارد کنید..."
                  : activeTab === "define"
                    ? "کلمه انگلیسی را برای دریافت معنی وارد کنید..."
                    : "متن انگلیسی را برای تحلیل وارد کنید..."
              }
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={4}
            />

            <Button
              onClick={
                activeTab === "translate"
                  ? handleTranslate
                  : activeTab === "define"
                    ? handleDefineWord
                    : handleAnalyzeText
              }
              disabled={isTranslating || isDefining || isAnalyzing}
              className="w-full"
            >
              {isTranslating || isDefining || isAnalyzing ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  در حال پردازش...
                </>
              ) : activeTab === "translate" ? (
                <>
                  <Languages className="mr-2 size-4" />
                  ترجمه متن
                </>
              ) : activeTab === "define" ? (
                <>
                  <BookOpen className="mr-2 size-4" />
                  دریافت معنی
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 size-4" />
                  تحلیل متن
                </>
              )}
            </Button>

            <TabsContent value="translate" className="mt-4 space-y-4">
              {translatedText && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-2 text-sm font-medium">ترجمه:</h3>
                    <p className="text-sm">{translatedText}</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="define" className="mt-4 space-y-4">
              {wordDefinition && (
                <Card>
                  <CardContent className="p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <h3 className="text-lg font-bold">{wordDefinition.word}</h3>
                      <Badge variant="outline" className={getLevelColor(wordDefinition.level)}>
                        {wordDefinition.level === "beginner"
                          ? "مبتدی"
                          : wordDefinition.level === "intermediate"
                            ? "متوسط"
                            : "پیشرفته"}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <h4 className="text-sm font-medium">معنی:</h4>
                        <p className="text-sm">{wordDefinition.meaning}</p>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium">توضیحات:</h4>
                        <p className="text-sm">{wordDefinition.explanation}</p>
                      </div>
                      {wordDefinition.examples && wordDefinition.examples.length > 0 && (
                        <div>
                          <h4 className="text-sm font-medium">مثال‌ها:</h4>
                          <ul className="list-inside list-disc text-sm">
                            {wordDefinition.examples.map((example, index) => (
                              <li key={index} className="italic">
                                {example}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="analyze" className="mt-4 space-y-4">
              {keywords.length > 0 && (
                <Card>
                  <CardContent className="p-4">
                    <h3 className="mb-2 text-sm font-medium">کلمات کلیدی:</h3>
                    <div className="flex flex-wrap gap-2">
                      {keywords.map((keyword, index) => (
                        <Badge key={index} variant="outline" className={getLevelColor(keyword.level)}>
                          {keyword.word}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )
}
