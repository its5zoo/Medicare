import type { PatientStatus, PrescriptionStatus, FollowUpStatus } from '@/data/types'
import type { ConditionStatus, MedicineStatus } from '@/data/patientProfileTypes'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

const patientStatusConfig: Record<
  PatientStatus,
  { variant: 'default' | 'warning' | 'success' | 'danger' | 'purple' | 'secondary'; label: string }
> = {
  Registered: { variant: 'secondary', label: 'Registered' },
  'Consultation Pending': { variant: 'warning', label: 'Consultation Pending' },
  'Active Treatment': { variant: 'success', label: 'Active Treatment' },
  'Follow-Up Due': { variant: 'purple', label: 'Follow-Up Due' },
  Completed: { variant: 'default', label: 'Completed' },
}

const prescriptionStatusConfig: Record<
  PrescriptionStatus,
  { variant: 'success' | 'default' | 'danger'; label: string }
> = {
  Active: { variant: 'success', label: 'Active' },
  Completed: { variant: 'default', label: 'Completed' },
  Discontinued: { variant: 'danger', label: 'Discontinued' },
  Stopped: { variant: 'danger', label: 'Discontinued' },
}

const followUpStatusConfig: Record<
  string,
  { variant: 'default' | 'success' | 'danger' | 'warning' | 'purple' | 'secondary'; label: string }
> = {
  Today: { variant: 'purple', label: "Today's Follow-Up" },
  Upcoming: { variant: 'default', label: 'Upcoming' },
  Scheduled: { variant: 'default', label: 'Scheduled' },
  Pending: { variant: 'warning', label: 'Pending' },
  Completed: { variant: 'success', label: 'Completed' },
  Missed: { variant: 'danger', label: 'Missed' },
  Rescheduled: { variant: 'warning', label: 'Rescheduled' },
  Cancelled: { variant: 'secondary', label: 'Cancelled' },
  Superseded: { variant: 'secondary', label: 'Superseded' },
}

const conditionStatusConfig: Record<
  string,
  { variant: 'success' | 'default' | 'warning' | 'secondary'; label: string }
> = {
  Active: { variant: 'success', label: 'Active' },
  Resolved: { variant: 'default', label: 'Resolved' },
  Monitoring: { variant: 'warning', label: 'Monitoring' },
}

const medicineStatusConfig: Record<
  string,
  { variant: 'success' | 'default' | 'danger' | 'secondary'; label: string }
> = {
  Active: { variant: 'success', label: 'Active' },
  Completed: { variant: 'default', label: 'Completed' },
  Discontinued: { variant: 'danger', label: 'Discontinued' },
  Stopped: { variant: 'danger', label: 'Stopped' },
}

export function PatientStatusBadge({ status, className }: { status: PatientStatus | string; className?: string }) {
  const config = (patientStatusConfig as Record<string, any>)[status] || { variant: 'secondary', label: status || 'Unknown' }
  return <Badge variant={config.variant} className={cn(className)}>{config.label}</Badge>
}

export function PrescriptionStatusBadge({
  status,
  className,
}: {
  status: PrescriptionStatus | string
  className?: string
}) {
  const config = (prescriptionStatusConfig as Record<string, any>)[status] || { variant: 'secondary', label: status || 'Unknown' }
  return <Badge variant={config.variant} className={cn(className)}>{config.label}</Badge>
}

export function FollowUpStatusBadge({ status, className }: { status: FollowUpStatus | string; className?: string }) {
  const config = followUpStatusConfig[status] || { variant: 'secondary', label: status || 'Unknown' }
  return <Badge variant={config.variant} className={cn(className)}>{config.label}</Badge>
}

export function ConditionStatusBadge({ status, className }: { status: ConditionStatus | string; className?: string }) {
  const config = conditionStatusConfig[status] || { variant: 'secondary', label: status || 'Unknown' }
  return <Badge variant={config.variant} className={cn(className)}>{config.label}</Badge>
}

export function MedicineStatusBadge({ status, className }: { status: MedicineStatus | string; className?: string }) {
  const config = medicineStatusConfig[status] || { variant: 'secondary', label: status || 'Unknown' }
  return <Badge variant={config.variant} className={cn(className)}>{config.label}</Badge>
}
