import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"

export default function AuthLoading() {
  return (
    <Card>
      <CardHeader className="mx-auto space-y-2">
        <Skeleton className="mx-auto h-8 w-3/4" />
        <Skeleton className="h-4 w-full" />
      </CardHeader>
      <CardContent className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <div className="relative py-4">
          <div className="absolute inset-0 flex items-center">
            <Skeleton className="h-px w-full" />
          </div>
          <div className="relative flex justify-center">
            <Skeleton className="mx-auto h-4 w-16" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
      </CardContent>
    </Card>
  )
}