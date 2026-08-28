export interface PatientApiPatient {
  name: string
  displayName?: string
  patientId: string
  whatsapp: string
  age: number
  gender: string
  doctor: string
  address?: string
  status: string
  registrationDate: string
  lastVisitDate?: string | null
}

export interface PatientApiOverview {
  activeConditions: number
  activeMedicines: number
  activeFollowupStatus: string | null
  lastFollowupStatus?: string | null
  nextFollowupDate: string | null
  lastActivityDate?: string | null
}

export interface PatientApiTreatmentJourney {
  registered: boolean
  consultationCompleted: boolean
  prescriptionActive: boolean
  followupExists: boolean
}

export interface PatientApiPrescription {
  prescriptionId: string
  recordId?: string
  medicineName: string
  dosage: string
  timing: string[]
  frequency: string
  startDate: string
  endDate?: string
  durationDays: number
  instructions?: string
  status: string
  updatedAt?: string
}

export interface PatientApiCondition {
  conditionRecordId?: string
  conditionId: string
  title: string
  infectionType: string
  status: string
  diagnosisDate: string
  followupDate?: string
  createdAt?: string
  prescriptions: PatientApiPrescription[]
  stats?: {
    totalMedicines: number
    activeMedicines: number
    stoppedMedicines: number
  }
}

export interface PatientApiFollowUpRecord {
  followupId: string
  status: string
  date: string
  time: string
  reason?: string
  source?: string
  updatedAt?: string
}

export interface PatientApiFollowUps {
  active: PatientApiFollowUpRecord | null
  history: PatientApiFollowUpRecord[]
}

export interface PatientApiTimelineEvent {
  eventId: string
  type: string
  action?: string
  title: string
  description: string
  source?: string
  relatedRecord?: string
  priority?: string
  createdAt: string
}

export interface PatientApiResponse {
  patientId: string
  patientRecordId?: string
  patient: PatientApiPatient
  overview: PatientApiOverview
  treatmentJourney: PatientApiTreatmentJourney
  conditions: PatientApiCondition[]
  followups: PatientApiFollowUps
  timeline: PatientApiTimelineEvent[]
  activePrescriptions?: PatientApiPrescription[]
  stats?: Record<string, number>
  snapshotVersion?: number
  snapshotGeneratedAt?: string
}
