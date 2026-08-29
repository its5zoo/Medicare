import { apiPost } from '@/services/api'

export interface RegistrationRequest {
  'Full Name': string
  Age: number
  Gender: string
  'Whatsapp Number': string
  Address: string
  'Doctor Name': string
}

export interface RegistrationResponseData {
  patient: {
    name: string
    code: string
  }
  doctor: {
    name: string
  }
  whatsapp: {
    sent: boolean
  }
}

export async function registerPatient(payload: RegistrationRequest) {
  return apiPost<RegistrationResponseData>('/patients/register', payload)
}
