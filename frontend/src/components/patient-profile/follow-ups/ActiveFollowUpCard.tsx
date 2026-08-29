import { Calendar, CalendarCheck, Clock, RotateCcw, Sparkles } from 'lucide-react'
import { ProfileStatusBadge } from '@/components/patient-profile/StatusBadge'
import { Button } from '@/components/ui/button'
import type { PatientFollowUpRecord } from '@/data/patientProfileTypes'
import { formatDate } from '@/lib/utils'

interface ActiveFollowUpCardProps {
  followUp: PatientFollowUpRecord
  onComplete: () => void
  onReschedule: () => void
}

export function ActiveFollowUpCard({
  followUp,
  onComplete,
  onReschedule,
}: ActiveFollowUpCardProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border-2 border-primary/30 bg-gradient-to-br from-primary/[0.08] via-card to-accent/[0.06] shadow-lg ring-1 ring-primary/10">
      <div className="absolute right-0 top-0 h-24 w-24 translate-x-6 -translate-y-6 rounded-full bg-primary/10 blur-2xl" />
      <div className="relative p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-primary">
                Active Follow-Up
              </p>
              <p className="text-sm text-muted-foreground">Requires manager attention</p>
            </div>
          </div>
          <ProfileStatusBadge category="followup" status={followUp.status} />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Follow-Up Date
            </p>
            <p className="mt-1 text-lg font-bold">{formatDate(followUp.date)}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
            <p className="flex items-center gap-1.5 text-xs font-medium uppercase text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              Follow-Up Time
            </p>
            <p className="mt-1 text-lg font-bold">{followUp.timeSlot}</p>
          </div>
          <div className="rounded-xl border border-border/60 bg-background/80 px-4 py-3">
            <p className="text-xs font-medium uppercase text-muted-foreground">Source</p>
            <p className="mt-1 text-lg font-bold">{followUp.source}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          <Button variant="gradient" size="lg" onClick={onComplete} className="flex-1 sm:flex-none">
            <CalendarCheck className="h-4 w-4" />
            Complete Follow-Up
          </Button>
          <Button variant="outline" size="lg" onClick={onReschedule} className="flex-1 sm:flex-none">
            <RotateCcw className="h-4 w-4" />
            Reschedule Follow-Up
          </Button>
        </div>
      </div>
    </div>
  )
}

/** Alias for component architecture naming */
export const ActiveFollowupCard = ActiveFollowUpCard
