import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchDashboard } from '@/api/dashboardApi'
import type { DashboardData } from '@/api/types'

export const DASHBOARD_QUERY_KEY = ['dashboard'] as const

export function useDashboard() {
  const queryClient = useQueryClient()

  return useQuery({
    queryKey: DASHBOARD_QUERY_KEY,
    queryFn: async () => {
      const fetched = await fetchDashboard()
      const cached = queryClient.getQueryData<DashboardData>(DASHBOARD_QUERY_KEY)

      if (cached?.optimisticCreatedAt && fetched.generatedAt) {
        const baseline = cached.generatedAt
        // Reject stale backend payloads if they are not newer than our baseline
        if (baseline && fetched.generatedAt <= baseline) {
          console.log('[useDashboard] Rejecting stale backend payload to protect optimistic state')
          return cached
        }
      }

      return fetched
    },
    staleTime: 30000,
    refetchOnWindowFocus: false,
    retry: 1,
  })
}
