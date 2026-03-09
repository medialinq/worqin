import { Skeleton } from '@/components/ui/skeleton'

export function TimelineSkeleton() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      {/* Main area skeleton */}
      <div className="space-y-4">
        {/* Tabs skeleton */}
        <Skeleton className="h-8 w-40" />
        {/* Timeline skeleton */}
        <div className="space-y-2">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="flex gap-3">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-12 flex-1" />
            </div>
          ))}
        </div>
      </div>

      {/* Side panel skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-64 w-full rounded-xl" />
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
    </div>
  )
}
