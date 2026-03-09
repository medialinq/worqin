import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'

export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      {/* Greeting skeleton */}
      <Skeleton className="h-8 w-64" />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1fr_320px]">
        <div className="space-y-4">
          {/* KPI cards skeleton */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <Card key={i}>
                <CardContent className="space-y-3">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-20" />
                  <Skeleton className="h-1 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* AI block skeleton */}
          <Card>
            <CardContent className="flex gap-3">
              <Skeleton className="size-8 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-full" />
              </div>
            </CardContent>
          </Card>

          {/* Today column skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-20" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex gap-3">
                  <Skeleton className="h-4 w-12" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent activity skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-36" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="size-2.5 rounded-full" />
                  <Skeleton className="h-4 flex-1" />
                  <Skeleton className="h-4 w-12" />
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right column skeleton */}
        <div className="space-y-4">
          {/* Active timer skeleton */}
          <Card>
            <CardContent className="flex flex-col items-center gap-4 py-8">
              <Skeleton className="h-5 w-20 rounded-full" />
              <Skeleton className="h-12 w-48" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="size-16 rounded-full" />
            </CardContent>
          </Card>

          {/* Cashflow skeleton */}
          <Card>
            <CardHeader>
              <Skeleton className="h-5 w-24" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex justify-between">
                  <Skeleton className="h-4 w-28" />
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
              <Skeleton className="h-2 w-full rounded-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
