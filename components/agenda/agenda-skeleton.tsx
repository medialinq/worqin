import { Skeleton } from "@/components/ui/skeleton"

const DAYS = 7
const SLOTS = 11 // 08:00 to 18:00

export function AgendaSkeleton() {
  return (
    <div className="space-y-4">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-48" />
      </div>

      {/* Calendar grid skeleton */}
      <div className="overflow-hidden rounded-xl border bg-card">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b">
          <div className="p-2" />
          {Array.from({ length: DAYS }).map((_, i) => (
            <div key={i} className="border-l p-2">
              <Skeleton className="h-4 w-8 mx-auto" />
              <Skeleton className="mt-1 h-6 w-6 mx-auto rounded-full" />
            </div>
          ))}
        </div>

        {/* Time slots */}
        {Array.from({ length: SLOTS }).map((_, i) => (
          <div key={i} className="grid grid-cols-[60px_repeat(7,1fr)]">
            <div className="border-t p-2">
              <Skeleton className="h-3 w-10" />
            </div>
            {Array.from({ length: DAYS }).map((_, j) => (
              <div key={j} className="h-12 border-l border-t p-1">
                {i % 3 === 0 && j % 2 === 1 && <Skeleton className="h-8 w-full rounded-md" />}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}
