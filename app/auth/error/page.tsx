import Link from "next/link"

import { AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

interface ErrorPageProps {
  searchParams: {
    error?: string
  }
}

export default function ErrorPage({ searchParams }: ErrorPageProps) {
  const error = searchParams.error || "خطایی رخ داده است"

  return (
    <Card>
      <CardHeader className="space-y-1">
        <div className="mb-4 flex justify-center">
          <div className="bg-destructive/20 text-destructive flex size-12 items-center justify-center rounded-full">
            <AlertCircle className="size-6" />
          </div>
        </div>
        <CardTitle className="text-center text-2xl font-bold">خطا در احراز هویت</CardTitle>
        <CardDescription className="text-center">{error}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-muted-foreground text-center">
          لطفاً دوباره تلاش کنید یا با پشتیبانی تماس بگیرید
        </p>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button asChild variant="default">
          <Link href="/auth/login">بازگشت به صفحه ورود</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
