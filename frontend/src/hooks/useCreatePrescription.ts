import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { triggerPostWriteSync } from '@/services/postWriteSync'
import type { AddMedicineInput } from '@/data/patientProfileTypes'
import { useWorkflowTransaction } from '@/hooks/useWorkflowTransaction'
import { createPrescription } from '@/services/prescriptionApi'

export const CREATE_PRESCRIPTION_WORKFLOW_STEPS = [
  'Validating Prescription',
  'Creating Medicine Record',
  'Syncing Patient History',
  'Finalizing Update',
] as const

export function useCreatePrescription() {
  const transaction = useWorkflowTransaction()
  const queryClient = useQueryClient()

  const submit = useCallback(
    async (patientCode: string, input: AddMedicineInput) => {
      await transaction.execute({
        steps: [...CREATE_PRESCRIPTION_WORKFLOW_STEPS],
        apiCall: () =>
          createPrescription({
            Patient_ID: patientCode,
            Condition_ID: input.conditionId,
            Medicine_Name: input.medicineName,
            Dosage: input.dosage || '',
            Timing: input.timing || [],
            Frequency: input.frequency || '',
            Start_Date: input.startDate,
            Duration_Days: input.durationDays,
            Instructions: input.instructions || '',
            Reminder_Active: 'Yes',
          }),
        buildSuccess: () => {
          triggerPostWriteSync({
            queryClient,
            actionType: 'CREATE_PRESCRIPTION',
            patientId: patientCode,
            response: { input },
          })

          return {
            title: 'Prescription Added Successfully',
            lines: [
              { label: 'Patient', value: patientCode },
              { label: 'Medicine', value: input.medicineName },
            ],
          }
        },
        buildLateNotification: () => ({
          title: 'Prescription Added',
          lines: [
            { label: 'Patient', value: patientCode },
            { label: 'Medicine', value: input.medicineName },
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
