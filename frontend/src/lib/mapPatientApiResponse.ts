import type { PatientApiResponse } from '@/api/patientTypes'
import type { Patient } from '@/data/types'
import type {
  ConditionStatus,
  FollowUpHistoryItem,
  FollowUpSource,
  FollowUpTimeSlot,
  FrequencyOption,
  MedicineStatus,
  PatientCondition,
  PatientFollowUpRecord,
  PatientProfileOverview,
  PatientProfileSnapshot,
  PatientTimelineEvent,
  TimingOption,
  TreatmentJourneyStep,
} from '@/data/patientProfileTypes'
import type { FollowUpStatus } from '@/data/types'

const TIMING_OPTIONS: TimingOption[] = ['Morning', 'Afternoon', 'Night']
const FREQUENCY_OPTIONS: FrequencyOption[] = ['Daily', 'Alternate Days', 'Weekly']
const FOLLOW_UP_STATUSES: FollowUpStatus[] = [
  'Scheduled',
  'Completed',
  'Missed',
  'Rescheduled',
  'Cancelled',
  'Superseded',
]

function mapTiming(timing: string[]): TimingOption[] {
  return timing
    .map((t) => {
      const match = TIMING_OPTIONS.find((opt) => opt.toLowerCase() === t.toLowerCase())
      if (match) return match
      if (t.toLowerCase() === 'evening') return 'Night' as TimingOption
      return null
    })
    .filter((t): t is TimingOption => t !== null)
}

function mapFrequency(frequency: string): FrequencyOption {
  const match = FREQUENCY_OPTIONS.find(
    (opt) => opt.toLowerCase() === frequency.toLowerCase()
  )
  return match ?? 'Daily'
}

function mapMedicineStatus(status: string): MedicineStatus {
  if (status === 'Stopped' || status === 'Discontinued') return 'Discontinued'
  if (status === 'Completed') return 'Completed'
  return 'Active'
}

function mapConditionStatus(status: string): ConditionStatus {
  if (status === 'Resolved') return 'Resolved'
  if (status === 'Monitoring') return 'Monitoring'
  return 'Active'
}

function mapTimeSlot(time: string): FollowUpTimeSlot {
  const lower = time.toLowerCase()
  if (lower === 'morning') return 'Morning'
  if (lower === 'afternoon') return 'Afternoon'
  if (lower === 'night' || lower === 'evening') return 'Night'
  return 'Morning'
}

function mapFollowUpStatus(status: string): FollowUpStatus {
  if (FOLLOW_UP_STATUSES.includes(status as FollowUpStatus)) {
    return status as FollowUpStatus
  }
  return 'Scheduled'
}

function mapFollowUpSource(source?: string): FollowUpSource {
  if (source === 'Consultation' || source === 'Manual' || source === 'System') {
    return source
  }
  return 'Manual'
}

function mapFollowUpRecord(
  record: PatientApiResponse['followups']['history'][0],
  patientId: string
): PatientFollowUpRecord {
  return {
    id: record.followupId,
    patientId,
    date: record.date,
    timeSlot: mapTimeSlot(record.time),
    status: mapFollowUpStatus(record.status),
    source: mapFollowUpSource(record.source),
    completedDate:
      record.status === 'Completed'
        ? record.updatedAt?.split('T')[0] ?? record.date
        : undefined,
    rescheduleReason: record.reason,
  }
}

function mapPatient(api: PatientApiResponse): Patient {
  const p = api.patient
  return {
    id: p.patientId,
    name: p.name,
    age: p.age,
    gender: (p.gender as Patient['gender']) ?? 'Other',
    phone: p.whatsapp,
    whatsapp: p.whatsapp,
    address: p.address ?? '',
    doctorId: '',
    registrationDate: p.registrationDate,
    status: p.status as Patient['status'], // API statuses normalized by ProfileStatusBadge
  }
}

function buildTreatmentJourney(
  journey: PatientApiResponse['treatmentJourney']
): TreatmentJourneyStep[] {
  return [
    { key: 'registered', label: 'Registered', completed: journey.registered },
    {
      key: 'consultation',
      label: 'Consultation Completed',
      completed: journey.consultationCompleted,
    },
    {
      key: 'prescription',
      label: 'Prescription Active',
      completed: journey.prescriptionActive,
    },
    {
      key: 'followup',
      label: 'Follow-Up Pending',
      completed: journey.followupExists,
    },
  ]
}

function buildFollowUpHistory(
  followups: PatientApiResponse['followups']
): FollowUpHistoryItem[] {
  return followups.history
    .map((record) => ({
      id: record.followupId,
      date: record.updatedAt?.split('T')[0] ?? record.date,
      title: `Follow-Up ${record.status}`,
      status: mapFollowUpStatus(record.status),
      description: record.reason
        ? `${record.time} · ${record.reason}`
        : record.time,
    }))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
}

function mapConditions(api: PatientApiResponse): PatientCondition[] {
  return api.conditions.map((condition) => ({
    id: condition.conditionId,
    patientId: api.patientId,
    conditionName: condition.title,
    infectionType: condition.infectionType,
    diagnosisDate: condition.diagnosisDate,
    lastReviewDate:
      condition.followupDate ??
      condition.createdAt?.split('T')[0] ??
      condition.diagnosisDate,
    status: mapConditionStatus(condition.status),
    medicines: condition.prescriptions.map((rx) => ({
      id: rx.prescriptionId,
      conditionId: condition.conditionId,
      medicineName: rx.medicineName,
      dosage: rx.dosage,
      timing: mapTiming(rx.timing),
      frequency: mapFrequency(rx.frequency),
      startDate: rx.startDate,
      durationDays: rx.durationDays,
      instructions: rx.instructions ?? '',
      status: mapMedicineStatus(rx.status),
    })),
  }))
}

function mapTimeline(api: PatientApiResponse): PatientTimelineEvent[] {
  return [...api.timeline]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .map((event) => ({
      id: event.eventId,
      patientId: api.patientId,
      type: event.type,
      title: event.title,
      description: event.description,
      timestamp: event.createdAt,
    }))
}

export function mapPatientApiResponse(api: PatientApiResponse): PatientProfileSnapshot {
  const patient = mapPatient(api)
  const activeFollowup = api.followups.active
    ? mapFollowUpRecord(api.followups.active, api.patientId)
    : null

  const activeFollowUpStatusLabel =
    api.overview.activeFollowupStatus ??
    api.overview.lastFollowupStatus ??
    'None scheduled'

  const overview: PatientProfileOverview = {
    patient,
    doctorName: api.patient.doctor,
    lastVisitDate: api.patient.lastVisitDate?.split('T')[0] ?? null,
    activeConditionsCount: api.overview.activeConditions,
    activeMedicinesCount: api.overview.activeMedicines,
    activeFollowUp: activeFollowup,
    activeFollowUpStatusLabel,
    nextFollowUpDateLabel: api.overview.nextFollowupDate ?? '-',
    treatmentJourney: buildTreatmentJourney(api.treatmentJourney),
  }

  return {
    patient,
    overview,
    conditions: mapConditions(api),
    activeFollowup,
    followupHistory: buildFollowUpHistory(api.followups),
    timeline: mapTimeline(api),
    snapshotGeneratedAt: api.snapshotGeneratedAt,
  }
}
