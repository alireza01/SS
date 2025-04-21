import { Suspense } from "react"

import { redirect } from "next/navigation"

import { ReadingStatsAdvanced } from "@/components/dashboard/reading-stats-advanced"
import ProfileErrorBoundary from "@/components/profile/error-boundary"
import { ProfileForm } from "@/components/profile/profile-form"
import { ReadingHistory } from "@/components/profile/reading-history"
import { UserSettings } from "@/components/profile/user-settings"
import { UserVocabulary } from "@/components/profile/user-vocabulary"
import { Skeleton } from "@/components/ui/skeleton"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createServerClient } from "@/lib/supabase/app-server"

import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  fullName: string
  avatarUrl: string | null
  level: "beginner" | "intermediate" | "advanced"
  bio: string
  website: string
  createdAt: string
}

interface UserData {
  user: User
  profile: Profile
}

export const metadata = {
  title: "پروفایل کاربری | کتاب‌یار",
  description: "مدیریت پروفایل کاربری و تنظیمات در پلتفرم کتاب‌یار",
  keywords: "پروفایل کاربری, تنظیمات, آمار مطالعه, واژگان, کتاب‌یار",
}

export const revalidate = 0 // Disable cache for profile page

async function getUserData(): Promise<UserData> {
  const supabase = createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect("/auth/login?redirect=/profile")
  }

  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError && profileError.code !== "PGRST116") {
    throw new Error("Failed to fetch profile data")
  }

  return {
    user,
    profile: profile || {
      id: user.id,
      fullName: user.user_metadata?.full_name || "",
      avatarUrl: user.user_metadata?.avatar_url || null,
      level: "beginner",
      bio: "",
      website: "",
      createdAt: user.created_at,
    },
  }
}

export default async function ProfilePage() {
  return (
    <ProfileErrorBoundary>
      <div className="container py-10">
        <div className="mx-auto max-w-5xl">
          <h1 className="mb-6 text-3xl font-bold">پروفایل کاربری</h1>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="mb-8 grid grid-cols-4">
              <TabsTrigger value="profile">اطلاعات شخصی</TabsTrigger>
              <TabsTrigger value="stats">آمار مطالعه</TabsTrigger>
              <TabsTrigger value="vocabulary">واژگان من</TabsTrigger>
              <TabsTrigger value="settings">تنظیمات</TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-8">
              <Suspense fallback={<ProfileFormSkeleton />}>
                <ProfileFormWrapper />
              </Suspense>

              <Suspense fallback={<ReadingHistorySkeleton />}>
                <ReadingHistoryWrapper />
              </Suspense>
            </TabsContent>

            <TabsContent value="stats">
              <Suspense fallback={<StatsSkeleton />}>
                <StatsWrapper />
              </Suspense>
            </TabsContent>

            <TabsContent value="vocabulary">
              <Suspense fallback={<VocabularySkeleton />}>
                <VocabularyWrapper />
              </Suspense>
            </TabsContent>

            <TabsContent value="settings">
              <Suspense fallback={<SettingsSkeleton />}>
                <SettingsWrapper />
              </Suspense>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </ProfileErrorBoundary>
  )
}

async function ProfileFormWrapper() {
  const { user, profile } = await getUserData()
  return <ProfileForm user={user} profile={profile} />
}

async function ReadingHistoryWrapper() {
  const { user } = await getUserData()
  return <ReadingHistory userId={user.id} />
}

async function StatsWrapper() {
  const { user } = await getUserData()
  return <ReadingStatsAdvanced userId={user.id} />
}

async function VocabularyWrapper() {
  const { user } = await getUserData()
  return <UserVocabulary userId={user.id} />
}

async function SettingsWrapper() {
  const { user, profile } = await getUserData()
  return <UserSettings userId={user.id} initialLevel={profile.level} />
}

function ProfileFormSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-12 w-full max-w-sm" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}

function ReadingHistorySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="h-64 w-full" />
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="space-y-8">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <Skeleton className="h-80 w-full" />
    </div>
  )
}

function VocabularySkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40" />
        ))}
      </div>
    </div>
  )
}

function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-8 w-64" />
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-32" />
      </div>
    </div>
  )
}
