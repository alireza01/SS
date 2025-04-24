export default function Loading() {
  return (
    <div className="space-y-4 p-4">
      {/* Book list loading skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="rounded-lg border border-gray-200 p-4 shadow-sm dark:border-gray-800"
          >
            <div className="h-48 animate-pulse rounded-md bg-gray-200 dark:bg-gray-800" />
            <div className="mt-4 space-y-3">
              <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
              <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
