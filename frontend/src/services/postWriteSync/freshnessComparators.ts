import type { QueryClient } from '@tanstack/react-query'
import { fetchDashboard } from '@/api/dashboardApi'
import { fetchPatient } from '@/api/patientApi'
import { mapPatientApiResponse } from '@/lib/mapPatientApiResponse'

// ---------------------------------------------------------------------------
// BUG 2 FIX: Use strict > comparison so stale snapshots never overwrite
//            optimistic data.
// BUG 5 FIX: Pipe fetchPatient through mapPatientApiResponse before writing
//            to cache so React Query subscribers see the correct shape and
//            re-render automatically.
// ---------------------------------------------------------------------------

export async function checkDashboardFreshness(
  queryClient: QueryClient,
  baselineGeneratedAt: string | undefined
): Promise<boolean> {
  try {
    const dashboard = await fetchDashboard()
    const isNewer = baselineGeneratedAt
      ? (dashboard.generatedAt && dashboard.generatedAt > baselineGeneratedAt)
      : !!dashboard.generatedAt

    if (isNewer) {
      queryClient.setQueryData(['dashboard'], dashboard)
      return true
    }
  } catch (error) {
    console.error('[PostWriteSync] Failed to fetch dashboard', error)
  }
  return false
}

export async function checkPatientFreshness(
  queryClient: QueryClient,
  patientId: string,
  baselineSnapshotGeneratedAt: string | undefined
): Promise<boolean> {
  try {
    const raw = await fetchPatient(patientId)
    const isNewer = baselineSnapshotGeneratedAt
      ? (raw.snapshotGeneratedAt && raw.snapshotGeneratedAt > baselineSnapshotGeneratedAt)
      : !!raw.snapshotGeneratedAt


    if (isNewer) {
      // Map through the same transform used by usePatientProfile so
      // the cache holds a PatientProfileSnapshot, not raw PatientApiResponse
      const mapped = mapPatientApiResponse(raw)
      queryClient.setQueryData(['patient', patientId], mapped)
      return true
    }
  } catch (error) {
    console.error(`[PostWriteSync] Failed to fetch patient ${patientId}`, error)
  }
  return false
}
