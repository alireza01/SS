"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Clock, Brain, Trophy, Flame, User, Settings, LogOut, Upload, Save } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { toast } from "sonner"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface Profile {
  id: string
  userId: string
  firstName: string | null
  lastName: string | null
  username: string | null
  bio: string | null
  avatarUrl: string | null
  languageLevel: string
  birthDate: string | null
  createdAt: string
  updatedAt: string
}

interface ReadingStats {
  id: string
  userId: string
  totalBooksRead: number
  totalPagesRead: number
  totalReadingTime: number
  readingStreak: number
  lastReadAt: string | null
}

interface WordStats {
  id: string
  userId: string
  totalWords: number
  learningWords: number
  knownWords: number
  reviewStreak: number
}

interface ProfileClientProps {
  user: SupabaseUser
  profile: Profile | null
  readingStats: ReadingStats | null
  wordStats: WordStats | null
}

export function ProfileClient({ user, profile, readingStats, wordStats }: ProfileClientProps) {
  const router = useRouter()
  const supabase = createClient()
  const [activeTab, setActiveTab] = useState("profile")
  const [isEditing, setIsEditing] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string | null>(profile?.avatarUrl || null)

  // مدیریت آپلود آواتار
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      setAvatarFile(file)
      setAvatarPreview(URL.createObjectURL(file))
    }
  }

  // تبدیل سطح زبان به فارسی
  const getLevelText = (level: string) => {
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

  // تبدیل زمان به فرمت خوانا
  const formatReadingTime = (minutes: number) => {
    if (!minutes) return "0 دقیقه"
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours} ساعت و ${mins} دقیقه` : `${mins} دقیقه`
  }

  // ذخیره تغییرات پروفایل
  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const formData = new FormData(e.currentTarget)
      const firstName = formData.get("firstName") as string
      const lastName = formData.get("lastName") as string
      const username = formData.get("username") as string
      const bio = formData.get("bio") as string
      const languageLevel = formData.get("languageLevel") as string

      // آپلود آواتار جدید (اگر تغییر کرده باشد)
      let avatarUrl = profile?.avatarUrl
      if (avatarFile) {
        const avatarFileName = `${user.id}/${Date.now()}-${avatarFile.name}`
        const { data: avatarData, error: avatarError } = await supabase.storage
          .from("avatars")
          .upload(avatarFileName, avatarFile)

        if (avatarError) throw avatarError
        
        const { data: { publicUrl } } = supabase.storage
          .from("avatars")
          .getPublicUrl(avatarFileName)
          
        avatarUrl = publicUrl
      }

      // به‌روزرسانی پروفایل
      if (profile) {
        // اگر پروفایل وجود دارد، آن را به‌روزرسانی می‌کنیم
        const { error } = await supabase
          .from("profiles")
          .update({
            firstName,
            lastName,
            username,
            bio,
            avatarUrl,
            languageLevel,
            updatedAt: new Date().toISOString(),
          })
          .eq("userId", user.id)

        if (error) throw error
      } else {
        // اگر پروفایل وجود ندارد، یک پروفایل جدید ایجاد می‌کنیم
        const { error } = await supabase.from("profiles").insert({
          userId: user.id,
          firstName,
          lastName,
          username,
          bio,
          avatarUrl,
          languageLevel,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        })

        if (error) throw error
      }

      toast.success("پروفایل با موفقیت به‌روزرسانی شد")
      setIsEditing(false)
      router.replace(window.location.pathname)
    } catch (error) {
      console.error("خطا در به‌روزرسانی پروفایل:", error)
      toast.error("خطا در به‌روزرسانی پروفایل")
    } finally {
      setIsSubmitting(false)
    }
  }

  // خروج از حساب کاربری
  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut()
      router.push("/")
      router.replace("/")
    } catch (error) {
      console.error("خطا در خروج از حساب کاربری:", error)
      toast.error("خطا در خروج از حساب کاربری")
    }
  }

  return (
    <div className="container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarImage src={profile?.avatarUrl || ""} alt={user.email || ""} />
                  <AvatarFallback>
                    {profile?.firstName ? profile.firstName[0].toUpperCase() : user.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-lg font-medium">
                  {profile?.firstName && profile?.lastName
                    ? `${profile.firstName} ${profile.lastName}`
                    : user.email}
                </h3>
                {profile?.username && (
                  <p className="text-sm text-muted-foreground">@{profile.username}</p>
                )}
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <Badge variant="secondary">
                    <BookOpen className="w-3 h-3 mr-1" />
                    {readingStats?.totalBooksRead || 0} کتاب
                  </Badge>
                  <Badge variant="secondary">
                    <Brain className="w-3 h-3 mr-1" />
                    {wordStats?.totalWords || 0} لغت
                  </Badge>
                  <Badge variant="secondary">
                    <Flame className="w-3 h-3 mr-1" />
                    {readingStats?.readingStreak || 0} روز متوالی
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="profile">
                <User className="w-4 h-4 mr-2" />
                پروفایل
              </TabsTrigger>
              <TabsTrigger value="stats">
                <Trophy className="w-4 h-4 mr-2" />
                آمار مطالعه
              </TabsTrigger>
              <TabsTrigger value="settings">
                <Settings className="w-4 h-4 mr-2" />
                تنظیمات
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle>اطلاعات پروفایل</CardTitle>
                  <CardDescription>
                    اطلاعات پروفایل خود را مشاهده و ویرایش کنید
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSaveProfile}>
                    <div className="grid gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="avatar">تصویر پروفایل</Label>
                        <div className="flex items-center gap-4">
                          <Avatar className="w-16 h-16">
                            <AvatarImage
                              src={avatarPreview || profile?.avatarUrl || ""}
                              alt={user.email || ""}
                            />
                            <AvatarFallback>
                              {profile?.firstName
                                ? profile.firstName[0].toUpperCase()
                                : user.email?.[0].toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <Input
                            id="avatar"
                            type="file"
                            accept="image/*"
                            onChange={handleAvatarChange}
                            disabled={!isEditing}
                          />
                        </div>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="firstName">نام</Label>
                        <Input
                          id="firstName"
                          name="firstName"
                          defaultValue={profile?.firstName || ""}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="lastName">نام خانوادگی</Label>
                        <Input
                          id="lastName"
                          name="lastName"
                          defaultValue={profile?.lastName || ""}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="username">نام کاربری</Label>
                        <Input
                          id="username"
                          name="username"
                          defaultValue={profile?.username || ""}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bio">درباره من</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          defaultValue={profile?.bio || ""}
                          disabled={!isEditing}
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="languageLevel">سطح زبان</Label>
                        <Select
                          name="languageLevel"
                          defaultValue={profile?.languageLevel || "beginner"}
                          disabled={!isEditing}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="beginner">مبتدی</SelectItem>
                            <SelectItem value="intermediate">متوسط</SelectItem>
                            <SelectItem value="advanced">پیشرفته</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex justify-end gap-4">
                        {isEditing ? (
                          <>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setIsEditing(false)}
                              disabled={isSubmitting}
                            >
                              انصراف
                            </Button>
                            <Button type="submit" disabled={isSubmitting}>
                              {isSubmitting ? (
                                "در حال ذخیره..."
                              ) : (
                                <>
                                  <Save className="w-4 h-4 mr-2" />
                                  ذخیره تغییرات
                                </>
                              )}
                            </Button>
                          </>
                        ) : (
                          <Button type="button" onClick={() => setIsEditing(true)}>
                            <Settings className="w-4 h-4 mr-2" />
                            ویرایش پروفایل
                          </Button>
                        )}
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stats">
              <Card>
                <CardHeader>
                  <CardTitle>آمار مطالعه</CardTitle>
                  <CardDescription>
                    آمار و اطلاعات مطالعه و یادگیری شما
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-8">
                    <div className="grid gap-4">
                      <h3 className="text-lg font-medium">آمار کتاب‌خوانی</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center gap-2">
                              <BookOpen className="w-8 h-8 text-primary" />
                              <h4 className="text-sm font-medium">تعداد کتاب‌ها</h4>
                              <p className="text-2xl font-bold">
                                {readingStats?.totalBooksRead || 0}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center gap-2">
                              <Clock className="w-8 h-8 text-primary" />
                              <h4 className="text-sm font-medium">زمان مطالعه</h4>
                              <p className="text-2xl font-bold">
                                {formatReadingTime(readingStats?.totalReadingTime || 0)}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center gap-2">
                              <Flame className="w-8 h-8 text-primary" />
                              <h4 className="text-sm font-medium">روزهای متوالی</h4>
                              <p className="text-2xl font-bold">
                                {readingStats?.readingStreak || 0}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>

                    <Separator />

                    <div className="grid gap-4">
                      <h3 className="text-lg font-medium">آمار لغات</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center gap-2">
                              <Brain className="w-8 h-8 text-primary" />
                              <h4 className="text-sm font-medium">کل لغات</h4>
                              <p className="text-2xl font-bold">
                                {wordStats?.totalWords || 0}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center gap-2">
                              <BookOpen className="w-8 h-8 text-primary" />
                              <h4 className="text-sm font-medium">در حال یادگیری</h4>
                              <p className="text-2xl font-bold">
                                {wordStats?.learningWords || 0}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                        <Card>
                          <CardContent className="p-6">
                            <div className="flex flex-col items-center gap-2">
                              <Trophy className="w-8 h-8 text-primary" />
                              <h4 className="text-sm font-medium">یادگرفته شده</h4>
                              <p className="text-2xl font-bold">
                                {wordStats?.knownWords || 0}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>تنظیمات حساب کاربری</CardTitle>
                  <CardDescription>
                    تنظیمات مربوط به حساب کاربری خود را مدیریت کنید
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-sm font-medium">خروج از حساب کاربری</h4>
                        <p className="text-sm text-muted-foreground">
                          از حساب کاربری خود خارج شوید
                        </p>
                      </div>
                      <Button variant="destructive" onClick={handleSignOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        خروج
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
