import { apiPost } from './api'

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
  // Empty data as the payload success doesn't specify data shape
  [key: string]: unknown
}

export function createPrescription(payload: PrescriptionCreateRequest) {
  return apiPost<PrescriptionResponseData>('/prescriptions/create', payload)
}

export function updatePrescription(payload: PrescriptionUpdateRequest) {
  return apiPost<PrescriptionResponseData>('/prescriptions/update', payload)
}

export function discontinuePrescription(payload: PrescriptionDiscontinueRequest) {
  return apiPost<PrescriptionResponseData>('/prescriptions/discontinue', payload)
}
