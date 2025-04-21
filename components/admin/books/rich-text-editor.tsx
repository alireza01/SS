"use client"

import { useState, useRef, useCallback, useEffect } from "react"

import Highlight from "@tiptap/extension-highlight"
import Image from "@tiptap/extension-image"
import Placeholder from "@tiptap/extension-placeholder"
import TextAlign from "@tiptap/extension-text-align"
import Typography from "@tiptap/extension-typography"
import Underline from "@tiptap/extension-underline"
import { useEditor, EditorContent, BubbleMenu } from "@tiptap/react"
import StarterKit from "@tiptap/starter-kit"
import {
  Bold,
  Italic,
  UnderlineIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  ImageIcon,
  Undo,
  Redo,
  Highlighter,
  Wand2,
  Loader2,
  Search,
  Plus,
  X,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { toast } from "@/components/ui/use-toast"
import { analyzeTextForDifficultWords } from "@/lib/gemini"
import { createClient } from "@/lib/supabase/client"

// تعریف نوع برای کلمات دشوار
interface DifficultWord {
  word: string
  difficultyLevel: "beginner" | "intermediate" | "advanced"
  persianMeaning: string
  position: number
}

interface RichTextEditorProps {
  initialContent: string
  onChange: (html: string) => void
  onSaveDifficultWords?: (words: DifficultWord[]) => void
  bookId?: string
  readOnly?: boolean
}

export function RichTextEditor({
  initialContent,
  onChange,
  onSaveDifficultWords,
  bookId,
  readOnly = false,
}: RichTextEditorProps) {
  const [difficultWords, setDifficultWords] = useState<DifficultWord[]>([])
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [selectedText, setSelectedText] = useState("")
  const [selectedWordInfo, setSelectedWordInfo] = useState<{
    word: string
    level: "beginner" | "intermediate" | "advanced"
    meaning: string
  } | null>(null)
  const [imageUrl, setImageUrl] = useState("")
  const [isAddingWord, setIsAddingWord] = useState(false)
  const [newWord, setNewWord] = useState({
    word: "",
    level: "intermediate" as "beginner" | "intermediate" | "advanced",
    meaning: "",
  })

  const supabase = createClient()
  const imageInputRef = useRef<HTMLInputElement>(null)

  const editor = useEditor({
    extensions: [
      StarterKit,
      Highlight.configure({
        multicolor: true,
      }),
      Typography,
      Image,
      Placeholder.configure({
        placeholder: "متن کتاب را اینجا وارد کنید...",
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Underline,
    ],
    content: initialContent,
    editable: !readOnly,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML())
    },
  })

  // تحلیل متن برای یافتن کلمات دشوار
  const analyzeText = async () => {
    if (!editor) return

    try {
      setIsAnalyzing(true)
      const content = editor.getText()

      const result = await analyzeTextForDifficultWords(content, "intermediate")

      if (result.difficultWords && Array.isArray(result.difficultWords)) {
        setDifficultWords(result.difficultWords)

        // ذخیره کلمات دشوار
        if (onSaveDifficultWords) {
          onSaveDifficultWords(result.difficultWords)
        }

        // هایلایت کردن کلمات در ویرایشگر
        highlightDifficultWords(result.difficultWords)

        toast({
          title: "تحلیل متن انجام شد",
          description: `${result.difficultWords.length} کلمه دشوار شناسایی شد.`,
        })
      }
    } catch (error) {
      console.error("خطا در تحلیل متن:", error)
      toast({
        variant: "destructive",
        title: "خطا در تحلیل متن",
        description: "مشکلی در تحلیل متن رخ داد. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // هایلایت کردن کلمات دشوار در ویرایشگر
  const highlightDifficultWords = useCallback(
    (words: DifficultWord[]) => {
      if (!editor) return

      // ابتدا همه هایلایت‌ها را حذف می‌کنیم
      editor.commands.unsetHighlight()

      // سپس کلمات دشوار را هایلایت می‌کنیم
      words.forEach((word) => {
        const { position } = word
        const text = editor.getText()
        const wordText = word.word

        // پیدا کردن موقعیت دقیق کلمه در متن
        if (position >= 0 && position < text.length) {
          editor.commands.setTextSelection({
            from: position,
            to: position + wordText.length,
          })

          // هایلایت با رنگ متناسب با سطح دشواری
          const color =
            word.difficultyLevel === "beginner" ? "green" : word.difficultyLevel === "intermediate" ? "blue" : "purple"

          editor.commands.setHighlight({ color })
        }
      })

      // بازگرداندن انتخاب به حالت عادی
      editor.commands.blur()
    },
    [editor],
  )

  // بارگذاری کلمات دشوار ذخیره شده
  useEffect(() => {
    const loadSavedWords = async () => {
      if (!bookId) return

      try {
        const { data, error } = await supabase.from("difficult_words").select("*").eq("bookId", bookId)

        if (error) throw error

        if (data && data.length > 0) {
          const formattedWords = data.map((item) => ({
            word: item.word,
            difficultyLevel: item.difficultyLevel as "beginner" | "intermediate" | "advanced",
            persianMeaning: item.persianMeaning,
            position: item.position,
          }))

          setDifficultWords(formattedWords)
          highlightDifficultWords(formattedWords)
        }
      } catch (error) {
        console.error("خطا در بارگذاری کلمات دشوار:", error)
      }
    }

    loadSavedWords()
  }, [bookId, highlightDifficultWords, supabase])

  // افزودن تصویر
  const addImage = useCallback(() => {
    if (!editor) return

    if (imageUrl) {
      editor.chain().focus().setImage({ src: imageUrl }).run()
      setImageUrl("")
    }
  }, [editor, imageUrl])

  // آپلود تصویر
  const uploadImage = async (file: File) => {
    try {
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2, 15)}.${fileExt}`
      const filePath = `book-images/${fileName}`

      const { error: uploadError } = await supabase.storage.from("books").upload(filePath, file)

      if (uploadError) throw uploadError

      const { data } = supabase.storage.from("books").getPublicUrl(filePath)

      if (data) {
        setImageUrl(data.publicUrl)
      }
    } catch (error) {
      console.error("خطا در آپلود تصویر:", error)
      toast({
        variant: "destructive",
        title: "خطا در آپلود تصویر",
        description: "مشکلی در آپلود تصویر رخ داد. لطفاً دوباره تلاش کنید.",
      })
    }
  }

  // انتخاب کلمه با کلیک
  const handleWordClick = () => {
    if (!editor) return

    const { from, to } = editor.state.selection
    const text = editor.state.doc.textBetween(from, to)

    if (text && text.trim()) {
      setSelectedText(text.trim())

      // بررسی آیا این کلمه قبلاً به عنوان کلمه دشوار ثبت شده است
      const existingWord = difficultWords.find((w) => w.word === text.trim())

      if (existingWord) {
        setSelectedWordInfo({
          word: existingWord.word,
          level: existingWord.difficultyLevel,
          meaning: existingWord.persianMeaning,
        })
      } else {
        setSelectedWordInfo(null)
      }
    }
  }

  // افزودن کلمه دشوار جدید
  const addDifficultWord = async () => {
    if (!editor || !selectedText) return

    try {
      setIsAddingWord(true)

      // پیدا کردن موقعیت کلمه در متن
      const position = editor.getText().indexOf(selectedText)

      const newDifficultWord: DifficultWord = {
        word: selectedText,
        difficultyLevel: newWord.level,
        persianMeaning: newWord.meaning,
        position,
      }

      // افزودن به لیست کلمات دشوار
      setDifficultWords((prev) => [...prev, newDifficultWord])

      // هایلایت کردن کلمه در ویرایشگر
      editor.commands.setTextSelection({
        from: position,
        to: position + selectedText.length,
      })

      const color = newWord.level === "beginner" ? "green" : newWord.level === "intermediate" ? "blue" : "purple"

      editor.commands.setHighlight({ color })

      // ذخیره در دیتابیس اگر bookId موجود باشد
      if (bookId) {
        await supabase.from("difficult_words").insert({
          bookId,
          word: selectedText,
          difficultyLevel: newWord.level,
          persianMeaning: newWord.meaning,
          position,
          createdAt: new Date().toISOString(),
        })
      }

      // ذخیره کلمات دشوار
      if (onSaveDifficultWords) {
        onSaveDifficultWords([...difficultWords, newDifficultWord])
      }

      toast({
        title: "کلمه دشوار افزوده شد",
        description: `کلمه "${selectedText}" به عنوان کلمه دشوار ثبت شد.`,
      })

      // پاک کردن فرم
      setNewWord({
        word: "",
        level: "intermediate",
        meaning: "",
      })
      setSelectedText("")
      setSelectedWordInfo(null)

      // بازگرداندن انتخاب به حالت عادی
      editor.commands.blur()
    } catch (error) {
      console.error("خطا در افزودن کلمه دشوار:", error)
      toast({
        variant: "destructive",
        title: "خطا در افزودن کلمه دشوار",
        description: "مشکلی در افزودن کلمه دشوار رخ داد. لطفاً دوباره تلاش کنید.",
      })
    } finally {
      setIsAddingWord(false)
    }
  }

  // حذف کلمه دشوار
  const removeDifficultWord = async (word: string) => {
    try {
      // حذف از لیست کلمات دشوار
      setDifficultWords((prev) => prev.filter((w) => w.word !== word))

      // حذف هایلایت از ویرایشگر
      if (editor) {
        const position = editor.getText().indexOf(word)

        if (position >= 0) {
          editor.commands.setTextSelection({
            from: position,
            to: position + word.length,
          })

          editor.commands.unsetHighlight()
        }
      }

      // حذف از دیتابیس اگر bookId موجود باشد
      if (bookId) {
        await supabase.from("difficult_words").delete().eq("bookId", bookId).eq("word", word)
      }

      // به‌روزرسانی کلمات دشوار
      if (onSaveDifficultWords) {
        onSaveDifficultWords(difficultWords.filter((w) => w.word !== word))
      }

      toast({
        title: "کلمه دشوار حذف شد",
        description: `کلمه "${word}" از لیست کلمات دشوار حذف شد.`,
      })

      // بازگرداندن انتخاب به حالت عادی
      editor?.commands.blur()
    } catch (error) {
      console.error("خطا در حذف کلمه دشوار:", error)
      toast({
        variant: "destructive",
        title: "خطا در حذف کلمه دشوار",
        description: "مشکلی در حذف کلمه دشوار رخ داد. لطفاً دوباره تلاش کنید.",
      })
    }
  }

  if (!editor) {
    return null
  }

  return (
    <div className="rich-text-editor">
      {!readOnly && (
        <div className="editor-toolbar bg-background sticky top-0 z-10 flex flex-wrap gap-1 rounded-t-md border p-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={editor.isActive("bold") ? "bg-accent" : ""}
                >
                  <Bold className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>پررنگ</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={editor.isActive("italic") ? "bg-accent" : ""}
                >
                  <Italic className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>مورب</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  className={editor.isActive("underline") ? "bg-accent" : ""}
                >
                  <UnderlineIcon className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>زیرخط</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="bg-border mx-2 h-6 w-px" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign("left").run()}
                  className={editor.isActive({ textAlign: "left" }) ? "bg-accent" : ""}
                >
                  <AlignLeft className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>چپ‌چین</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign("center").run()}
                  className={editor.isActive({ textAlign: "center" }) ? "bg-accent" : ""}
                >
                  <AlignCenter className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>وسط‌چین</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().setTextAlign("right").run()}
                  className={editor.isActive({ textAlign: "right" }) ? "bg-accent" : ""}
                >
                  <AlignRight className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>راست‌چین</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="bg-border mx-2 h-6 w-px" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                  className={editor.isActive("heading", { level: 1 }) ? "bg-accent" : ""}
                >
                  <Heading1 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>عنوان 1</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                  className={editor.isActive("heading", { level: 2 }) ? "bg-accent" : ""}
                >
                  <Heading2 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>عنوان 2</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                  className={editor.isActive("heading", { level: 3 }) ? "bg-accent" : ""}
                >
                  <Heading3 className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>عنوان 3</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="bg-border mx-2 h-6 w-px" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  className={editor.isActive("bulletList") ? "bg-accent" : ""}
                >
                  <List className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>لیست نقطه‌ای</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  className={editor.isActive("orderedList") ? "bg-accent" : ""}
                >
                  <ListOrdered className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>لیست شماره‌ای</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="bg-border mx-2 h-6 w-px" />

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm">
                <ImageIcon className="size-4" />
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>افزودن تصویر</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">آدرس تصویر</label>
                  <Input
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">یا آپلود تصویر</label>
                  <Input
                    type="file"
                    accept="image/*"
                    ref={imageInputRef}
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        uploadImage(e.target.files[0])
                      }
                    }}
                  />
                </div>
                <Button onClick={addImage} disabled={!imageUrl}>
                  افزودن تصویر
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          <div className="bg-border mx-2 h-6 w-px" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().undo().run()}>
                  <Undo className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>واگرد</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={() => editor.chain().focus().redo().run()}>
                  <Redo className="size-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>از نو</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className="bg-border mx-2 h-6 w-px" />

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="sm" onClick={analyzeText} disabled={isAnalyzing}>
                  {isAnalyzing ? <Loader2 className="size-4 animate-spin" /> : <Wand2 className="size-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>تحلیل خودکار کلمات دشوار</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      )}

      <div className="editor-content-wrapper flex">
        <div
          className={`editor-content ${readOnly ? "rounded-md border" : "rounded-b-md border-x border-b"} prose prose-sm min-h-[400px] w-full max-w-none p-4`}
        >
          <EditorContent editor={editor} onClick={handleWordClick} />

          {editor && (
            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
              <Card className="flex p-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={editor.isActive("bold") ? "bg-accent" : ""}
                >
                  <Bold className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={editor.isActive("italic") ? "bg-accent" : ""}
                >
                  <Italic className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const text = editor.state.doc.textBetween(editor.state.selection.from, editor.state.selection.to)
                    setSelectedText(text)
                    setIsAddingWord(true)
                  }}
                >
                  <Highlighter className="size-4" />
                </Button>
              </Card>
            </BubbleMenu>
          )}
        </div>

        {!readOnly && (
          <div className="difficult-words-panel bg-muted/30 w-80 rounded-br-md border-b border-r p-4">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-sm font-medium">کلمات دشوار</h3>
              <div className="flex items-center">
                <Button variant="ghost" size="sm" onClick={() => setIsAddingWord(true)}>
                  <Plus className="size-4" />
                </Button>
                <Button variant="ghost" size="sm" onClick={analyzeText} disabled={isAnalyzing}>
                  {isAnalyzing ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                </Button>
              </div>
            </div>

            <div className="max-h-[500px] space-y-2 overflow-y-auto">
              {difficultWords.length === 0 ? (
                <p className="text-muted-foreground py-8 text-center text-sm">هنوز کلمه دشواری ثبت نشده است.</p>
              ) : (
                difficultWords.map((word, index) => (
                  <Card key={index} className="p-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center">
                          <span className="font-medium">{word.word}</span>
                          <span
                            className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${
                              word.difficultyLevel === "beginner"
                                ? "bg-green-100 text-green-800"
                                : word.difficultyLevel === "intermediate"
                                  ? "bg-blue-100 text-blue-800"
                                  : "bg-purple-100 text-purple-800"
                            }`}
                          >
                            {word.difficultyLevel === "beginner"
                              ? "مبتدی"
                              : word.difficultyLevel === "intermediate"
                                ? "متوسط"
                                : "پیشرفته"}
                          </span>
                        </div>
                        <p className="text-muted-foreground mt-1 text-xs">{word.persianMeaning}</p>
                      </div>
                      <Button variant="ghost" size="sm" onClick={() => removeDifficultWord(word.word)}>
                        <X className="size-3" />
                      </Button>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      <Dialog open={isAddingWord} onOpenChange={setIsAddingWord}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>افزودن کلمه دشوار</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">کلمه</label>
              <Input value={selectedText} onChange={(e) => setSelectedText(e.target.value)} readOnly={!!selectedText} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">سطح دشواری</label>
              <div className="flex gap-2">
                <Button
                  variant={newWord.level === "beginner" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setNewWord({ ...newWord, level: "beginner" })}
                >
                  مبتدی
                </Button>
                <Button
                  variant={newWord.level === "intermediate" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setNewWord({ ...newWord, level: "intermediate" })}
                >
                  متوسط
                </Button>
                <Button
                  variant={newWord.level === "advanced" ? "default" : "outline"}
                  size="sm"
                  className="flex-1"
                  onClick={() => setNewWord({ ...newWord, level: "advanced" })}
                >
                  پیشرفته
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">معنی فارسی</label>
              <Input
                value={newWord.meaning}
                onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                placeholder="معنی فارسی کلمه را وارد کنید"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddingWord(false)}>
                انصراف
              </Button>
              <Button onClick={addDifficultWord} disabled={!selectedText || !newWord.meaning || isAddingWord}>
                {isAddingWord ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
                افزودن
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        .ProseMirror {
          min-height: 300px;
          outline: none;
        }
        
        .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        
        .ProseMirror .is-empty::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
        
        /* هایلایت‌های رنگی */
        .ProseMirror mark[data-color="green"] {
          background-color: rgba(74, 222, 128, 0.2);
          border-bottom: 2px solid rgba(74, 222, 128, 0.8);
        }
        
        .ProseMirror mark[data-color="blue"] {
          background-color: rgba(59, 130, 246, 0.2);
          border-bottom: 2px solid rgba(59, 130, 246, 0.8);
        }
        
        .ProseMirror mark[data-color="purple"] {
          background-color: rgba(168, 85, 247, 0.2);
          border-bottom: 2px solid rgba(168, 85, 247, 0.8);
        }
      `}</style>
    </div>
  )
}
