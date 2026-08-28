import { ApiError, API_BASE_URL } from './client'
import type { PatientApiResponse } from './patientTypes'
import { apiClient } from '@/lib/apiClient'

export async function fetchPatient(patientId: string): Promise<PatientApiResponse> {
  let response: Response

  try {
    response = await apiClient(`${API_BASE_URL}/patient/${encodeURIComponent(patientId)}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })
  } catch {
    throw new ApiError('Network request failed', 0)
  }

  if (!response.ok) {
    throw new ApiError(`Request failed: ${response.statusText}`, response.status)
  }

  let json: PatientApiResponse
  try {
    json = await response.json()
  } catch {
    throw new ApiError('Invalid response from server', response.status)
  }

  if (!json.patientId || !json.patient) {
    throw new ApiError('Invalid patient data', 500)
  }

  return json
}
