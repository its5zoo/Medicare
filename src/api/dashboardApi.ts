import { apiClient } from './client'
import type { ApiResponse, DashboardData } from './types'

export async function fetchDashboard(): Promise<DashboardData> {
  const response = await apiClient.get<ApiResponse<DashboardData>>('/dashboard')
  return response.data
}
