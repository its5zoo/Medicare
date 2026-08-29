import { Skeleton } from '@/components/ui/skeleton'

function HeaderSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card">
      <Skeleton className="h-20 w-full rounded-none" />
      <div className="relative px-6 pb-6">
        <div className="-mt-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex items-end gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-24" />
              <div className="flex flex-wrap gap-4">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-36" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Skeleton className="h-10 w-44 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  )
}

function TabsSkeleton() {
  return (
    <div className="flex flex-wrap gap-1 rounded-xl bg-muted/40 p-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} className="h-9 w-24 rounded-lg" />
      ))}
    </div>
  )
}

function OverviewContentSkeleton() {
  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-20" />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-5 w-32" />
            </div>
          ))}
        </div>
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-36" />
        <div className="mt-4 flex flex-wrap gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-6 w-40" />
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border bg-card p-5">
            <div className="flex gap-4">
              <Skeleton className="h-11 w-11 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-16" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ConditionsContentSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <Skeleton className="h-5 w-44" />
      <Skeleton className="mt-2 h-4 w-72" />
      <div className="mt-4 space-y-3">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="rounded-2xl border border-border p-4">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
        ))}
      </div>
    </div>
  )
}

function FollowUpsContentSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-16 w-full rounded-2xl" />
      <div className="rounded-2xl border border-border bg-card p-6">
        <Skeleton className="h-48 w-full rounded-xl" />
      </div>
      <div className="rounded-2xl border border-border bg-card p-6">
        <Skeleton className="h-5 w-36" />
        <div className="mt-4 space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  )
}

function TimelineContentSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <div className="space-y-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-10 w-10 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-4 w-full max-w-md" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface PatientProfileSkeletonProps {
  activeTab?: string
}

export function PatientProfileSkeleton({ activeTab = 'overview' }: PatientProfileSkeletonProps) {
  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Skeleton className="h-9 w-36 rounded-lg" />
      <HeaderSkeleton />
      <TabsSkeleton />
      <div className="mt-6">
        {activeTab === 'conditions' && <ConditionsContentSkeleton />}
        {activeTab === 'follow-ups' && <FollowUpsContentSkeleton />}
        {activeTab === 'timeline' && <TimelineContentSkeleton />}
        {(activeTab === 'overview' || !activeTab) && <OverviewContentSkeleton />}
      </div>
    </div>
  )
}
