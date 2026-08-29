import type { Patient } from '@/data/types'
import type {
  FollowUpHistoryItem,
  PatientFollowUpRecord,
  PatientProfileBundle,
  PatientProfileOverview,
  PatientProfileSnapshot,
  PatientTimelineEvent,
  TreatmentJourneyStep,
} from '@/data/patientProfileTypes'
import {
  countActiveConditions,
  countActiveMedicines,
  getActiveFollowUp,
  getActiveFollowUpStatusLabel,
  isActiveFollowUp,
} from '@/data/patientProfileTypes'

const FOLLOW_UP_TIMELINE_TYPES = new Set([
  'follow_up_scheduled',
  'follow_up_rescheduled',
  'follow_up_completed',
  'Follow-Up',
  'Follow-Up Completed',
  'Follow-Up Rescheduled',
])

const FOLLOW_UP_STATUS_TITLES: Record<string, string> = {
  Scheduled: 'Follow-Up Scheduled',
  Rescheduled: 'Follow-Up Rescheduled',
  Completed: 'Follow-Up Completed',
  Cancelled: 'Follow-Up Cancelled',
  Missed: 'Follow-Up Missed',
  Superseded: 'Follow-Up Superseded',
}

function buildTreatmentJourney(
  bundle: PatientProfileBundle,
  activeFollowup: PatientFollowUpRecord | null
): TreatmentJourneyStep[] {
  const hasConsultation =
    !!bundle.lastConsultationDate ||
    bundle.timeline.some(
      (event) =>
        event.type === 'consultation_completed' ||
        event.type.toLowerCase().includes('consultation')
    )
  const hasActivePrescription = countActiveMedicines(bundle.conditions) > 0

  return [
    { key: 'registered', label: 'Registered', completed: true },
    { key: 'consultation', label: 'Consultation Completed', completed: hasConsultation },
    { key: 'prescription', label: 'Prescription Active', completed: hasActivePrescription },
    {
      key: 'followup',
      label: 'Follow-Up Pending',
      completed: !!activeFollowup,
    },
  ]
}

function buildFollowUpHistory(bundle: PatientProfileBundle): FollowUpHistoryItem[] {
  const fromRecords: FollowUpHistoryItem[] = bundle.followUps
    .filter((record) => !isActiveFollowUp(record))
    .map((record) => ({
      id: record.id,
      date: record.completedDate ?? record.date,
      title: FOLLOW_UP_STATUS_TITLES[record.status] ?? `Follow-Up ${record.status}`,
      status: record.status,
      description: record.rescheduleReason
        ? `${record.timeSlot} · ${record.rescheduleReason}`
        : record.timeSlot,
    }))

  const fromTimeline: FollowUpHistoryItem[] = bundle.timeline
    .filter((event) => FOLLOW_UP_TIMELINE_TYPES.has(event.type))
    .map((event) => ({
      id: event.id,
      date: event.timestamp.split('T')[0],
      title: event.title,
      description: event.description,
    }))

  const merged = [...fromRecords, ...fromTimeline]
  const seen = new Set<string>()

  return merged
    .filter((item) => {
      const key = `${item.date}-${item.title}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function buildOverview(
  bundle: PatientProfileBundle,
  patient: Patient,
  doctorName: string,
  activeFollowup: PatientFollowUpRecord | null
): PatientProfileOverview {
  return {
    patient,
    doctorName,
    lastVisitDate: bundle.lastConsultationDate,
    activeConditionsCount: countActiveConditions(bundle.conditions),
    activeMedicinesCount: countActiveMedicines(bundle.conditions),
    activeFollowUp: activeFollowup,
    activeFollowUpStatusLabel: getActiveFollowUpStatusLabel(activeFollowup),
    nextFollowUpDateLabel: activeFollowup ? activeFollowup.date : '-',
    treatmentJourney: buildTreatmentJourney(bundle, activeFollowup),
  }
}

export function buildPatientProfileSnapshot(
  bundle: PatientProfileBundle,
  patient: Patient,
  doctorName: string
): PatientProfileSnapshot {
  const activeFollowup = getActiveFollowUp(bundle.followUps)

  return {
    patient,
    overview: buildOverview(bundle, patient, doctorName, activeFollowup),
    conditions: bundle.conditions,
    activeFollowup,
    followupHistory: buildFollowUpHistory(bundle),
    timeline: sortTimelineNewestFirst(bundle.timeline),
  }
}

export function sortTimelineNewestFirst(
  events: PatientTimelineEvent[]
): PatientTimelineEvent[] {
  return [...events].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  )
}
