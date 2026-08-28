import type { FollowUpStatus, PatientStatus, PrescriptionStatus } from '@/data/types'
import type { ConditionStatus, MedicineStatus } from '@/data/patientProfileTypes'
import {
  ConditionStatusBadge,
  FollowUpStatusBadge,
  MedicineStatusBadge,
  PatientStatusBadge,
  PrescriptionStatusBadge,
} from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type ProfileStatusCategory =
  | 'patient'
  | 'followup'
  | 'prescription'
  | 'condition'
  | 'medicine'
  | 'timeline'

const PATIENT_STATUSES: PatientStatus[] = [
  'Registered',
  'Consultation Pending',
  'Active Treatment',
  'Follow-Up Due',
  'Completed',
]

const FOLLOW_UP_STATUSES: FollowUpStatus[] = [
  'Scheduled',
  'Completed',
  'Missed',
  'Rescheduled',
  'Cancelled',
  'Superseded',
]

const PRESCRIPTION_STATUSES: PrescriptionStatus[] = ['Active', 'Completed', 'Discontinued']
const CONDITION_STATUSES: ConditionStatus[] = ['Active', 'Resolved', 'Monitoring']
const MEDICINE_STATUSES: MedicineStatus[] = ['Active', 'Completed', 'Discontinued']

function normalizePatientStatus(status: string): PatientStatus | null {
  if (status === 'Active') return 'Active Treatment'
  if (PATIENT_STATUSES.includes(status as PatientStatus)) return status as PatientStatus
  return null
}

function normalizePrescriptionStatus(status: string): PrescriptionStatus | null {
  if (status === 'Stopped') return 'Discontinued'
  if (PRESCRIPTION_STATUSES.includes(status as PrescriptionStatus)) {
    return status as PrescriptionStatus
  }
  return null
}

interface ProfileStatusBadgeProps {
  category: ProfileStatusCategory
  status: string
  className?: string
}

export function ProfileStatusBadge({ category, status, className }: ProfileStatusBadgeProps) {
  switch (category) {
    case 'patient': {
      const mapped = normalizePatientStatus(status)
      if (mapped) return <PatientStatusBadge status={mapped} className={className} />
      break
    }
    case 'followup': {
      if (FOLLOW_UP_STATUSES.includes(status as FollowUpStatus)) {
        return <FollowUpStatusBadge status={status as FollowUpStatus} className={className} />
      }
      break
    }
    case 'prescription': {
      const mapped = normalizePrescriptionStatus(status)
      if (mapped) return <PrescriptionStatusBadge status={mapped} className={className} />
      break
    }
    case 'condition': {
      if (CONDITION_STATUSES.includes(status as ConditionStatus)) {
        return <ConditionStatusBadge status={status as ConditionStatus} className={className} />
      }
      break
    }
    case 'medicine': {
      if (MEDICINE_STATUSES.includes(status as MedicineStatus)) {
        return <MedicineStatusBadge status={status as MedicineStatus} className={className} />
      }
      break
    }
    case 'timeline':
      break
  }

  return (
    <Badge variant="secondary" className={cn(className)}>
      {status}
    </Badge>
  )
}
