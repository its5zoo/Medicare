import { apiClient } from './client'
import { searchPatients as mockSearchPatients } from '@/data/mockData'

export async function searchPatients(query: string) {
  try {
    const params = new URLSearchParams({ q: query })
    const response = await apiClient.get<{ success: boolean; data: unknown }>(
      `/search?${params.toString()}`
    )
    if (response && response.data) {
      return response.data
    }
  } catch (err) {
    console.warn('[searchPatients] Backend unreachable, using fallback search:', err)
  }

  const results = mockSearchPatients(query)
  return results.map((p) => ({
    patientId: p.id,
    fullName: p.name,
    displayName: p.name,
    phone: p.phone,
    doctor: 'Dr. Priya Sharma',
    status: p.status,
    gender: p.gender,
    age: p.age,
    registrationDate: p.registrationDate,
    searchText: `${p.id} ${p.name} ${p.phone} ${p.status}`.toLowerCase(),
  }))
}

