import Link from "next/link"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"

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
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 rounded-full bg-destructive/20 flex items-center justify-center text-destructive">
            <AlertCircle className="h-6 w-6" />
          </div>
        </div>
        <CardTitle className="text-2xl font-bold text-center">خطا در احراز هویت</CardTitle>
        <CardDescription className="text-center">{error}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-center text-muted-foreground">
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