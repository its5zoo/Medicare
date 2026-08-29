import { QueryClient } from '@tanstack/react-query'

export type SyncActionType =
  | 'REGISTER_PATIENT'
  | 'CREATE_CONSULTATION'
  | 'SCHEDULE_FOLLOW_UP'
  | 'RESCHEDULE_FOLLOW_UP'
  | 'COMPLETE_FOLLOW_UP'
  | 'CREATE_PRESCRIPTION'
  | 'UPDATE_PRESCRIPTION'
  | 'DISCONTINUE_PRESCRIPTION'

export type SyncTarget = 'dashboard' | 'patient'

export interface SyncSessionOptions<TResponse = unknown> {
  queryClient: QueryClient
  actionType: SyncActionType
  patientId?: string
  response: TResponse
}

export interface SyncSession {
  sessionId: string
  actionType: SyncActionType
  patientId?: string
  targets: SyncTarget[]
  abortController: AbortController
  baselineDashboardVersion?: string // generatedAt
  baselinePatientVersion?: string // snapshotGeneratedAt
}
