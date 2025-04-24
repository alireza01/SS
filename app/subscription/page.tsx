import { redirect } from "next/navigation"

import { SubscriptionClient } from "@/components/subscription/subscription-client"
import { createServerClient } from "@/lib/supabase/app-server"

export default async function SubscriptionPage() {
  const supabase = await createServerClient()

  // بررسی احراز هویت کاربر
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/auth/login?redirect=/subscription")
  }

  // دریافت اطلاعات اشتراک کاربر
  const { data: subscription } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("userId", session.user.id)
    .maybeSingle()

  // دریافت طرح‌های اشتراک
  const { data: plans } = await supabase.from("subscription_plans").select("*").order("price", { ascending: true })

  return <SubscriptionClient subscription={subscription || null} plans={plans || []} />
}
