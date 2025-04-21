"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container py-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center mb-4">
          <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
        </div>
        <h2 className="text-2xl font-bold mb-2">مشکلی پیش آمد</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          متأسفانه در بارگذاری کتابخانه مشکلی پیش آمد. لطفاً دوباره تلاش کنید.
        </p>
        <Button onClick={reset} variant="default">
          تلاش مجدد
        </Button>
      </div>
    </div>
  )
}
