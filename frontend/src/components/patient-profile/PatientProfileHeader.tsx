import { PatientHeaderCard } from '@/components/patient-profile/PatientHeaderCard'
import type { PatientProfileOverview } from '@/data/patientProfileTypes'

interface PatientProfileHeaderProps {
  overview: PatientProfileOverview
  onFollowUpAction: () => void
}

export function PatientProfileHeader(props: PatientProfileHeaderProps) {
  return <PatientHeaderCard {...props} />
}
