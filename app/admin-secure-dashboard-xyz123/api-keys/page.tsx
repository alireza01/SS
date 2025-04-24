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

interface SupabaseApiKey {
  id: string;
  name: string;
  key: string;
  type: ApiKeyType;
  created_at: string;
  last_used_at: string | null;
  is_active: boolean;
  created_by: string;
}

interface ApiKeysPageState {
  isGenerating: boolean;
  geminiApiKey: string;
  apiKeys: ApiKey[];
  isLoading: boolean;
  error: string | null;
}

export default function ApiKeysPage() {
  const [state, setState] = useState<ApiKeysPageState>({
    isGenerating: false,
    geminiApiKey: "",
    apiKeys: [],
    isLoading: true,
    error: null,
  })

  const supabase = createClient()

  useEffect(() => {
    let isMounted = true

    async function fetchApiKeys() {
      if (!isMounted) return

      setState((prev) => ({ ...prev, isLoading: true, error: null }))

      try {
        const { data, error } = await supabase
          .from("api_keys")
          .select("*")
          .order("created_at", { ascending: false })

        if (error) throw error
        
        if (!isMounted) return

        // Transform the data to match our ApiKey interface
        const transformedData = data.map((key: SupabaseApiKey) => ({
          id: key.id,
          name: key.name,
          key: key.key,
          type: key.type as ApiKeyType,
          createdAt: key.created_at,
          lastUsed: key.last_used_at,
          isActive: key.is_active,
          userId: key.created_by
        }))
        
        setState((prev) => ({ ...prev, apiKeys: transformedData }))
      } catch (error) {
        console.error("Error fetching API keys:", error)
        if (isMounted) {
          setState((prev) => ({ 
            ...prev, 
            error: "خطا در دریافت کلیدهای API",
            apiKeys: [] 
          }))
          toast({
            title: "خطا",
            description: "خطا در دریافت کلیدهای API",
            variant: "destructive",
          })
        }
      } finally {
        if (isMounted) {
          setState((prev) => ({ ...prev, isLoading: false }))
        }
      }
    }

    fetchApiKeys()

    return () => {
      isMounted = false
    }
  }, [supabase])

  const handleGenerateKey = async () => {
    setState((prev) => ({ ...prev, isGenerating: true }))
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
      // Ensure the new key matches the ApiKey interface
      const formattedKey: ApiKey = {
        id: newKey.id,
        name: newKey.name,
        key: newKey.key,
        type: newKey.type as ApiKeyType,
        createdAt: newKey.created_at,
        lastUsed: newKey.last_used_at,
        isActive: newKey.is_active,
        userId: newKey.created_by
      }
      setState((prev) => ({ ...prev, apiKeys: [formattedKey, ...prev.apiKeys] }))
      
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
      setState((prev) => ({ ...prev, isGenerating: false }))
    }
  }

  const handleSaveGeminiKey = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error("User not authenticated")

      const { error } = await supabase
        .from("api_keys")
        .upsert({
          name: "Gemini API Key",
          key: state.geminiApiKey,
          type: "gemini" as ApiKeyType,
          is_active: true,
          created_by: user.id
        })

      if (error) throw error

      // Refresh the API keys list
      const { data: updatedKeys, error: fetchError } = await supabase
        .from("api_keys")
        .select("*")
        .order("created_at", { ascending: false })

      if (fetchError) throw fetchError

      const transformedData = updatedKeys.map((key: SupabaseApiKey) => ({
        id: key.id,
        name: key.name,
        key: key.key,
        type: key.type as ApiKeyType,
        createdAt: key.created_at,
        lastUsed: key.last_used_at,
        isActive: key.is_active,
        userId: key.created_by
      }))

      setState(prev => ({ ...prev, apiKeys: transformedData }))

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

      setState((prev) => ({
        ...prev,
        apiKeys: prev.apiKeys.filter((key) => key.id !== id)
      }))

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState((prev) => ({ ...prev, geminiApiKey: e.target.value }))
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

  if (state.error) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-red-600">{state.error}</h2>
          <Button 
            variant="outline" 
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            تلاش مجدد
          </Button>
        </div>
      </div>
    )
  }

  if (state.isLoading) {
    return (
      <div className="flex items-center justify-center p-6">
        <div className="text-center">
          <div className="border-primary size-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="mt-2">در حال بارگذاری...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">مدیریت کلیدهای API</h1>
        <Button onClick={handleGenerateKey} disabled={state.isGenerating}>
          <Plus className="ml-2 size-4" />
          {state.isGenerating ? "در حال ایجاد..." : "ایجاد کلید جدید"}
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
              value={state.geminiApiKey}
              onChange={handleInputChange}
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
              {state.apiKeys.map((apiKey) => (
                <TableRow key={apiKey.id}>
                  <TableCell className="font-medium">{apiKey.name}</TableCell>
                  <TableCell>{apiKey.key}</TableCell>
                  <TableCell>
                    <Badge variant={apiKey.type === "gemini" ? "default" : "secondary"}>
                      {apiKey.type === "gemini" ? "جمینی" : "سفارشی"}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatRelativeTime(apiKey.createdAt)}</TableCell>
                  <TableCell>{formatRelativeTime(apiKey.lastUsed)}</TableCell>
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
