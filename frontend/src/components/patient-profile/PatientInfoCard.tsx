import { ProfileStatusBadge } from '@/components/patient-profile/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PatientProfileOverview } from '@/data/patientProfileTypes'
import { formatDisplayName } from '@/lib/patientDisplayFormat'
import { formatDate } from '@/lib/utils'
import { humanizeNumber, humanizeNaturalDate } from '@/lib/humanizer'

interface PatientInfoCardProps {
  overview: PatientProfileOverview
}

export function PatientInfoCard({ overview }: PatientInfoCardProps) {
  const { patient, doctorName } = overview

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Patient</CardTitle>
      </CardHeader>
      <CardContent>
        {/* --- MOBILE VIEW --- */}
        <div className="md:hidden flex flex-col gap-5">
          {/* Group A: Identity is mostly in the Header now, but we'll include it here if the user wanted it in InfoCard as well. The prompt asked to group Name, ID, Status. However, since they are already in the header, maybe just format them nicely or keep them. The prompt specifically said:
              "Group A: Identity (Name, ID, Status)"
              "Group B: Contact (Phone, Doctor)"
              "Group C: Personal (Age, Gender)"
              "Group D: Timeline (Registration, Last Visit)"
          */}
          <div className="rounded-lg border border-border/50 bg-muted/10 p-4">
            <div className="flex flex-col gap-3">
              <div>
                <h2 className="text-base font-bold tracking-tight break-words">{formatDisplayName(patient.name)}</h2>
                <p className="font-mono text-xs text-primary mt-0.5">{patient.id}</p>
              </div>
              <ProfileStatusBadge category="patient" status={patient.status} className="w-fit" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {/* Group B: Contact */}
            <div className="rounded-lg border border-border/50 bg-muted/10 p-3 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">WhatsApp Number</span>
              <span className="text-[13px] sm:text-[15px] font-semibold whitespace-nowrap">{patient.whatsapp}</span>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/10 p-3 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Doctor</span>
              <span className="text-[14px] sm:text-[15px] font-semibold text-center leading-tight">{doctorName}</span>
            </div>

            {/* Group C: Personal */}
            <div className="rounded-lg border border-border/50 bg-muted/10 p-3 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Age</span>
              <span className="text-[15px] font-semibold">{patient.age}</span>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/10 p-3 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Gender</span>
              <span className="text-[15px] font-semibold">{patient.gender}</span>
            </div>

            {/* Group D: Timeline */}
            <div className="rounded-lg border border-border/50 bg-muted/10 p-3 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Registered</span>
              <span className="text-[14px] sm:text-[15px] font-semibold leading-tight">{formatDate(patient.registrationDate)}</span>
            </div>
            <div className="rounded-lg border border-border/50 bg-muted/10 p-3 flex flex-col items-center justify-center text-center gap-1">
              <span className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Last Visit</span>
              <span className="text-[14px] sm:text-[15px] font-semibold leading-tight">{overview.lastVisitDate ? formatDate(overview.lastVisitDate) : '-'}</span>
            </div>
          </div>
        </div>

        {/* --- DESKTOP VIEW --- */}
        <div className="hidden md:block">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <h2 className="text-xl font-bold tracking-tight break-words">{formatDisplayName(patient.name)}</h2>
              <p className="font-mono text-sm text-primary break-all">{patient.id}</p>
            </div>
            <ProfileStatusBadge category="patient" status={patient.status} />
          </div>
          <dl className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                WhatsApp Number
              </dt>
              <dd className="mt-1 font-medium">{patient.whatsapp}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Assigned Doctor
              </dt>
              <dd className="mt-1 font-medium">{doctorName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Current Status
              </dt>
              <dd className="mt-1">
                <ProfileStatusBadge category="patient" status={patient.status} />
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Age
              </dt>
              <dd className="mt-1 font-medium">{patient.age ? `${humanizeNumber(patient.age)} years` : '-'}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Gender
              </dt>
              <dd className="mt-1 font-medium">{patient.gender}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Registration Date
              </dt>
              <dd className="mt-1 font-medium">{humanizeNaturalDate(patient.registrationDate)}</dd>
            </div>
          </dl>
        </div>
      </CardContent>
    </Card>
  )
}
