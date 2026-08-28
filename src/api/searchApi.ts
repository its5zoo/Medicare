import { apiClient } from './client'

export async function searchPatients(query: string) {
  const params = new URLSearchParams({ q: query })
  const response = await apiClient.get<{ success: boolean; data: unknown }>(
    `/search?${params.toString()}`
  )
  return response.data
}
