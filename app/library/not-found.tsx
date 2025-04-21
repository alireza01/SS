import Link from "next/link"
import { Button } from "@/components/ui/button"
import { BookX } from "lucide-react"

export default function NotFound() {
  return (
    <div className="container py-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <BookX className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-2xl font-bold mb-2">صفحه یافت نشد</h2>
        <p className="text-muted-foreground mb-6 max-w-md">
          متأسفانه صفحه مورد نظر شما یافت نشد. لطفاً به صفحه اصلی کتابخانه بازگردید.
        </p>
        <Button asChild>
          <Link href="/library">بازگشت به کتابخانه</Link>
        </Button>
      </div>
    </div>
  )
}