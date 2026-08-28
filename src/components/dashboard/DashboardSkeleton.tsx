import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'

function KpiCardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 card-shadow">
      <div className="flex items-start justify-between">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <Skeleton className="h-8 w-20" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-9 w-16" />
      </div>
    </div>
  )
}

function TableSkeleton({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="overflow-x-auto">
      <div className="w-full text-sm">
        <div className="flex gap-4 border-b border-border pb-3">
          {Array.from({ length: columns }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {Array.from({ length: rows }).map((_, row) => (
          <div
            key={row}
            className="flex gap-4 border-b border-border/50 py-3 last:border-0"
          >
            {Array.from({ length: columns }).map((_, col) => (
              <Skeleton key={col} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </div>
    </div>
  )
}

function ActivityFeedSkeleton({ items = 6 }: { items?: number }) {
  return (
    <div className="space-y-0">
      {Array.from({ length: items }).map((_, index) => (
        <div key={index} className="relative flex gap-4 pb-6">
          {index < items - 1 && (
            <div className="absolute left-[19px] top-10 h-[calc(100%-16px)] w-px bg-border" />
          )}
          <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
          <div className="min-w-0 flex-1 space-y-2 pt-1">
            <div className="flex items-start justify-between gap-2">
              <Skeleton className="h-4 w-36" />
              <Skeleton className="h-3 w-12" />
            </div>
            <Skeleton className="h-4 w-full max-w-sm" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatsCardsSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 mb-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <KpiCardSkeleton key={i} />
      ))}
    </div>
  )
}

export function DashboardContentSkeleton() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <Skeleton className="h-6 w-44" />
            <Skeleton className="h-8 w-16 rounded-lg" />
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={6} columns={7} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-40" />
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={5} columns={5} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-36" />
          </CardHeader>
          <CardContent>
            <TableSkeleton rows={4} columns={5} />
          </CardContent>
        </Card>
      </div>

      <Card className="h-fit">
        <CardHeader>
          <Skeleton className="h-6 w-28" />
        </CardHeader>
        <CardContent>
          <ActivityFeedSkeleton items={8} />
        </CardContent>
      </Card>
    </div>
  )
}
