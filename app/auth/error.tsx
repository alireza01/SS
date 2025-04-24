'use client'

import { useEffect } from 'react'

import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function AuthError({
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
    <Card className="mx-auto max-w-md">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertCircle className="text-destructive size-5" />
          <CardTitle>خطا در احراز هویت</CardTitle>
        </div>
        <CardDescription>متأسفانه در فرآیند احراز هویت مشکلی پیش آمده است.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">{error.message}</p>
        <Button onClick={reset} variant="outline">
          تلاش مجدد
        </Button>
      </CardContent>
    </Card>
  )
} 
