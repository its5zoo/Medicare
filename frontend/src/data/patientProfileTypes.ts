import type { FollowUpStatus, Patient } from './types'

export type { FollowUpStatus }

export type TimingOption = 'Morning' | 'Afternoon' | 'Night'
export type FrequencyOption = 'Daily' | 'Alternate Days' | 'Weekly'
export type ConditionStatus = 'Active' | 'Resolved' | 'Monitoring'
export type MedicineStatus = 'Active' | 'Completed' | 'Discontinued'
export type MedicineUpdateMode = 'Extend' | 'Replace_Current' | ''
export type DiscontinueReason =
  | 'Patient Recovered'
  | 'Side Effects'
  | 'Doctor Instruction'
  | 'Other'

export type FollowUpTimeSlot = 'Morning' | 'Afternoon' | 'Night'
export type FollowUpSource = 'Consultation' | 'Manual' | 'System'

export type TimelineEventType =
  | 'patient_registered'
  | 'consultation_completed'
  | 'condition_created'
  | 'medicine_added'
  | 'medicine_updated'
  | 'medicine_discontinued'
  | 'follow_up_scheduled'
  | 'follow_up_rescheduled'
  | 'follow_up_completed'
  | 'visit_completed'
  | (string & {})

export const TIMING_OPTIONS: TimingOption[] = ['Morning', 'Afternoon', 'Night']
export const FREQUENCY_OPTIONS: FrequencyOption[] = ['Daily', 'Alternate Days', 'Weekly']
export const DISCONTINUE_REASONS: DiscontinueReason[] = [
  'Patient Recovered',
  'Side Effects',
  'Doctor Instruction',
  'Other',
]
export const FOLLOW_UP_TIME_OPTIONS: FollowUpTimeSlot[] = ['Morning', 'Afternoon', 'Night']

export interface ConditionMedicine {
  id: string
  conditionId: string
  medicineName: string
  dosage: string
  timing: TimingOption[]
  frequency: FrequencyOption
  startDate: string
  durationDays: number
  instructions: string
  status: MedicineStatus
  discontinuedReason?: DiscontinueReason
}

export interface PatientCondition {
  id: string
  patientId: string
  conditionName: string
  infectionType: string
  diagnosisDate: string
  lastReviewDate?: string
  status: ConditionStatus
  notes?: string
  medicines: ConditionMedicine[]
}

export interface PatientFollowUpRecord {
  id: string
  patientId: string
  date: string
  timeSlot: FollowUpTimeSlot
  status: FollowUpStatus
  source: FollowUpSource
  completedDate?: string
  rescheduleReason?: string
}

export interface PatientTimelineEvent {
  id: string
  patientId: string
  type: TimelineEventType
  title: string
  description: string
  timestamp: string
}

export interface PatientProfileBundle {
  patientId: string
  conditions: PatientCondition[]
  followUps: PatientFollowUpRecord[]
  timeline: PatientTimelineEvent[]
  lastConsultationDate: string | null
}

export interface MedicineTableRow extends ConditionMedicine {
  conditionName: string
  endDate: string
}

export interface AddMedicineInput {
  conditionId: string
  medicineName: string
  dosage: string
  timing: TimingOption[]
  frequency: FrequencyOption
  startDate: string
  durationDays: number
  instructions: string
}

export interface UpdateMedicineInput {
  dosage: string
  timing: TimingOption[]
  frequency: FrequencyOption
  instructions: string
  updateMode: MedicineUpdateMode
  extendDays?: number
  replaceDurationDays?: number
}

export interface UpsertFollowUpInput {
  date: string
  timeSlot: FollowUpTimeSlot
  source?: FollowUpSource
  reason?: string
  clinicNotes?: string
}

export interface RescheduleFollowUpInput {
  date: string
  timeSlot: FollowUpTimeSlot
  reason: string
}

export const ACTIVE_FOLLOW_UP_STATUSES: FollowUpStatus[] = ['Scheduled', 'Rescheduled']

export function isActiveFollowUp(f: PatientFollowUpRecord): boolean {
  return ACTIVE_FOLLOW_UP_STATUSES.includes(f.status)
}

export function getActiveFollowUp(
  followUps: PatientFollowUpRecord[]
): PatientFollowUpRecord | null {
  return followUps.find(isActiveFollowUp) ?? null
}

const HISTORY_FOLLOW_UP_STATUSES: FollowUpStatus[] = [
  'Completed',
  'Cancelled',
  'Superseded',
]

export function getFollowUpHistory(
  followUps: PatientFollowUpRecord[]
): PatientFollowUpRecord[] {
  return followUps
    .filter((f) => HISTORY_FOLLOW_UP_STATUSES.includes(f.status))
    .sort((a, b) => {
      const dateA = a.completedDate ?? a.date
      const dateB = b.completedDate ?? b.date
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
}

export function getActiveFollowUpStatusLabel(
  active: PatientFollowUpRecord | null
): string {
  if (!active) return 'None scheduled'
  return active.status
}

export function computeEndDate(startDate: string, durationDays: number): string {
  const d = new Date(startDate)
  d.setDate(d.getDate() + durationDays)
  return d.toISOString().split('T')[0]
}

export function flattenMedicines(conditions: PatientCondition[]): MedicineTableRow[] {
  return conditions.flatMap((c) =>
    c.medicines.map((m) => ({
      ...m,
      conditionName: c.conditionName,
      endDate: computeEndDate(m.startDate, m.durationDays),
    }))
  )
}

export function formatTiming(timing: TimingOption[]): string {
  return timing.length ? timing.join(', ') : '-'
}

export interface TreatmentJourneyStep {
  key: string
  label: string
  completed: boolean
}

export interface FollowUpHistoryItem {
  id: string
  date: string
  title: string
  status?: FollowUpStatus | 'Created'
  description?: string
}

export interface PatientProfileOverview {
  patient: Patient
  doctorName: string
  lastVisitDate: string | null
  activeConditionsCount: number
  activeMedicinesCount: number
  activeFollowUp: PatientFollowUpRecord | null
  activeFollowUpStatusLabel: string
  nextFollowUpDateLabel: string
  treatmentJourney: TreatmentJourneyStep[]
}

export interface PatientProfileSnapshot {
  patient: Patient
  overview: PatientProfileOverview
  conditions: PatientCondition[]
  activeFollowup: PatientFollowUpRecord | null
  followupHistory: FollowUpHistoryItem[]
  timeline: PatientTimelineEvent[]
  snapshotGeneratedAt?: string
  optimisticCreatedAt?: number
}

export function countActiveConditions(conditions: PatientCondition[]): number {
  return conditions.filter((c) => c.status === 'Active' || c.status === 'Monitoring').length
}

export function countActiveMedicines(conditions: PatientCondition[]): number {
  return conditions.reduce(
    (n, c) => n + c.medicines.filter((m) => m.status === 'Active').length,
    0
  )
}
