import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function ExportSkeleton() {
  return (
    <div className="space-y-4">
      {/* Filter skeletons */}
      <div className="flex gap-3">
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-12" />
          <Skeleton className="h-8 w-40" />
        </div>
        <div className="space-y-1">
          <Skeleton className="h-3.5 w-16" />
          <Skeleton className="h-8 w-40" />
        </div>
      </div>

      {/* Items card skeleton */}
      <Card className="rounded-xl">
        <CardHeader>
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-16" />
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="flex items-center justify-between rounded-lg p-3">
            <div className="flex items-center gap-3">
              <Skeleton className="size-4 rounded" />
              <Skeleton className="size-4 rounded" />
              <Skeleton className="h-4 w-24" />
            </div>
            <div className="flex items-center gap-4">
              <Skeleton className="h-4 w-20" />
            </div>
          </div>
          <div className="flex items-center justify-between border-t pt-3">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-5 w-24" />
          </div>
        </CardContent>
      </Card>

      {/* Action buttons skeleton */}
      <div className="flex gap-3">
        <Skeleton className="h-8 w-28" />
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-8 w-40" />
      </div>
    </div>
  )
}
