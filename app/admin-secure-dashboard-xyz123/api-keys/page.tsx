"use client"

import { useEffect, useState } from "react"

import { Copy, Plus, Trash } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import type { ApiKey, ApiKeyType } from "@/types/api"

export default function ApiKeysPage() {
  const [isGenerating, setIsGenerating] = useState(false)
  const [geminiApiKey, setGeminiApiKey] = useState("")
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    async function fetchApiKeys() {
      setIsLoading(true)
      try {
        const { data, error } = await supabase
          .from("api_keys")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        setApiKeys(data)
      } catch (error) {
        console.error("Error fetching API keys:", error)
        toast({
          title: "خطا",
          description: "خطا در دریافت کلیدهای API",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchApiKeys()
  }, [supabase, toast])

  const handleGenerateKey = async () => {
    setIsGenerating(true)
    try {
      const response = await fetch('/api/admin/api-keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: 'API Key',
          type: 'custom' as ApiKeyType,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate API key')
      }

      const newKey = await response.json()
      setApiKeys([newKey, ...apiKeys])
      
      toast({
        title: "کلید API جدید ایجاد شد",
        description: "کلید API جدید با موفقیت ایجاد شد.",
      })
    } catch (error) {
      console.error('Error generating API key:', error)
      toast({
        title: "خطا",
        description: "خطا در ایجاد کلید API",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSaveGeminiKey = async () => {
    try {
      const { error } = await supabase
        .from("api_keys")
        .upsert({
          name: "Gemini API Key",
          key: geminiApiKey,
          type: "gemini",
        })

      if (error) throw error

      toast({
        title: "کلید API جمینی ذخیره شد",
        description: "کلید API جمینی با موفقیت ذخیره شد.",
      })
    } catch (error) {
      console.error("Error saving Gemini API key:", error)
      toast({
        title: "خطا",
        description: "خطا در ذخیره کلید API جمینی",
        variant: "destructive",
      })
    }
  }

  const handleDeleteKey = async (id: string) => {
    try {
      const { error } = await supabase
        .from("api_keys")
        .delete()
        .eq("id", id)

      if (error) throw error

      setApiKeys(apiKeys.filter((key) => key.id !== id))
      toast({
        title: "کلید API حذف شد",
        description: "کلید API با موفقیت حذف شد.",
      })
    } catch (error) {
      console.error("Error deleting API key:", error)
      toast({
        title: "خطا",
        description: "خطا در حذف کلید API",
        variant: "destructive",
      })
    }
  }

  const handleCopyKey = (key: string) => {
    navigator.clipboard.writeText(key)
    toast({
      title: "کلید API کپی شد",
      description: "کلید API در کلیپ‌بورد کپی شد.",
    })
  }

  const formatRelativeTime = (dateString: string | null) => {
    if (!dateString) return "هرگز"

    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffMinutes = Math.floor(diffMs / (1000 * 60))

    if (diffDays > 0) {
      return `${diffDays} روز پیش`
    } else if (diffHours > 0) {
      return `${diffHours} ساعت پیش`
    } else if (diffMinutes > 0) {
      return `${diffMinutes} دقیقه پیش`
    } else {
      return "همین الان"
    }
  }

  if (isLoading) {
    return <div>در حال بارگذاری...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مدیریت کلیدهای API</h1>
        <Button onClick={handleGenerateKey} disabled={isGenerating}>
          <Plus className="ml-2 size-4" />
          {isGenerating ? "در حال ایجاد..." : "ایجاد کلید جدید"}
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>کلید API جمینی</CardTitle>
          <CardDescription>
            برای استفاده از قابلیت ترجمه هوشمند، کلید API جمینی را وارد کنید. این کلید برای ترجمه کلمات و متن‌ها استفاده
            می‌شود.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="کلید API جمینی را وارد کنید"
              value={geminiApiKey}
              onChange={(e) => setGeminiApiKey(e.target.value)}
              type="password"
            />
            <Button onClick={handleSaveGeminiKey}>ذخیره</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>کلیدهای API</CardTitle>
          <CardDescription>لیست کلیدهای API موجود</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>نام</TableHead>
                <TableHead>کلید</TableHead>
                <TableHead>نوع</TableHead>
                <TableHead>تاریخ ایجاد</TableHead>
                <TableHead>آخرین استفاده</TableHead>
                <TableHead className="text-left">عملیات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>{apiKey.key}</TableCell>
                  <TableCell>
                    <Badge variant={apiKey.type === "gemini" ? "default" : "secondary"}>
                      {apiKey.type === "gemini" ? "جمینی" : "سفارشی"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatRelativeTime(apiKey.created_at)}</TableCell>
                  <TableCell>{formatRelativeTime(apiKey.last_used_at)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-end space-x-2 space-x-reverse">
                      <Button variant="ghost" size="icon" onClick={() => handleCopyKey(apiKey.key)}>
                        <Copy className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteKey(apiKey.id)}>
                        <Trash className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
