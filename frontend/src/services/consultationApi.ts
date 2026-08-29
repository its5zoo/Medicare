import { apiPost } from '@/services/api'
import type { ConsultationMedicineDraft } from '@/components/consultation/types'

export interface ConsultationMedicinePayload {
  'Medicine Name': string
  Dosage: string
  Timing: string[]
  Frequency: string
  'Duration (Days)': number
  Instructions: string
  Reminder: 'Yes' | 'No'
  'Start Date': string
}

export interface ConsultationCreateRequest {
  Patient: string
  'Skin Problem': string
  'Infection Type': string
  'Diagnosis Date': string
  Medicines: ConsultationMedicinePayload[]
  'Follow-Up Date': string
  'Follow-Up Time': string
}

export interface ConsultationResponseData {
  patient: {
    name: string
    code: string
  }
  condition: {
    id: string
  }
  Medicine: {
    count: number
    ids: string
  }
  followup: {
    date: string
    time: string
  }
}

export function mapMedicineToPayload(med: ConsultationMedicineDraft): ConsultationMedicinePayload {
  return {
    'Medicine Name': med.medicineName.trim(),
    Dosage: med.dosage.trim(),
    Timing: med.timing,
    Frequency: med.frequency,
    'Duration (Days)': med.durationDays,
    Instructions: med.instructions.trim(),
    Reminder: med.reminder ? 'Yes' : 'No',
    'Start Date': med.startDate,
  }
}

export function buildConsultationPatientLabel(patientId: string, fullName: string): string {
  return `${patientId} - ${fullName}`
}

export async function createConsultation(payload: ConsultationCreateRequest) {
  return apiPost<ConsultationResponseData>('/consultations/create', payload)
}
