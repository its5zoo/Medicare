import type { QueryClient } from '@tanstack/react-query'
import type { SyncSession } from './types'
import { checkDashboardFreshness, checkPatientFreshness } from './freshnessComparators'
import { removeSession } from './sessionManager'

// Target absolute polling seconds
const POLLING_INTERVALS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 14, 16, 18, 20, 22, 24, 26, 28, 30]

export function startPollingEngine(queryClient: QueryClient, session: SyncSession) {
  const { signal } = session.abortController

  const dashboardSyncRequired = session.targets.includes('dashboard')
  const patientSyncRequired = session.targets.includes('patient')

  let dashboardResolved = !dashboardSyncRequired
  let patientResolved = !patientSyncRequired

  const runInterval = async (index: number) => {
    if (signal.aborted) return

    if (!dashboardResolved && dashboardSyncRequired) {
      const fresh = await checkDashboardFreshness(queryClient, session.baselineDashboardVersion)
      if (fresh) dashboardResolved = true
    }

    if (!patientResolved && patientSyncRequired && session.patientId) {
      const fresh = await checkPatientFreshness(
        queryClient,
        session.patientId,
        session.baselinePatientVersion
      )
      if (fresh) {
        patientResolved = true
      }
    }

    if (dashboardResolved && patientResolved) {
      removeSession(session, 'SUCCESS')
      return
    }

    const nextIndex = index + 1
    if (nextIndex >= POLLING_INTERVALS.length) {
      removeSession(session, 'EXPIRED')
      return
    }

    const delayMs = (POLLING_INTERVALS[nextIndex] - POLLING_INTERVALS[index]) * 1000
    setTimeout(() => {
      if (!signal.aborted) {
        runInterval(nextIndex)
      }
    }, delayMs)
  }

  // Start immediately at 0s
  runInterval(0)
}
