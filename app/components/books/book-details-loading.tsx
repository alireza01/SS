export function BookDetailsLoading() {
  return (
    <div className="container py-10">
      <div className="grid gap-8 md:grid-cols-[2fr,1fr]">
        {/* Book info section */}
        <div className="space-y-6">
          <div className="h-8 w-3/4 animate-pulse rounded-lg bg-gray-200" />
          <div className="h-4 w-1/2 animate-pulse rounded-lg bg-gray-200" />
          <div className="space-y-2">
            <div className="h-4 w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="h-4 w-full animate-pulse rounded-lg bg-gray-200" />
            <div className="h-4 w-3/4 animate-pulse rounded-lg bg-gray-200" />
          </div>
        </div>
        
        {/* Book cover section */}
        <div className="aspect-[3/4] w-full animate-pulse rounded-lg bg-gray-200" />
      </div>
    </div>
  )
} 