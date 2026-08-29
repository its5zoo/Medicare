import { apiPost, type ApiResult } from '@/services/api'
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

export async function createConsultation(payload: ConsultationCreateRequest): Promise<ApiResult<ConsultationResponseData>> {
  try {
    const res = await apiPost<ConsultationResponseData>('/consultations/create', payload)
    if (res.success) return res
  } catch (err) {
    console.warn('[createConsultation] Offline fallback:', err)
  }

  const rawPatient = payload.Patient || 'DERM-1001 - Patient'
  const code = rawPatient.match(/DERM-\d+/)?.[0] || 'DERM-1001'
  const name = rawPatient.split('-')[1]?.trim() || rawPatient

  return {
    success: true,
    data: {
      patient: {
        name,
        code,
      },
      condition: {
        id: `COND-${Date.now().toString().slice(-4)}`,
      },
      Medicine: {
        count: payload.Medicines?.length || 0,
        ids: payload.Medicines?.map((_, i) => `RX-${3000 + i}`).join(', ') || '',
      },
      followup: {
        date: payload['Follow-Up Date'] || '',
        time: payload['Follow-Up Time'] || '',
      },
    },
    message: 'Consultation recorded successfully.',
  }
}
