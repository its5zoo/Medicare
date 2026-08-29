import { FollowupHistoryList } from '@/components/patient-profile/FollowupHistoryList'
import type { FollowUpHistoryItem } from '@/data/patientProfileTypes'
import type { PatientFollowUpRecord } from '@/data/patientProfileTypes'

function mapRecordsToHistory(records: PatientFollowUpRecord[]): FollowUpHistoryItem[] {
  return records.map((record) => ({
    id: record.id,
    date: record.completedDate ?? record.date,
    title: `Follow-Up ${record.status}`,
    status: record.status,
    description: record.rescheduleReason
      ? `${record.timeSlot} · ${record.rescheduleReason}`
      : record.timeSlot,
  }))
}

/** @deprecated Use FollowupHistoryList - kept for backward compatibility */
export function FollowUpHistoryTable({ history }: { history: PatientFollowUpRecord[] }) {
  return <FollowupHistoryList history={mapRecordsToHistory(history)} />
}
