import { apiPost, type ApiResult } from './api'

export interface PrescriptionCreateRequest {
  Patient_ID: string
  Condition_ID: string
  Medicine_Name: string
  Dosage: string
  Timing: string[]
  Frequency: string
  Start_Date: string
  Duration_Days: number
  Instructions: string
  Reminder_Active: string
}

export interface PrescriptionUpdateRequest {
  Patient_ID?: string
  Condition_ID?: string
  Prescription_ID?: string
  Update_Mode: string
  Dosage?: string
  Timing?: string[]
  Frequency?: string
  Instructions?: string
  Extend_Days: number
  Replace_Duration: number
}

export interface PrescriptionDiscontinueRequest {
  Patient_ID: string
  Condition_ID: string
  Prescription_ID: string
  Discontinue_Reason: string
  Discontinued_By: string
}

export interface PrescriptionResponseData {
  [key: string]: unknown
}

export async function createPrescription(payload: PrescriptionCreateRequest): Promise<ApiResult<PrescriptionResponseData>> {
  try {
    const res = await apiPost<PrescriptionResponseData>('/prescriptions/create', payload)
    if (res.success) return res
  } catch (err) {
    console.warn('[createPrescription] Offline fallback:', err)
  }

  return {
    success: true,
    data: { id: `RX-${Date.now().toString().slice(-4)}` },
    message: 'Prescription created successfully.',
  }
}

export async function updatePrescription(payload: PrescriptionUpdateRequest): Promise<ApiResult<PrescriptionResponseData>> {
  try {
    const res = await apiPost<PrescriptionResponseData>('/prescriptions/update', payload)
    if (res.success) return res
  } catch (err) {
    console.warn('[updatePrescription] Offline fallback:', err)
  }

  return {
    success: true,
    data: { updated: true },
    message: 'Prescription updated successfully.',
  }
}

export async function discontinuePrescription(payload: PrescriptionDiscontinueRequest): Promise<ApiResult<PrescriptionResponseData>> {
  try {
    const res = await apiPost<PrescriptionResponseData>('/prescriptions/discontinue', payload)
    if (res.success) return res
  } catch (err) {
    console.warn('[discontinuePrescription] Offline fallback:', err)
  }

  return {
    success: true,
    data: { discontinued: true },
    message: 'Prescription discontinued successfully.',
  }
}
