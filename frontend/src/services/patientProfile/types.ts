import type {
  PatientProfileBundle,
  PatientProfileSnapshot,
  AddMedicineInput,
  UpdateMedicineInput,
  UpsertFollowUpInput,
  RescheduleFollowUpInput,
  DiscontinueReason,
} from '@/data/patientProfileTypes'

export type { PatientProfileSnapshot }

/** Contract for future Airtable / n8n integration. */
export interface IPatientProfileService {
  getBundle(patientId: string): Promise<PatientProfileBundle | null>
  addMedicine(patientId: string, input: AddMedicineInput): Promise<PatientProfileBundle>
  updateMedicine(
    patientId: string,
    conditionId: string,
    medicineId: string,
    input: UpdateMedicineInput
  ): Promise<PatientProfileBundle>
  discontinueMedicine(
    patientId: string,
    conditionId: string,
    medicineId: string,
    reason: DiscontinueReason
  ): Promise<PatientProfileBundle>
  upsertActiveFollowUp(
    patientId: string,
    input: UpsertFollowUpInput
  ): Promise<PatientProfileBundle>
  completeFollowUp(patientId: string, followUpId: string): Promise<PatientProfileBundle>
  rescheduleFollowUp(
    patientId: string,
    followUpId: string,
    input: RescheduleFollowUpInput
  ): Promise<PatientProfileBundle>
}
