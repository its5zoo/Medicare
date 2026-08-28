import { PatientTimeline } from '@/components/patient-profile/PatientTimeline'
import type { PatientTimelineEvent } from '@/data/patientProfileTypes'

export function ProfileTimelineTab({ events }: { events: PatientTimelineEvent[] }) {
  return <PatientTimeline events={events} />
}
