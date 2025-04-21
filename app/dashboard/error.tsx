"use client"

import { ErrorCard } from "@/components/error-card"

export default function Error({
  _error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <ErrorCard
      title="خطا در بارگذاری داشبورد"
      description="متأسفانه در بارگذاری داشبورد خطایی رخ داد. لطفاً دوباره تلاش کنید."
      retryButton={{
        onClick: () => reset(),
        children: "تلاش مجدد",
      }}
    />
  )
}
