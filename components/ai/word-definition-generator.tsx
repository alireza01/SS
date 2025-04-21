"use client"

import { useState } from "react"

import { Sparkles, Save, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { generateJsonContent } from "@/lib/gemini/client"
import { createClient } from "@/lib/supabase/client"

interface WordDefinitionGeneratorProps {
  bookId: string
  onDefinitionSaved?: () => void
}

export function WordDefinitionGenerator({ bookId, onDefinitionSaved }: WordDefinitionGeneratorProps) {
  const [word, setWord] = useState("")
  const [context, setContext] = useState("")
  const [level, setLevel] = useState("intermediate")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [definition, setDefinition] = useState<{
    persianMeaning: string
    explanation: string
    example: string
  } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()
  const { toast } = useToast()

  const generateDefinition = async () => {
    if (!word.trim()) {
      setError("لطفاً کلمه مورد نظر را وارد کنید.")
      return
    }

    setIsGenerating(true)
    setError(null)

    try {
      const prompt = `
        لطفاً برای کلمه انگلیسی زیر، معنی و توضیحات به فارسی ارائه دهید:
        
        کلمه: "${word.trim()}"
        ${context ? `بافت متنی: "${context}"` : ""}
        سطح دشواری: "${level}"
        
        پاسخ را به صورت JSON با ساختار زیر برگردانید:
        {
          "persianMeaning": "معنی فارسی کلمه به صورت خلاصه",
          "explanation": "توضیح کامل به فارسی در مورد معنی، کاربرد و نکات مهم این کلمه",
          "example": "یک مثال کاربردی به انگلیسی"
        }
        
        پاسخ فقط باید JSON باشد، بدون هیچ توضیح اضافی.
      `

      const result = await generateJsonContent(prompt)

      if (result.success && result.data) {
        setDefinition(result.data)
      } else {
        setError("خطا در تولید تعریف. لطفاً دوباره تلاش کنید.")
      }
    } catch (err) {
      console.error("Error generating definition:", err)
      setError("خطا در تولید تعریف. لطفاً دوباره تلاش کنید.")
    } finally {
      setIsGenerating(false)
    }
  }

  const saveDefinition = async () => {
    if (!definition) return

    setIsSaving(true)

    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) {
        throw new Error("کاربر وارد نشده است")
      }

      const { error } = await supabase.from("book_words").insert({
        bookId,
        word: word.trim(),
        meaning: definition.persianMeaning,
        explanation: definition.explanation,
        example: definition.example,
        level,
        createdBy: userData.user.id,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      })

      if (error) throw error

      toast({
        title: "تعریف کلمه ذخیره شد",
        description: `تعریف کلمه "${word}" با موفقیت ذخیره شد.`,
      })

      // Reset form
      setWord("")
      setContext("")
      setDefinition(null)

      if (onDefinitionSaved) {
        onDefinitionSaved()
      }
    } catch (err) {
      console.error("Error saving definition:", err)
      toast({
        variant: "destructive",
        title: "خطا در ذخیره تعریف",
        description: "مشکلی در ذخیره تعریف کلمه رخ داد. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="text-primary size-5" />
          تولید خودکار تعریف کلمه
        </CardTitle>
        <CardDescription>
          با استفاده از هوش مصنوعی، تعریف و توضیحات فارسی برای کلمات انگلیسی تولید کنید.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="bg-destructive/10 text-destructive mb-4 flex items-center gap-2 rounded-md p-3">
            <AlertCircle className="size-4" />
            <p className="text-sm">{error}</p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="word">کلمه انگلیسی</Label>
          <Input
            id="word"
            value={word}
            onChange={(e) => setWord(e.target.value)}
            placeholder="کلمه انگلیسی را وارد کنید"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="context">بافت متنی (اختیاری)</Label>
          <Textarea
            id="context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="جمله یا متنی که کلمه در آن استفاده شده است"
            rows={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="level">سطح دشواری</Label>
          <Select value={level} onValueChange={setLevel}>
            <SelectTrigger id="level">
              <SelectValue placeholder="انتخاب سطح دشواری" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="beginner">مبتدی</SelectItem>
              <SelectItem value="intermediate">متوسط</SelectItem>
              <SelectItem value="advanced">پیشرفته</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={generateDefinition} disabled={isGenerating || !word.trim()} className="w-full gap-2">
          {isGenerating ? (
            <>
              <div className="size-4 animate-spin rounded-full border-b-2 border-current"></div>
              در حال تولید...
            </>
          ) : (
            <>
              <Sparkles className="size-4" />
              تولید تعریف
            </>
          )}
        </Button>

        {definition && (
          <div className="mt-6 space-y-4 rounded-md border p-4">
            <div className="space-y-2">
              <Label>معنی فارسی</Label>
              <Textarea
                value={definition.persianMeaning}
                onChange={(e) => setDefinition({ ...definition, persianMeaning: e.target.value })}
                rows={2}
              />
            </div>

            <div className="space-y-2">
              <Label>توضیحات</Label>
              <Textarea
                value={definition.explanation}
                onChange={(e) => setDefinition({ ...definition, explanation: e.target.value })}
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>مثال</Label>
              <Textarea
                value={definition.example}
                onChange={(e) => setDefinition({ ...definition, example: e.target.value })}
                rows={2}
              />
            </div>

            <Button onClick={saveDefinition} disabled={isSaving} className="w-full gap-2">
              {isSaving ? (
                <>
                  <div className="size-4 animate-spin rounded-full border-b-2 border-current"></div>
                  در حال ذخیره...
                </>
              ) : (
                <>
                  <Save className="size-4" />
                  ذخیره در پایگاه داده
                </>
              )}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
