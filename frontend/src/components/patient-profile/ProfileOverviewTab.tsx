import { Activity, CalendarCheck, Pill } from 'lucide-react'
import { PatientInfoCard } from '@/components/patient-profile/PatientInfoCard'
import { ProfileStatusBadge } from '@/components/patient-profile/StatusBadge'
import { TreatmentJourneyCard } from '@/components/patient-profile/TreatmentJourneyCard'
import { Card, CardContent } from '@/components/ui/card'
import type { PatientProfileOverview } from '@/data/patientProfileTypes'
import { formatDate } from '@/lib/utils'

export function ProfileOverviewTab({ overview }: { overview: PatientProfileOverview }) {
  const {
    activeConditionsCount,
    activeMedicinesCount,
    activeFollowUp,
    activeFollowUpStatusLabel,
    nextFollowUpDateLabel,
    treatmentJourney,
  } = overview

  const summaryCards = [
    {
      label: 'Active Conditions',
      value: String(activeConditionsCount),
      icon: Activity,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
    },
    {
      label: 'Active Medicines',
      value: String(activeMedicinesCount),
      icon: Pill,
      color: 'text-sky-600',
      bg: 'bg-sky-50 dark:bg-sky-950',
    },
    {
      label: 'Active Follow-Up Status',
      value: activeFollowUpStatusLabel,
      icon: CalendarCheck,
      color: 'text-blue-600',
      bg: 'bg-blue-50 dark:bg-blue-950',
      badge: activeFollowUp ? (
        <ProfileStatusBadge
          category="followup"
          status={activeFollowUp.status}
          className="mt-1"
        />
      ) : null,
    },
    {
      label: 'Next Follow-Up Date',
      value:
        nextFollowUpDateLabel !== '-'
          ? formatDate(nextFollowUpDateLabel)
          : 'Not scheduled',
      sub: activeFollowUp?.timeSlot,
      icon: CalendarCheck,
      color: 'text-sky-600',
      bg: 'bg-sky-50 dark:bg-sky-950',
    },
  ]

  return (
    <div className="space-y-5">
      <PatientInfoCard overview={overview} />
      <TreatmentJourneyCard steps={treatmentJourney} />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => {
          const Icon = card.icon
          return (
            <Card key={card.label}>
              <CardContent className="flex gap-4 p-5">
                <div
                  className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${card.bg}`}
                >
                  <Icon className={`h-5 w-5 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-snug break-words">{card.value}</p>
                  {'badge' in card && card.badge}
                  {'sub' in card && card.sub && (
                    <p className="mt-0.5 text-xs text-muted-foreground">{card.sub}</p>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
