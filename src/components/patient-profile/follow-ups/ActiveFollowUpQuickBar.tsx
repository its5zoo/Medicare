import { CalendarCheck, RotateCcw } from 'lucide-react'
import { FollowUpStatusBadge } from '@/components/shared/StatusBadge'
import { Button } from '@/components/ui/button'
import type { PatientFollowUpRecord } from '@/data/patientProfileTypes'
import { formatDate } from '@/lib/utils'

interface ActiveFollowUpQuickBarProps {
  followUp: PatientFollowUpRecord
  onGoToTab: () => void
  onComplete: () => void
  onReschedule: () => void
}

/** Visible on all profile tabs when an active follow-up exists. */
export function ActiveFollowUpQuickBar({
  followUp,
  onGoToTab,
  onComplete,
  onReschedule,
}: ActiveFollowUpQuickBarProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary/25 bg-primary/[0.06] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <button
        type="button"
        onClick={onGoToTab}
        className="flex min-w-0 flex-1 flex-wrap items-center gap-2 text-left"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-primary">
          Active follow-up
        </span>
        <FollowUpStatusBadge status={followUp.status} />
        <span className="text-sm font-medium">
          {formatDate(followUp.date)} · {followUp.timeSlot}
        </span>
        <span className="text-xs text-muted-foreground">({followUp.source})</span>
      </button>
      <div className="flex shrink-0 flex-wrap gap-2">
        <Button size="sm" variant="gradient" onClick={onComplete}>
          <CalendarCheck className="h-3.5 w-3.5" />
          Complete
        </Button>
        <Button size="sm" variant="outline" onClick={onReschedule}>
          <RotateCcw className="h-3.5 w-3.5" />
          Reschedule
        </Button>
      </div>
    </div>
  )
}
