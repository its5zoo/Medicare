import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { triggerPostWriteSync } from '@/services/postWriteSync'
import type { RescheduleFollowUpInput } from '@/data/patientProfileTypes'
import { useWorkflowTransaction } from '@/hooks/useWorkflowTransaction'
import { rescheduleFollowUp } from '@/services/followUpApi'

export const RESCHEDULE_FOLLOW_UP_WORKFLOW_STEPS = [
  'Validating Update',
  'Rescheduling Follow-Up',
  'Syncing Timelines',
  'Finalizing Update',
] as const

export function useRescheduleFollowUp() {
  const transaction = useWorkflowTransaction()
  const queryClient = useQueryClient()

  const submit = useCallback(
    async (patientCode: string, patientName: string, input: RescheduleFollowUpInput) => {
      await transaction.execute({
        steps: [...RESCHEDULE_FOLLOW_UP_WORKFLOW_STEPS],
        apiCall: () =>
          rescheduleFollowUp({
            Patient: `${patientCode} - ${patientName}`,
            'Reschedule Follow-Up Date': input.date,
            'Follow-Up Time': input.timeSlot,
            'Reschedule Reason': input.reason,
          }),
        buildSuccess: (data) => {
          try {
            console.log('[TRACE D/E] buildSuccess called. data:', JSON.stringify(data))
            triggerPostWriteSync({
              queryClient,
              actionType: 'RESCHEDULE_FOLLOW_UP',
              patientId: data.patient.code,
              response: {
                followup: {
                  date: input.date,
                  time: input.timeSlot,
                },
              },
            })

            const formattedDate = new Date(input.date).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
            
            return {
              title: 'Follow-Up Rescheduled Successfully',
              lines: [
                { label: 'Patient', value: data.patient.code },
                { label: 'Date', value: formattedDate },
                { label: 'Time', value: input.timeSlot },
              ],
            }
          } catch (err) {
            console.error('[TRACE D/E] buildSuccess CRASHED:', err)
            console.error('[TRACE D/E] data was:', data)
            throw err
          }
        },
        buildLateNotification: (data) => ({
          title: 'Follow-Up Reschedule Completed',
          lines: [
            { label: 'Patient', value: data.patient.code },
            { label: 'Date', value: input.date },
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
