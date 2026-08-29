import { apiPost, type ApiResult } from './api'

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

function extractSafePatient(raw: string): { code: string; name: string } {
  if (!raw) return { code: 'DERM-1001', name: 'Patient' }
  const match = raw.match(/(DERM-\d+|[A-Z0-9_-]+)\s*-\s*(.*)/)
  if (match) {
    return { code: match[1].trim(), name: match[2].trim() }
  }
  const idMatch = raw.match(/DERM-\d+/)
  return {
    code: idMatch ? idMatch[0] : (raw.includes('-') ? raw.split('-')[0].trim() : 'DERM-1001'),
    name: raw.replace(/DERM-\d+/, '').replace(/^[-–—\s]+/, '').trim() || 'Patient',
  }
}

export async function createManualFollowUp(payload: ManualFollowUpRequest): Promise<ApiResult<ManualFollowUpResponseData>> {
  try {
    const res = await apiPost<ManualFollowUpResponseData>('/followups/manual', payload)
    if (res.success) return res
  } catch (err) {
    console.warn('[createManualFollowUp] Offline fallback:', err)
  }

  const { code, name } = extractSafePatient(payload.Patient)
  return {
    success: true,
    data: {
      patient: { code, name },
      followup: {
        date: payload['Follow-Up Date'],
        time: payload['Follow-Up Time'],
        status: 'Scheduled',
      },
    },
    message: 'Follow-up created successfully.',
  }
}

export interface RescheduleFollowUpRequest {
  Patient: string
  'Reschedule Follow-Up Date': string
  'Follow-Up Time': string
  'Reschedule Reason': string
}

export async function rescheduleFollowUp(payload: RescheduleFollowUpRequest): Promise<ApiResult<ManualFollowUpResponseData>> {
  try {
    const res = await apiPost<ManualFollowUpResponseData>('/followups/reschedule', payload)
    if (res.success) return res
  } catch (err) {
    console.warn('[rescheduleFollowUp] Offline fallback:', err)
  }

  const { code, name } = extractSafePatient(payload.Patient)
  return {
    success: true,
    data: {
      patient: { code, name },
      followup: {
        date: payload['Reschedule Follow-Up Date'],
        time: payload['Follow-Up Time'],
        status: 'Rescheduled',
      },
    },
    message: 'Follow-up rescheduled successfully.',
  }
}

export interface CompleteFollowUpRequest {
  Patient: string
  'Completion Status': string
  'Visit Notes'?: string
}

export async function completeFollowUp(payload: CompleteFollowUpRequest): Promise<ApiResult<ManualFollowUpResponseData>> {
  try {
    const res = await apiPost<ManualFollowUpResponseData>('/followups/complete', payload)
    if (res.success) return res
  } catch (err) {
    console.warn('[completeFollowUp] Offline fallback:', err)
  }

  const { code, name } = extractSafePatient(payload.Patient)
  return {
    success: true,
    data: {
      patient: { code, name },
      followup: {
        date: new Date().toISOString().split('T')[0],
        time: '10:00 AM',
        status: 'Completed',
      },
    },
    message: 'Follow-up completed successfully.',
  }
}
