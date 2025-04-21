import { headers } from "next/headers"
import { NextResponse } from "next/server"

import { createServerClient } from "@/lib/supabase/app-server"

export async function POST(req: Request) {
  try {
    const headersList = headers()
    const signature = headersList.get("stripe-signature")

    if (!signature) {
      return new NextResponse("No signature", { status: 400 })
    }

    const body = await req.text()
    const supabase = createServerClient()
    const event = JSON.parse(body)

    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object
        
        await supabase
          .from("subscriptions")
          .upsert({
            id: subscription.id,
            userId: subscription.metadata.userId,
            planId: subscription.metadata.planId,
            status: subscription.status,
            currentPeriodStart: new Date(subscription.current_period_start * 1000).toISOString(),
            currentPeriodEnd: new Date(subscription.current_period_end * 1000).toISOString(),
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            updatedAt: new Date().toISOString(),
          })
        break
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object
        
        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            cancelAtPeriodEnd: false,
            updatedAt: new Date().toISOString(),
          })
          .eq("id", subscription.id)
        break
      }
    }

    return new NextResponse(null, { status: 200 })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return new NextResponse("Webhook error", { status: 400 })
  }
} 
