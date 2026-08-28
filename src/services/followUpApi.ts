import { apiPost } from './api'

export interface ManualFollowUpRequest {
  Patient: string
  'Follow-Up Date': string
  'Follow-Up Time': string
  'Follow-Up Reason'?: string
  'Clinic Notes'?: string
}

export interface ManualFollowUpResponseData {
  patient: {
    code: string
    name: string
  }
  followup: {
    date: string
    time: string
    status?: string
  }
}

export function createManualFollowUp(payload: ManualFollowUpRequest) {
  return apiPost<ManualFollowUpResponseData>('/followups/manual', payload)
}

export interface RescheduleFollowUpRequest {
  Patient: string
  'Reschedule Follow-Up Date': string
  'Follow-Up Time': string
  'Reschedule Reason': string
}

export function rescheduleFollowUp(payload: RescheduleFollowUpRequest) {
  return apiPost<ManualFollowUpResponseData>('/followups/reschedule', payload)
}

export interface CompleteFollowUpRequest {
  Patient: string
  'Completion Status': string
  'Visit Notes'?: string
}

export function completeFollowUp(payload: CompleteFollowUpRequest) {
  return apiPost<ManualFollowUpResponseData>('/followups/complete', payload)
}
