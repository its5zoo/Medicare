import { ClipboardList } from 'lucide-react'
import type {
  ConsultationMedicineDraft,
  FollowUpTimeSlot,
  InfectionType,
} from '@/components/consultation/types'
import { formatTimingLabel } from '@/components/consultation/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

interface ConsultationSummaryCardProps {
  patientName: string
  conditionType: InfectionType
  skinProblem: string
  medicines: ConsultationMedicineDraft[]
  followUpDate: string
  followUpTime: FollowUpTimeSlot
  compact?: boolean
}

export function ConsultationSummaryCard({
  patientName,
  conditionType,
  skinProblem,
  medicines,
  followUpDate,
  followUpTime,
  compact = false,
}: ConsultationSummaryCardProps) {
  const rows = [
    { label: 'Patient Name', value: patientName },
    {
      label: 'Condition Type',
      value: skinProblem ? `${skinProblem} (${conditionType})` : conditionType,
    },
    { label: 'Total Medicines', value: String(medicines.length) },
    {
      label: 'Follow-Up Date',
      value: followUpDate ? formatDate(followUpDate) : '-',
    },
    { label: 'Follow-Up Time', value: followUpTime },
  ]

  return (
    <Card
      className={
        compact
          ? 'border-primary/20 bg-card shadow-sm'
          : 'border-primary/15 bg-muted/20'
      }
    >
      <CardHeader className={compact ? 'pb-2' : 'pb-3'}>
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <ClipboardList className="h-5 w-5 text-primary" />
          Consultation Summary
        </CardTitle>
        {!compact && (
          <p className="text-sm text-muted-foreground">
            Review details before saving this consultation.
          </p>
        )}
      </CardHeader>
      <CardContent className="space-y-4 pt-0">
        <dl className="grid gap-2 sm:grid-cols-2">
          {rows.map((row) => (
            <div
              key={row.label}
              className="rounded-lg border border-border/60 bg-background/90 px-3 py-2.5"
            >
              <dt className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {row.label}
              </dt>
              <dd className="mt-0.5 text-sm font-semibold">{row.value}</dd>
            </div>
          ))}
        </dl>

        {medicines.length > 0 && (
          <div>
            <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Medicine lifecycle
            </p>
            <ul className="max-h-48 space-y-1.5 overflow-y-auto pr-1">
              {medicines.map((med, i) => (
                <li
                  key={med.id}
                  className="rounded-lg border border-border/50 bg-background/80 px-3 py-2 text-xs"
                >
                  <span className="font-semibold text-foreground">
                    {i + 1}. {med.medicineName.trim() || `Medicine ${i + 1}`}
                  </span>
                  <p className="mt-0.5 text-muted-foreground">
                    Start {med.startDate ? formatDate(med.startDate) : '-'} · {med.durationDays}{' '}
                    days · {formatTimingLabel(med.timing)} · {med.frequency}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
