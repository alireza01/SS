export type SubscriptionStatus = "active" | "canceled" | "past_due" | "incomplete" | "incomplete_expired" | "trialing" | "unpaid"

export type SubscriptionInterval = "month" | "year"

export interface SubscriptionPlan {
  id: string
  name: string
  description: string
  price: number
  interval: SubscriptionInterval
  features: string[]
  createdAt: string
  updatedAt: string
}

export interface Subscription {
  id: string
  userId: string
  planId: string
  status: SubscriptionStatus
  currentPeriodStart: string
  currentPeriodEnd: string
  cancelAtPeriodEnd: boolean
  createdAt: string
  updatedAt: string
}

export interface SubscriptionWithPlan extends Subscription {
  plan: SubscriptionPlan
}

export interface CreateSubscriptionData {
  planId: string
  paymentMethodId: string
  userId: string
}

export interface UpdateSubscriptionData {
  planId?: string
  cancelAtPeriodEnd?: boolean
}

export interface SubscriptionError {
  message: string
  code?: string
} 