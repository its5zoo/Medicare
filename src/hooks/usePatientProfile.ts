import { useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError } from '@/api/client'
import { fetchPatient } from '@/api/patientApi'
import type {
  AddMedicineInput,
  DiscontinueReason,
  PatientProfileOverview,
  PatientProfileSnapshot,
  RescheduleFollowUpInput,
  UpdateMedicineInput,
  UpsertFollowUpInput,
} from '@/data/patientProfileTypes'
import { mapPatientApiResponse } from '@/lib/mapPatientApiResponse'
import { mockPatientProfileService } from '@/services/patientProfile/mockPatientProfileService'
import { triggerPostWriteSync } from '@/services/postWriteSync'

export const patientQueryKey = (patientId: string) => ['patient', patientId] as const

const PATIENT_QUERY_OPTIONS = {
  staleTime: 300_000,
  gcTime: 600_000,
  retry: 1,
  refetchOnWindowFocus: false,
} as const

export function prefetchPatient(queryClient: ReturnType<typeof useQueryClient>, patientId: string) {
  return queryClient.prefetchQuery({
    queryKey: patientQueryKey(patientId),
    queryFn: async () => {
      const data = await fetchPatient(patientId)
      const mapped = mapPatientApiResponse(data)
      const cached = queryClient.getQueryData<PatientProfileSnapshot>(patientQueryKey(patientId))

      if (cached?.optimisticCreatedAt && mapped.snapshotGeneratedAt) {
        const baseline = cached.snapshotGeneratedAt
        if (baseline && mapped.snapshotGeneratedAt <= baseline) {
          console.log('[prefetchPatient] Rejecting stale backend payload to protect optimistic state')
          return cached
        }
      }
      return mapped
    },
    ...PATIENT_QUERY_OPTIONS,
  })
}

export function usePatientProfile(patientId: string | undefined) {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: patientQueryKey(patientId ?? ''),
    queryFn: async () => {
      if (!patientId) throw new Error('Patient ID is required')
      const data = await fetchPatient(patientId)
      const mapped = mapPatientApiResponse(data)
      const cached = queryClient.getQueryData<PatientProfileSnapshot>(patientQueryKey(patientId))

      if (cached?.optimisticCreatedAt && mapped.snapshotGeneratedAt) {
        const baseline = cached.snapshotGeneratedAt
        if (baseline && mapped.snapshotGeneratedAt <= baseline) {
          console.log('[usePatientProfile] Rejecting stale backend payload to protect optimistic state')
          return cached
        }
      }
      return mapped
    },
    enabled: !!patientId,
    ...PATIENT_QUERY_OPTIONS,
  })

  const snapshot: PatientProfileSnapshot | null = query.data ?? null
  const overview: PatientProfileOverview | null = snapshot?.overview ?? null
  const patient = snapshot?.patient



  const isNotFoundOriginal = query.error instanceof ApiError && query.error.status === 404
  const hasOptimisticData = !!snapshot?.optimisticCreatedAt

  return {
    patient,
    snapshot,
    overview,
    loading: query.isLoading,
    isFetching: query.isFetching,
    error: hasOptimisticData && isNotFoundOriginal ? null : query.error,
    isError: hasOptimisticData && isNotFoundOriginal ? false : query.isError,
    isNotFound: hasOptimisticData ? false : isNotFoundOriginal,
    isNetworkError: query.error instanceof ApiError && query.error.status === 0,
    reload: query.refetch,
    addMedicine: async (input: AddMedicineInput) => {
      if (!patientId) return
      await mockPatientProfileService.addMedicine(patientId, input)
      triggerPostWriteSync({
        queryClient,
        actionType: 'CREATE_PRESCRIPTION',
        patientId,
        response: { input },
      })
    },
    updateMedicine: async (
      conditionId: string,
      medicineId: string,
      input: UpdateMedicineInput
    ) => {
      if (!patientId) return
      await mockPatientProfileService.updateMedicine(patientId, conditionId, medicineId, input)
      triggerPostWriteSync({
        queryClient,
        actionType: 'UPDATE_PRESCRIPTION',
        patientId,
        response: { conditionId, medicineId, input },
      })
    },
    discontinueMedicine: async (
      conditionId: string,
      medicineId: string,
      reason: DiscontinueReason
    ) => {
      if (!patientId) return
      await mockPatientProfileService.discontinueMedicine(
        patientId,
        conditionId,
        medicineId,
        reason
      )
      triggerPostWriteSync({
        queryClient,
        actionType: 'DISCONTINUE_PRESCRIPTION',
        patientId,
        response: { conditionId, medicineId, reason },
      })
    },
    addFollowUp: async (input: UpsertFollowUpInput) => {
      if (!patientId) return
      await mockPatientProfileService.upsertActiveFollowUp(patientId, input)
      triggerPostWriteSync({
        queryClient,
        actionType: 'SCHEDULE_FOLLOW_UP',
        patientId,
        response: { followup: { date: input.date, time: input.timeSlot } },
      })
    },
    completeFollowUp: async (followUpId: string) => {
      if (!patientId) return
      await mockPatientProfileService.completeFollowUp(patientId, followUpId)
      triggerPostWriteSync({
        queryClient,
        actionType: 'COMPLETE_FOLLOW_UP',
        patientId,
        response: { followUpId },
      })
    },
    rescheduleFollowUp: async (followUpId: string, input: RescheduleFollowUpInput) => {
      if (!patientId) return
      await mockPatientProfileService.rescheduleFollowUp(patientId, followUpId, input)
      triggerPostWriteSync({
        queryClient,
        actionType: 'RESCHEDULE_FOLLOW_UP',
        patientId,
        response: { followup: { date: input.date, time: input.timeSlot } },
      })
    },
  }
}
