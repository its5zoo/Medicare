export type TimingOption = 'Morning' | 'Afternoon' | 'Night'
export type FrequencyOption = 'Daily' | 'Alternate Days' | 'Weekly'
export type InfectionType =
  | 'Acne'
  | 'Fungal Infection'
  | 'Allergy'
  | 'Pigmentation'
  | 'Hair Loss'
  | 'Other'
export type FollowUpTimeSlot = 'Morning' | 'Afternoon' | 'Night'

export const TIMING_OPTIONS: TimingOption[] = ['Morning', 'Afternoon', 'Night']
export const FREQUENCY_OPTIONS: FrequencyOption[] = ['Daily', 'Alternate Days', 'Weekly']
export const INFECTION_TYPES: InfectionType[] = [
  'Acne',
  'Fungal Infection',
  'Allergy',
  'Pigmentation',
  'Hair Loss',
  'Other',
]
export const FOLLOW_UP_TIME_OPTIONS: FollowUpTimeSlot[] = ['Morning', 'Afternoon', 'Night']

/** Each medicine owns its own schedule and lifecycle fields. */
export interface ConsultationMedicineDraft {
  id: string
  medicineName: string
  dosage: string
  timing: TimingOption[]
  frequency: FrequencyOption
  startDate: string
  durationDays: number
  instructions: string
  reminder: boolean
}

export function createEmptyMedicine(): ConsultationMedicineDraft {
  return {
    id: `med-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    medicineName: '',
    dosage: '',
    timing: [],
    frequency: 'Daily',
    startDate: new Date().toISOString().split('T')[0],
    durationDays: 0,
    instructions: '',
    reminder: false,
  }
}

export function formatTimingLabel(timing: TimingOption[]): string {
  return timing.length ? timing.join(', ') : 'Not set'
}

export function medicineSummaryLine(med: ConsultationMedicineDraft): string {
  const parts = [
    med.dosage || 'No dosage',
    formatTimingLabel(med.timing),
    med.frequency,
    `${med.durationDays} days`,
  ]
  return parts.join(' · ')
}
