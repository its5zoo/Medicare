import type { SyncSession, SyncSessionOptions } from './types'
import { getSyncTargetsForAction } from './syncStrategyMap'
import { registerSession } from './sessionManager'
import { applyOptimisticOverride } from './actionUpdaters'
import { startPollingEngine } from './pollingEngine'
import type { DashboardData } from '@/api/types'
import type { PatientProfileSnapshot } from '@/data/patientProfileTypes'

export function triggerPostWriteSync<TResponse>(options: SyncSessionOptions<TResponse>): () => void {
  const { queryClient, actionType, patientId, response } = options


  // Baseline resolution directly from current cache state
  let baselineDashboardVersion: string | undefined
  let baselinePatientVersion: string | undefined

  const targets = getSyncTargetsForAction(actionType)

  if (targets.includes('dashboard')) {
    const dashboard = queryClient.getQueryData<DashboardData>(['dashboard'])
    baselineDashboardVersion = dashboard?.generatedAt
  }

  if (targets.includes('patient') && patientId) {
    const patient = queryClient.getQueryData<PatientProfileSnapshot>(['patient', patientId])
    baselinePatientVersion = patient?.snapshotGeneratedAt

  }

  const session: SyncSession = {
    sessionId: crypto.randomUUID(),
    actionType,
    patientId,
    targets,
    abortController: new AbortController(),
    baselineDashboardVersion,
    baselinePatientVersion
  }

  // Registers session and automatically aborts any existing overlapping polling loop
  const cleanup = registerSession(session)

  // Immediate UI Override
  applyOptimisticOverride(queryClient, actionType, patientId, response)

  // Fire and forget polling engine
  if (targets.length > 0) {
    startPollingEngine(queryClient, session)
  } else {
    session.abortController.abort('NO_TARGETS')
  }

  return cleanup
}
