import { memo } from 'react'
import { EmptyState } from '@/components/patient-profile/EmptyState'
import { ProfileStatusBadge } from '@/components/patient-profile/StatusBadge'
import type { FollowUpHistoryItem } from '@/data/patientProfileTypes'
import { formatDate } from '@/lib/utils'

interface FollowupHistoryListProps {
  history: FollowUpHistoryItem[]
}

const FollowupHistoryItemCard = memo(function FollowupHistoryItemCard({
  item,
}: {
  item: FollowUpHistoryItem
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-4 py-3">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-semibold">{formatDate(item.date)}</p>
          <p className="mt-0.5 text-sm font-medium">{item.title}</p>
          {item.description && (
            <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
          )}
        </div>
        {item.status && (
          <ProfileStatusBadge category="followup" status={item.status} />
        )}
      </div>
    </div>
  )
})

export function FollowupHistoryList({ history }: FollowupHistoryListProps) {
  if (history.length === 0) {
    return <EmptyState title="No follow-up history available." />
  }

  return (
    <div className="space-y-2">
      {history.map((item) => (
        <FollowupHistoryItemCard key={item.id} item={item} />
      ))}
    </div>
  )
}
