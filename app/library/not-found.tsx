import Link from "next/link"

import { BookX } from "lucide-react"

import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container py-12">
      <div className="flex flex-col items-center justify-center text-center">
        <div className="bg-muted mb-4 flex size-16 items-center justify-center rounded-full">
          <BookX className="text-muted-foreground size-8" />
        </div>
        <h2 className="mb-2 text-2xl font-bold">صفحه یافت نشد</h2>
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
