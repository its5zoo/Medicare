import {
  Bell,
  CalendarCheck,
  ClipboardList,
  Pill,
  Stethoscope,
  UserPlus,
} from 'lucide-react'
import { memo, useMemo } from 'react'
import { EmptyState } from '@/components/patient-profile/EmptyState'
import { ProfileStatusBadge } from '@/components/patient-profile/StatusBadge'
import type { PatientTimelineEvent } from '@/data/patientProfileTypes'
import {
  formatTimelineDateTime,
  formatTimelineDescription,
  formatTimelineTitle,
} from '@/lib/patientDisplayFormat'
import { cn } from '@/lib/utils'

type TimelineMeta = {
  icon: typeof UserPlus
  color: string
  label: string
}

const TIMELINE_META: Record<string, TimelineMeta> = {
  patient_registered: {
    icon: UserPlus,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    label: 'Registration',
  },
  registration: {
    icon: UserPlus,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    label: 'Registration',
  },
  consultation_completed: {
    icon: ClipboardList,
    color: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    label: 'Consultation',
  },
  consultation: {
    icon: ClipboardList,
    color: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    label: 'Consultation',
  },
  condition_created: {
    icon: Stethoscope,
    color: 'bg-blue-50 text-blue-600 dark:bg-blue-950 dark:text-blue-400',
    label: 'Condition',
  },
  medicine_added: {
    icon: Pill,
    color: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    label: 'Prescription',
  },
  medicine_updated: {
    icon: Pill,
    color: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    label: 'Prescription Update',
  },
  medicine_discontinued: {
    icon: Pill,
    color: 'bg-red-50 text-red-600 dark:bg-red-950 dark:text-red-400',
    label: 'Prescription Update',
  },
  prescription: {
    icon: Pill,
    color: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    label: 'Prescription',
  },
  prescription_update: {
    icon: Pill,
    color: 'bg-sky-50 text-sky-600 dark:bg-sky-950 dark:text-sky-400',
    label: 'Prescription Update',
  },
  follow_up_scheduled: {
    icon: CalendarCheck,
    color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
    label: 'Follow-Up',
  },
  follow_up_rescheduled: {
    icon: CalendarCheck,
    color: 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-400',
    label: 'Follow-Up',
  },
  follow_up_completed: {
    icon: CalendarCheck,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    label: 'Follow-Up',
  },
  followup: {
    icon: CalendarCheck,
    color: 'bg-indigo-50 text-indigo-600 dark:bg-indigo-950 dark:text-indigo-400',
    label: 'Follow-Up',
  },
  visit_completed: {
    icon: Bell,
    color: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950 dark:text-emerald-400',
    label: 'Visit',
  },
}

function normalizeTimelineType(type: string): string {
  return type.toLowerCase().replace(/\s+/g, '_').replace(/-/g, '_')
}

function getTimelineMeta(type: string): TimelineMeta {
  const normalized = normalizeTimelineType(type)
  if (TIMELINE_META[normalized]) return TIMELINE_META[normalized]

  const lower = type.toLowerCase()
  if (lower.includes('registration')) return TIMELINE_META.registration
  if (lower.includes('consultation')) return TIMELINE_META.consultation
  if (lower.includes('prescription_update')) return TIMELINE_META.prescription_update
  if (lower.includes('prescription')) return TIMELINE_META.prescription
  if (lower.includes('medicine') && lower.includes('discontinu')) {
    return TIMELINE_META.medicine_discontinued
  }
  if (lower.includes('medicine')) return TIMELINE_META.medicine_added
  if (lower.includes('follow')) return TIMELINE_META.followup

  return {
    icon: ClipboardList,
    color: 'bg-muted text-muted-foreground',
    label: type,
  }
}

const TimelineItem = memo(function TimelineItem({
  event,
  isLast,
}: {
  event: PatientTimelineEvent
  isLast: boolean
}) {
  const meta = getTimelineMeta(event.type)
  const Icon = meta.icon
  const title = formatTimelineTitle(event.title, event.type)
  const summaryLines = formatTimelineDescription(event.description)

  return (
    <div className="relative flex gap-4 pb-10 last:pb-0">
      {!isLast && (
        <div className="absolute left-5 top-11 h-[calc(100%-12px)] w-px bg-border" />
      )}
      <div
        className={cn(
          'relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          meta.color
        )}
      >
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1 pt-0.5">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[15px] font-semibold leading-snug">{title}</p>
          <ProfileStatusBadge category="timeline" status={meta.label} />
        </div>

        {summaryLines.length > 0 && (
          <div className="mt-2.5 space-y-1 text-sm leading-relaxed text-muted-foreground">
            {summaryLines.map((line, index) =>
              line === '' ? (
                <div key={`spacer-${index}`} className="h-1" />
              ) : line.endsWith(' changed:') ? (
                <p key={`${line}-${index}`} className="font-medium text-foreground/80">
                  {line}
                </p>
              ) : line.includes(' → ') ? (
                <p key={`${line}-${index}`} className="pl-0.5">
                  {line}
                </p>
              ) : (
                <p key={`${line}-${index}`}>{line}</p>
              )
            )}
          </div>
        )}

        <p className="mt-3 text-xs text-muted-foreground/75">
          {formatTimelineDateTime(event.timestamp)}
        </p>
      </div>
    </div>
  )
})

interface PatientTimelineProps {
  events: PatientTimelineEvent[]
}

export function PatientTimeline({ events }: PatientTimelineProps) {
  const sorted = useMemo(
    () =>
      [...events].sort(
        (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      ),
    [events]
  )

  if (sorted.length === 0) {
    return <EmptyState title="No activity recorded yet" />
  }

  return (
    <div className="rounded-2xl border border-border bg-card p-6 sm:p-7">
      <div className="relative">
        {sorted.map((event, index) => (
          <TimelineItem
            key={event.id}
            event={event}
            isLast={index === sorted.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
