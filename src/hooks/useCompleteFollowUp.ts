import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { triggerPostWriteSync } from '@/services/postWriteSync'
import { useWorkflowTransaction } from '@/hooks/useWorkflowTransaction'
import { completeFollowUp } from '@/services/followUpApi'

export const COMPLETE_FOLLOW_UP_WORKFLOW_STEPS = [
  'Validating Details',
  'Marking as Complete',
  'Syncing Patient History',
  'Finalizing Update',
] as const

export function useCompleteFollowUp() {
  const transaction = useWorkflowTransaction()
  const queryClient = useQueryClient()

  const submit = useCallback(
    async (patientCode: string, patientName: string, followUpId: string, visitNotes?: string) => {
      await transaction.execute({
        steps: [...COMPLETE_FOLLOW_UP_WORKFLOW_STEPS],
        apiCall: () =>
          completeFollowUp({
            Patient: `${patientCode} - ${patientName}`,
            'Completion Status': 'Completed',
            ...(visitNotes ? { 'Visit Notes': visitNotes } : {}),
          }),
        buildSuccess: (data) => {
          triggerPostWriteSync({
            queryClient,
            actionType: 'COMPLETE_FOLLOW_UP',
            patientId: data.patient.code,
            response: { followUpId },
          })

          return {
            title: 'Follow-Up Completed Successfully',
            lines: [
              { label: 'Patient', value: data.patient.code },
              { label: 'Status', value: 'Completed' },
            ],
          }
        },
        buildLateNotification: (data) => ({
          title: 'Follow-Up Marked Complete',
          lines: [
            { label: 'Patient', value: data.patient.code },
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
