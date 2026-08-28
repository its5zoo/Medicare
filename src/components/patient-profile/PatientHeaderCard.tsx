import { Calendar, CalendarPlus, ClipboardList, Phone, Settings2, Stethoscope } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ProfileStatusBadge } from '@/components/patient-profile/StatusBadge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import type { PatientProfileOverview } from '@/data/patientProfileTypes'
import {
  formatDisplayName,
  formatLastVisitLabel,
} from '@/lib/patientDisplayFormat'
import { formatDate } from '@/lib/utils'

interface PatientHeaderCardProps {
  overview: PatientProfileOverview
  onFollowUpAction: () => void
}

export function PatientHeaderCard({ overview, onFollowUpAction }: PatientHeaderCardProps) {
  const { patient, doctorName, activeFollowUp, lastVisitDate } = overview
  const displayName = formatDisplayName(patient.name)
  const initials = displayName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .slice(0, 2)

  const hasActiveFollowUp = !!activeFollowUp
  const lastVisitMissing = !lastVisitDate

  const metadataItems = [
    {
      icon: Phone,
      label: patient.phone || patient.whatsapp,
    },
    {
      icon: Stethoscope,
      label: doctorName,
    },
    {
      icon: Calendar,
      label: `Registered ${formatDate(patient.registrationDate)}`,
    },
    {
      icon: ClipboardList,
      label: lastVisitMissing
        ? formatLastVisitLabel(lastVisitDate)
        : `Last Visit ${formatDate(lastVisitDate)}`,
      muted: lastVisitMissing,
    },
  ]

  return (
    <Card className="overflow-hidden">
      <div className="h-20 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/5" />
      <CardContent className="relative px-6 pb-6">
        {/* --- MOBILE VIEW --- */}
        <div className="-mt-10 flex flex-col gap-5 md:hidden">
          {/* Layer 1 & 2: Identity & Status */}
          <div className="flex flex-col items-center gap-3 text-center">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-background bg-gradient-to-br from-primary to-accent text-xl font-bold text-white shadow-lg mx-auto">
              {initials}
            </div>
            <div className="flex flex-col items-center">
              <h1 className="text-2xl font-bold tracking-tight text-foreground leading-tight">
                {displayName}
              </h1>
              <p className="font-mono text-xs text-muted-foreground mt-0.5">
                {patient.id}
              </p>
              <div className="mt-3">
                <ProfileStatusBadge category="patient" status={patient.status} className="w-auto justify-center" />
              </div>
            </div>
          </div>

          {/* Layer 3: Info Grid */}
          <div className="grid grid-cols-2 gap-2">
            {metadataItems.map(({ icon: Icon, label, muted }) => (
              <div
                key={label}
                className="flex flex-col gap-1.5 rounded-xl border border-border/50 bg-muted/30 p-2.5 shadow-sm"
              >
                <Icon className="h-4 w-4 text-primary shrink-0" />
                <span className={`text-xs font-medium leading-tight ${muted ? 'text-muted-foreground/80 italic' : 'text-foreground'}`}>
                  {label}
                </span>
              </div>
            ))}
          </div>

          {/* Layer 4: Actions */}
          <div className="flex flex-col gap-3 mt-1">
            <Button variant="gradient" className="w-full h-11" onClick={onFollowUpAction}>
              {hasActiveFollowUp ? (
                <>
                  <Settings2 className="h-4 w-4 mr-2" />
                  Manage Active Follow-Up
                </>
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4 mr-2" />
                  Create Follow-Up
                </>
              )}
            </Button>
            <Button variant="outline" className="w-full h-11" asChild>
              <Link to={`/consultation/${patient.id}`}>New Consultation</Link>
            </Button>
          </div>
        </div>

        {/* --- DESKTOP VIEW --- */}
        <div className="-mt-10 hidden md:flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex min-w-0 flex-col items-start sm:flex-row sm:items-end gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border-4 border-background bg-gradient-to-br from-primary to-accent text-xl font-bold text-white shadow-lg">
              {initials}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{displayName}</h1>
                <ProfileStatusBadge category="patient" status={patient.status} />
              </div>
              <p className="mt-1 font-mono text-sm text-primary">{patient.id}</p>
              <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm">
                {metadataItems.map(({ icon: Icon, label, muted }) => (
                  <span
                    key={label}
                    className={`inline-flex items-center gap-1.5 ${
                      muted ? 'text-muted-foreground/80 italic' : 'text-muted-foreground'
                    }`}
                  >
                    <Icon className="h-3.5 w-3.5 shrink-0" />
                    <span className="whitespace-nowrap">{label}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <Button variant="gradient" onClick={onFollowUpAction}>
              {hasActiveFollowUp ? (
                <>
                  <Settings2 className="h-4 w-4 mr-1.5" />
                  Manage Active Follow-Up
                </>
              ) : (
                <>
                  <CalendarPlus className="h-4 w-4 mr-1.5" />
                  Create Follow-Up
                </>
              )}
            </Button>
            <Button variant="outline" asChild>
              <Link to={`/consultation/${patient.id}`}>New Consultation</Link>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
