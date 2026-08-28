import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { triggerPostWriteSync } from '@/services/postWriteSync'
import type { DiscontinueReason } from '@/data/patientProfileTypes'
import { useWorkflowTransaction } from '@/hooks/useWorkflowTransaction'
import { discontinuePrescription } from '@/services/prescriptionApi'

export const DISCONTINUE_PRESCRIPTION_WORKFLOW_STEPS = [
  'Validating Action',
  'Discontinuing Prescription',
  'Syncing Patient History',
  'Finalizing Update',
] as const

export function useDiscontinuePrescription() {
  const transaction = useWorkflowTransaction()
  const queryClient = useQueryClient()

  const submit = useCallback(
    async (patientCode: string, conditionId: string, medicineId: string, reason: DiscontinueReason) => {
      await transaction.execute({
        steps: [...DISCONTINUE_PRESCRIPTION_WORKFLOW_STEPS],
        apiCall: () =>
          discontinuePrescription({
            Patient_ID: patientCode,
            Condition_ID: conditionId,
            Prescription_ID: medicineId,
            Discontinue_Reason: reason,
            Discontinued_By: 'MANAGER',
          }),
        buildSuccess: () => {
          triggerPostWriteSync({
            queryClient,
            actionType: 'DISCONTINUE_PRESCRIPTION',
            patientId: patientCode,
            response: { conditionId, medicineId, reason },
          })

          return {
            title: 'Prescription Discontinued',
            lines: [
              { label: 'Patient', value: patientCode },
              { label: 'Reason', value: reason },
            ],
          }
        },
        buildLateNotification: () => ({
          title: 'Prescription Discontinued',
          lines: [
            { label: 'Patient', value: patientCode },
            { label: 'Reason', value: reason },
          ],
        }),
      })
    },
    [transaction, queryClient]
  )

  return {
    ...transaction,
    submit,
  }
}
