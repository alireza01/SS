"use client"

import { useState } from "react"

import Link from "next/link"

import { motion } from "framer-motion"
import { Check, ArrowLeft, Crown, Clock, BookOpen, Zap } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"
import { cn } from "@/lib/utils"

interface Subscription {
  id: string
  userId: string
  planId: string
  status: string
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

interface Plan {
  id: string
  name: string
  description: string
  price: number
  interval: "month" | "year"
  features: string[]
}

interface SubscriptionClientProps {
  subscription: Subscription | null
  plans: Plan[]
}

export function SubscriptionClient({ subscription, plans }: SubscriptionClientProps) {
  const supabase = createClient()
  const [selectedInterval, setSelectedInterval] = useState<"month" | "year">("month")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null)

  const filteredPlans = plans.filter((plan) => plan.interval === selectedInterval)
  const isSubscribed = subscription && subscription.status === "active"
  const currentPlan = isSubscribed ? plans.find((plan) => plan.id === subscription.planId) : null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return new Intl.DateTimeFormat("fa-IR").format(date)
  }

  const handleSelectPlan = (planId: string) => {
    setSelectedPlan(planId)
  }

  const handleSubscribe = async () => {
    if (!selectedPlan) {
      toast.error("لطفاً یک طرح اشتراک انتخاب کنید")
      return
    }

    setIsLoading(true)

    try {
      const { data: userData, error: userError } = await supabase.auth.getUser()
      if (userError) throw userError
      if (!userData.user) throw new Error("کاربر احراز هویت نشده است")

      const selectedPlanData = plans.find((plan) => plan.id === selectedPlan)
      if (!selectedPlanData) throw new Error("طرح اشتراک یافت نشد")

      // Calculate subscription period
      const now = new Date()
      const endDate = new Date(now)
      if (selectedPlanData.interval === "month") {
        endDate.setMonth(endDate.getMonth() + 1)
      } else {
        endDate.setFullYear(endDate.getFullYear() + 1)
      }

      // TODO: Integrate with payment gateway
      // Simulating payment process
      await new Promise((resolve) => setTimeout(resolve, 2000))

      const subscriptionData = {
        planId: selectedPlan,
        status: "active",
        currentPeriodStart: now.toISOString(),
        currentPeriodEnd: endDate.toISOString(),
        cancelAtPeriodEnd: false,
        updatedAt: now.toISOString(),
      }

      if (subscription) {
        const { error: updateError } = await supabase
          .from("subscriptions")
          .update(subscriptionData)
          .eq("id", subscription.id)
          .select()
          .single()

        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from("subscriptions")
          .insert({
            ...subscriptionData,
            userId: userData.user.id,
            createdAt: now.toISOString(),
          })
          .select()
          .single()

        if (insertError) throw insertError
      }

      toast.success("اشتراک با موفقیت فعال شد")
      window.location.reload()
    } catch (error) {
      console.error("خطا در خرید اشتراک:", error)
      toast.error(error instanceof Error ? error.message : "خطا در خرید اشتراک")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription) return

    setIsLoading(true)

    try {
      const { error } = await supabase
        .from("subscriptions")
        .update({
          cancelAtPeriodEnd: true,
          updatedAt: new Date().toISOString(),
        })
        .eq("id", subscription.id)
        .select()
        .single()

      if (error) throw error

      toast.success("اشتراک شما در پایان دوره فعلی لغو خواهد شد")
      window.location.reload()
    } catch (error) {
      console.error("خطا در لغو اشتراک:", error)
      toast.error(error instanceof Error ? error.message : "خطا در لغو اشتراک")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 flex items-center gap-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="ml-1 size-4" />
            بازگشت به داشبورد
          </Link>
        </Button>
      </div>

      <div className="mb-12 text-center">
        <h1 className="mb-2 text-3xl font-bold">طرح‌های اشتراک کتاب‌یار</h1>
        <p className="text-muted-foreground mx-auto max-w-2xl">
          با اشتراک ویژه کتاب‌یار، به تمامی کتاب‌ها و امکانات پیشرفته دسترسی داشته باشید و مهارت زبان خود را سریع‌تر ارتقا
          دهید.
        </p>
      </div>

      {isSubscribed && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
          <Card className="border-gold-200 dark:border-gold-800 bg-gold-50 dark:bg-gold-900/20 mb-8">
            <CardContent className="p-8">
              <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
                <div className="flex items-center gap-4">
                  <div className="bg-gold-100 dark:bg-gold-900/30 text-gold-600 dark:text-gold-400 flex size-16 items-center justify-center rounded-full">
                    <Crown className="size-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">اشتراک فعال</h2>
                    <p className="text-muted-foreground">شما در حال حاضر اشتراک {currentPlan?.name} دارید</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <div className="flex items-center gap-2">
                    <Clock className="text-muted-foreground size-4" />
                    <span className="text-muted-foreground text-sm">
                      تاریخ پایان: {formatDate(subscription.currentPeriodEnd)}
                    </span>
                  </div>
                  <Badge variant={subscription.cancelAtPeriodEnd ? "error" : "success"}>
                    {subscription.cancelAtPeriodEnd ? "اشتراک در پایان دوره لغو خواهد شد" : "تمدید خودکار فعال"}
                  </Badge>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end p-6 pt-0">
              {subscription.cancelAtPeriodEnd ? (
                <Button variant="outline" disabled>
                  اشتراک در حال لغو است
                </Button>
              ) : (
                <Button variant="outline" onClick={handleCancelSubscription} disabled={isLoading}>
                  {isLoading ? "در حال پردازش..." : "لغو اشتراک"}
                </Button>
              )}
            </CardFooter>
          </Card>
        </motion.div>
      )}

      <div className="mb-8 flex justify-center">
        <Tabs
          defaultValue="month"
          value={selectedInterval}
          onValueChange={(value: string) => setSelectedInterval(value as "month" | "year")}
          className="w-full max-w-md"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="month">ماهانه</TabsTrigger>
            <TabsTrigger value="year">سالانه (۲۰٪ تخفیف)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {filteredPlans.map((plan) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Card
              className={cn(
                "flex h-full flex-col",
                plan.name === "طلایی" ? "border-gold-400 dark:border-gold-600 shadow-lg" : "border-muted-foreground/20"
              )}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-xl">{plan.name}</CardTitle>
                    <CardDescription>{plan.description}</CardDescription>
                  </div>
                  {plan.name === "طلایی" && (
                    <Badge variant="gold">پیشنهاد ویژه</Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <div className="mb-6">
                  <p className="text-3xl font-bold">
                    {plan.price.toLocaleString()} تومان
                    <span className="text-muted-foreground text-sm font-normal">
                      {plan.interval === "month" ? " / ماهانه" : " / سالانه"}
                    </span>
                  </p>
                </div>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <Check className="ml-2 mt-0.5 size-5 shrink-0 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={cn(
                    "w-full",
                    plan.name === "طلایی" ? "bg-gold-500 hover:bg-gold-600" : ""
                  )}
                  onClick={() => handleSelectPlan(plan.id)}
                  variant={plan.name === "طلایی" ? "default" : "outline"}
                >
                  {isSubscribed
                    ? currentPlan?.id === plan.id
                      ? "اشتراک فعلی شما"
                      : "تغییر به این طرح"
                    : "انتخاب این طرح"}
                </Button>
              </CardFooter>
            </Card>
          </motion.div>
        ))}
      </div>

      {selectedPlan && (
        <div className="flex justify-center">
          <Button size="lg" className="bg-gold-500 hover:bg-gold-600" onClick={handleSubscribe} disabled={isLoading}>
            {isLoading ? "در حال پردازش..." : "پرداخت و فعال‌سازی اشتراک"}
          </Button>
        </div>
      )}

      <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <BookOpen className="size-6" />
          </div>
          <h3 className="mb-2 text-lg font-bold">دسترسی به تمام کتاب‌ها</h3>
          <p className="text-muted-foreground">
            با اشتراک ویژه، به تمامی کتاب‌های موجود در کتابخانه دسترسی خواهید داشت.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <Zap className="size-6" />
          </div>
          <h3 className="mb-2 text-lg font-bold">امکانات پیشرفته</h3>
          <p className="text-muted-foreground">
            از امکانات پیشرفته مانند ترجمه هوشمند، تلفظ کلمات و سیستم یادگیری شخصی‌سازی شده بهره‌مند شوید.
          </p>
        </div>
        <div className="text-center">
          <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400">
            <Crown className="size-6" />
          </div>
          <h3 className="mb-2 text-lg font-bold">بدون تبلیغات</h3>
          <p className="text-muted-foreground">
            تجربه مطالعه بدون وقفه و بدون تبلیغات، برای تمرکز بیشتر روی یادگیری زبان.
          </p>
        </div>
      </div>
    </div>
  )
}
