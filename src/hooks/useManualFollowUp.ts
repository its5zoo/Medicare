import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { triggerPostWriteSync } from '@/services/postWriteSync'
import type { UpsertFollowUpInput } from '@/data/patientProfileTypes'
import type { Patient } from '@/data/types'
import { useWorkflowTransaction } from '@/hooks/useWorkflowTransaction'
import { createManualFollowUp } from '@/services/followUpApi'

export const MANUAL_FOLLOW_UP_WORKFLOW_STEPS = [
  'Validating Follow-Up',
  'Updating Schedule',
  'Syncing Patient Timeline',
  'Finalizing Follow-Up',
] as const

export function useManualFollowUp() {
  const transaction = useWorkflowTransaction()
  const queryClient = useQueryClient()


  const submit = useCallback(
    async (patient: Patient, input: UpsertFollowUpInput) => {
      await transaction.execute({
        steps: [...MANUAL_FOLLOW_UP_WORKFLOW_STEPS],
        apiCall: () =>
          createManualFollowUp({
            Patient: `${patient.id} - ${patient.name}`,
            'Follow-Up Date': input.date,
            'Follow-Up Time': input.timeSlot,
            'Follow-Up Reason': input.reason,
            'Clinic Notes': input.clinicNotes,
          }),
        buildSuccess: (data) => {
          triggerPostWriteSync({
            queryClient,
            actionType: 'SCHEDULE_FOLLOW_UP',
            patientId: data.patient.code,
            response: data,
          })

          const formattedDate = new Date(data.followup.date).toLocaleDateString('en-GB', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
          })
          
          return {
            title: 'Follow-Up Updated Successfully',
            lines: [
              { label: 'Patient', value: data.patient.code },
              { label: 'Patient Name', value: data.patient.name },
              { label: 'Follow-Up Date', value: formattedDate },
              { label: 'Follow-Up Time', value: data.followup.time },
            ],
          }
        },
        buildLateNotification: (data) => ({
          title: 'Recent Follow-Up Scheduled',
          lines: [
            { label: 'Patient', value: data.patient.code },
            { label: 'Date', value: data.followup.date },
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
