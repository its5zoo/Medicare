import { User } from 'lucide-react'
import { PatientStatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PatientStatus } from '@/data/types'
import { formatDisplayName } from '@/lib/patientDisplayFormat'
import { formatPatientPhone } from '@/lib/patientSearch'
import { humanizeNumber, humanizeNaturalDate } from '@/lib/humanizer'

export interface ConsultationPatientSummary {
  patientId: string
  fullName: string
  phone: string
  doctor: string
  status?: string
  age?: number
  gender?: string
  registrationDate?: string
}

interface PatientSummaryCardProps {
  patient: ConsultationPatientSummary
}

const PATIENT_STATUSES: PatientStatus[] = [
  'Registered',
  'Consultation Pending',
  'Active Treatment',
  'Follow-Up Due',
  'Completed',
]

function mapPatientStatus(status: string): PatientStatus | null {
  if (PATIENT_STATUSES.includes(status as PatientStatus)) return status as PatientStatus
  return null
}

export function PatientSummaryCard({ patient }: PatientSummaryCardProps) {
  const displayName = formatDisplayName(patient.fullName)
  const mappedStatus = patient.status ? mapPatientStatus(patient.status) : null

  return (
    <Card className="overflow-hidden">
      <div className="h-1 bg-gradient-to-r from-primary to-accent" />
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Patient Summary</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold tracking-tight">{displayName}</h3>
              <p className="font-mono text-sm text-primary">{patient.patientId}</p>
            </div>
          </div>
          {mappedStatus && <PatientStatusBadge status={mappedStatus} />}
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {[
            { label: 'Age', value: patient.age ? `${humanizeNumber(patient.age)} years` : '-' },
            { label: 'Gender', value: patient.gender ?? '-' },
            { label: 'Phone', value: formatPatientPhone(patient.phone) },
            { label: 'Doctor', value: patient.doctor },
            {
              label: 'Registered',
              value: patient.registrationDate ? humanizeNaturalDate(patient.registrationDate) : '-',
            },
            { label: 'WhatsApp', value: formatPatientPhone(patient.phone) },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-border/60 bg-muted/30 px-3 py-2.5">
              <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                {item.label}
              </p>
              <p className="mt-0.5 truncate text-sm font-medium">{item.value}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
