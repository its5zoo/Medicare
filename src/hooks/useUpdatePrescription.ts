import { useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { triggerPostWriteSync } from '@/services/postWriteSync'
import type { UpdateMedicineInput } from '@/data/patientProfileTypes'
import { useWorkflowTransaction } from '@/hooks/useWorkflowTransaction'
import { updatePrescription } from '@/services/prescriptionApi'

export const UPDATE_PRESCRIPTION_WORKFLOW_STEPS = [
  'Validating Update',
  'Modifying Prescription',
  'Syncing Patient History',
  'Finalizing Update',
] as const

export function useUpdatePrescription() {
  const transaction = useWorkflowTransaction()
  const queryClient = useQueryClient()

  const submit = useCallback(
    async (patientCode: string, conditionId: string, medicineId: string, input: UpdateMedicineInput) => {
      // Map update modes
      let extendDays = 0
      let replaceDuration = 0
      let updateMode = ''

      if (input.updateMode === 'Extend' && input.extendDays) {
        extendDays = input.extendDays
        updateMode = 'Extend'
      } else if (input.updateMode === 'Replace_Current' && input.replaceDurationDays) {
        replaceDuration = input.replaceDurationDays
        updateMode = 'Replace_Current'
      }

      await transaction.execute({
        steps: [...UPDATE_PRESCRIPTION_WORKFLOW_STEPS],
        apiCall: () =>
          updatePrescription({
            Patient_ID: patientCode,
            Condition_ID: conditionId,
            Prescription_ID: medicineId,
            Update_Mode: updateMode,
            Dosage: input.dosage || '',
            Timing: input.timing || [],
            Frequency: input.frequency || '',
            Instructions: input.instructions || '',
            Extend_Days: extendDays,
            Replace_Duration: replaceDuration,
          }),
        buildSuccess: () => {
          triggerPostWriteSync({
            queryClient,
            actionType: 'UPDATE_PRESCRIPTION',
            patientId: patientCode,
            response: { conditionId, medicineId, input },
          })

          return {
            title: 'Prescription Updated Successfully',
            lines: [
              { label: 'Patient', value: patientCode },
              { label: 'Mode', value: updateMode || 'Details Only' },
            ],
          }
        },
        buildLateNotification: () => ({
          title: 'Prescription Updated',
          lines: [
            { label: 'Patient', value: patientCode },
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
