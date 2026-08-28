import type { QueryClient } from '@tanstack/react-query'
import type { DashboardData, PatientSearchIndexItem } from '@/api/types'
import type {
  PatientProfileSnapshot,
  PatientFollowUpRecord,
  PatientCondition,
  PatientTimelineEvent,
  ConditionMedicine,
  AddMedicineInput,
  UpdateMedicineInput,
  DiscontinueReason,
} from '@/data/patientProfileTypes'
import type { ConsultationMedicineDraft } from '@/components/consultation/types'
import type { Patient } from '@/data/types'
import type { SyncActionType } from './types'

export interface RegistrationFormContext {
  fullName: string
  age: string
  gender: string
  whatsapp: string
  address: string
  doctorName: string
}

export function applyOptimisticOverride(
  queryClient: QueryClient,
  actionType: SyncActionType,
  patientId: string | undefined,
  response: unknown
) {
  switch (actionType) {
    case 'REGISTER_PATIENT':
      updateRegistrationCache(queryClient, response)
      break
    case 'CREATE_CONSULTATION':
      if (patientId) updateConsultationCache(queryClient, patientId, response)
      break
    case 'SCHEDULE_FOLLOW_UP':
    case 'RESCHEDULE_FOLLOW_UP':
      if (patientId) updateFollowUpCache(queryClient, patientId, response, actionType)
      break
    case 'COMPLETE_FOLLOW_UP':
      if (patientId) updateCompleteFollowUpCache(queryClient, patientId, response)
      break
    case 'CREATE_PRESCRIPTION':
      if (patientId) updateMedicineCache(queryClient, patientId, response, 'CREATE_PRESCRIPTION')
      break
    case 'UPDATE_PRESCRIPTION':
      if (patientId) updateMedicineCache(queryClient, patientId, response, 'UPDATE_PRESCRIPTION')
      break
    case 'DISCONTINUE_PRESCRIPTION':
      if (patientId) updateMedicineCache(queryClient, patientId, response, 'DISCONTINUE_PRESCRIPTION')
      break
  }
}

// ---------------------------------------------------------------------------
// Helper: Create Timeline Event
// ---------------------------------------------------------------------------
function createTimelineEvent(
  patientId: string,
  type: PatientTimelineEvent['type'],
  title: string,
  description: string
): PatientTimelineEvent {
  return {
    id: `temp-timeline-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    patientId,
    type,
    title,
    description,
    timestamp: new Date().toISOString(),
  }
}

// ---------------------------------------------------------------------------
// REGISTRATION (BUG 1 & 5 FIX)
// ---------------------------------------------------------------------------
function updateRegistrationCache(queryClient: QueryClient, response: unknown) {
  const res = response as {
    patient?: { code: string; name: string }
    formContext?: RegistrationFormContext
  }

  const patient = res?.patient
  const form = res?.formContext
  if (!patient || !patient.code) return

  const now = Date.now()

  queryClient.setQueryData(['dashboard'], (oldData: DashboardData | undefined) => {
    if (!oldData) return oldData
    const newData = { ...oldData, optimisticCreatedAt: now }

    if (newData.cards) {
      newData.cards = { ...newData.cards, totalPatients: newData.cards.totalPatients + 1 }
    }

    if (newData.patientSearchIndex) {
      const newPatient: PatientSearchIndexItem = {
        patientId: patient.code,
        fullName: patient.name,
        displayName: patient.name,
        phone: form?.whatsapp ?? '',
        doctor: form?.doctorName ?? '',
        status: 'Registered',
        gender: form?.gender ?? '',
        age: parseInt(form?.age ?? '0', 10),
        registrationDate: new Date().toISOString().split('T')[0],
        searchText: `${patient.code} ${patient.name}`.toLowerCase(),
      }
      newData.patientSearchIndex = [newPatient, ...newData.patientSearchIndex]
    }
    return newData
  })

  // BUG 1 FIX: Write complete PatientProfileSnapshot to prevent 404 cache miss
  const optimisticPatient: Patient = {
    id: patient.code,
    name: patient.name,
    age: parseInt(form?.age ?? '0', 10),
    gender: (form?.gender as Patient['gender']) ?? 'Other',
    phone: form?.whatsapp ?? '',
    whatsapp: form?.whatsapp ?? '',
    address: form?.address ?? '',
    doctorId: '',
    registrationDate: new Date().toISOString().split('T')[0],
    status: 'Registered',
  }

  const optimisticProfile: PatientProfileSnapshot = {
    patient: optimisticPatient,
    overview: {
      patient: optimisticPatient,
      doctorName: form?.doctorName ?? '',
      lastVisitDate: null,
      activeConditionsCount: 0,
      activeMedicinesCount: 0,
      activeFollowUp: null,
      activeFollowUpStatusLabel: 'None scheduled',
      nextFollowUpDateLabel: '-',
      treatmentJourney: [
        { key: 'registered', label: 'Registered', completed: true },
        { key: 'consultation', label: 'Consultation Completed', completed: false },
        { key: 'prescription', label: 'Prescription Active', completed: false },
        { key: 'followup', label: 'Follow-Up Pending', completed: false },
      ],
    },
    conditions: [],
    activeFollowup: null,
    followupHistory: [],
    timeline: [
      createTimelineEvent(patient.code, 'patient_registered', 'Patient Registered', 'Registration completed successfully.'),
    ],
    optimisticCreatedAt: now,
  }

  queryClient.setQueryData(['patient', patient.code], optimisticProfile)
}

// ---------------------------------------------------------------------------
// CONSULTATION (BUG 4 & 5 FIX)
// ---------------------------------------------------------------------------
function updateConsultationCache(
  queryClient: QueryClient,
  patientId: string,
  response: unknown
) {
  const res = response as {
    condition?: { id: string }
    followup?: { date: string; time: string }
    skinProblem?: string
    infectionType?: string
    diagnosisDate?: string
    Medicine?: { count: number; ids: string }
    medicines?: ConsultationMedicineDraft[]
  }

  queryClient.setQueryData(
    ['patient', patientId],
    (oldData: PatientProfileSnapshot | undefined) => {
      if (!oldData) {
        return oldData
      }
      const newData: PatientProfileSnapshot = { ...oldData, optimisticCreatedAt: Date.now() }

      let conditionName = 'New Condition'

      // Map consultation medicine drafts into the ConditionMedicine UI model
      const conditionMedicines: ConditionMedicine[] = (res.medicines ?? []).map((draft, idx) => ({
        id: `temp-med-${Date.now()}-${idx}`,
        conditionId: res.condition?.id ?? '',
        medicineName: draft.medicineName,
        dosage: draft.dosage,
        timing: draft.timing,
        frequency: draft.frequency,
        startDate: draft.startDate,
        durationDays: draft.durationDays,
        instructions: draft.instructions,
        status: 'Active' as const,
      }))

      if (res?.condition?.id) {
        conditionName = res.skinProblem ?? 'New Condition'
        const newCondition: PatientCondition = {
          id: res.condition.id,
          patientId,
          conditionName,
          infectionType: res.infectionType ?? 'Unknown',
          diagnosisDate: res.diagnosisDate ?? new Date().toISOString().split('T')[0],
          status: 'Active',
          medicines: conditionMedicines,
        }
        newData.conditions = [newCondition, ...newData.conditions]

        newData.overview = {
          ...newData.overview,
          activeConditionsCount: newData.overview.activeConditionsCount + 1,
          activeMedicinesCount: newData.overview.activeMedicinesCount + conditionMedicines.length,
          treatmentJourney: newData.overview.treatmentJourney.map((step) =>
            step.key === 'consultation' ? { ...step, completed: true } : step
          ),
        }
      }

      if (res?.Medicine?.count && res.Medicine.count > 0) {
        newData.overview = {
          ...newData.overview,
          treatmentJourney: newData.overview.treatmentJourney.map((step) =>
            step.key === 'prescription' ? { ...step, completed: true } : step
          ),
        }
      }

      if (res?.followup?.date) {
        const newFollowUp: PatientFollowUpRecord = {
          id: 'temp-followup-' + Date.now(),
          patientId,
          date: res.followup.date,
          timeSlot: mapTimeSlot(res.followup.time),
          status: 'Scheduled',
          source: 'Consultation',
        }
        newData.activeFollowup = newFollowUp
        newData.overview = {
          ...newData.overview,
          activeFollowUp: newFollowUp,
          activeFollowUpStatusLabel: 'Scheduled',
          nextFollowUpDateLabel: res.followup.date,
          treatmentJourney: newData.overview.treatmentJourney.map((step) =>
            step.key === 'followup' ? { ...step, completed: true } : step
          ),
        }
      }

      newData.timeline = [
        createTimelineEvent(patientId, 'consultation_completed', 'Consultation Completed', `Diagnosed with ${conditionName}`),
        ...newData.timeline,
      ]

      return newData
    }
  )
}

// ---------------------------------------------------------------------------
// FOLLOW-UP (BUG 3 & 5 FIX)
// ---------------------------------------------------------------------------
function updateFollowUpCache(
  queryClient: QueryClient,
  patientId: string,
  response: unknown,
  actionType: 'SCHEDULE_FOLLOW_UP' | 'RESCHEDULE_FOLLOW_UP'
) {
  const res = response as {
    followup?: { date: string; time: string }
  }

  const followup = res?.followup
  if (!followup?.date) return

  queryClient.setQueryData(
    ['patient', patientId],
    (oldData: PatientProfileSnapshot | undefined) => {
      if (!oldData) return oldData
      const newData: PatientProfileSnapshot = { ...oldData, optimisticCreatedAt: Date.now() }

      const newFollowUp: PatientFollowUpRecord = {
        id: 'temp-followup-' + Date.now(),
        patientId,
        date: followup.date,
        timeSlot: mapTimeSlot(followup.time),
        status: actionType === 'RESCHEDULE_FOLLOW_UP' ? 'Rescheduled' : 'Scheduled',
        source: 'Manual',
      }

      if (newData.activeFollowup) {
        newData.followupHistory = [
          {
            id: newData.activeFollowup.id,
            date: newData.activeFollowup.date,
            title: 'Follow-Up Superseded',
            status: 'Superseded',
            description: newData.activeFollowup.timeSlot,
          },
          ...newData.followupHistory,
        ]
      }

      newData.activeFollowup = newFollowUp

      newData.overview = {
        ...newData.overview,
        activeFollowUp: newFollowUp,
        activeFollowUpStatusLabel: actionType === 'RESCHEDULE_FOLLOW_UP' ? 'Rescheduled' : 'Scheduled',
        nextFollowUpDateLabel: followup.date,
      }

      const timelineType = actionType === 'RESCHEDULE_FOLLOW_UP' ? 'follow_up_rescheduled' : 'follow_up_scheduled'
      const timelineTitle = actionType === 'RESCHEDULE_FOLLOW_UP' ? 'Follow-Up Rescheduled' : 'Follow-Up Scheduled'
      newData.timeline = [
        createTimelineEvent(patientId, timelineType, timelineTitle, `Scheduled for ${followup.date} (${newFollowUp.timeSlot})`),
        ...newData.timeline,
      ]

      return newData
    }
  )

  // BUG 5 FIX: Optimistically remove from dashboard today's followups
  if (actionType === 'RESCHEDULE_FOLLOW_UP') {
    queryClient.setQueryData(['dashboard'], (oldDash: DashboardData | undefined) => {
      if (!oldDash) return oldDash
      const newDash = { ...oldDash, optimisticCreatedAt: Date.now() }
      if (newDash.todayFollowups) {
        newDash.todayFollowups = newDash.todayFollowups.filter(f => f.patientId !== patientId)
      }
      if (newDash.cards && newDash.cards.todayFollowups > 0) {
        newDash.cards = { ...newDash.cards, todayFollowups: newDash.cards.todayFollowups - 1 }
      }
      return newDash
    })
  }
}

function updateCompleteFollowUpCache(queryClient: QueryClient, patientId: string, response?: unknown) {
  queryClient.setQueryData(
    ['patient', patientId],
    (oldData: PatientProfileSnapshot | undefined) => {
      if (!oldData) return oldData
      const newData: PatientProfileSnapshot = { ...oldData, optimisticCreatedAt: Date.now() }

      if (newData.activeFollowup) {
        newData.followupHistory = [
          {
            id: newData.activeFollowup.id,
            date: newData.activeFollowup.date,
            title: 'Follow-Up Completed',
            status: 'Completed',
            description: newData.activeFollowup.timeSlot,
          },
          ...newData.followupHistory,
        ]
        newData.activeFollowup = null
        newData.overview = {
          ...newData.overview,
          activeFollowUp: null,
          activeFollowUpStatusLabel: 'None scheduled',
          nextFollowUpDateLabel: '-',
        }
      }

      newData.timeline = [
        createTimelineEvent(patientId, 'follow_up_completed', 'Follow-Up Completed', 'Patient completed scheduled follow-up'),
        ...newData.timeline,
      ]

      return newData
    }
  )

  // BUG 4 FIX: Optimistically remove from dashboard today's followups
  const res = response as { followUpId?: string } | undefined
  queryClient.setQueryData(['dashboard'], (oldDash: DashboardData | undefined) => {
    if (!oldDash) return oldDash
    const newDash = { ...oldDash, optimisticCreatedAt: Date.now() }

    if (newDash.todayFollowups) {
      newDash.todayFollowups = newDash.todayFollowups.filter(f =>
        res?.followUpId ? f.followupId !== res.followUpId : f.patientId !== patientId
      )
    }

    if (newDash.cards && newDash.cards.todayFollowups > 0) {
      newDash.cards = { ...newDash.cards, todayFollowups: newDash.cards.todayFollowups - 1 }
    }

    return newDash
  })
}

function updateMedicineCache(
  queryClient: QueryClient,
  patientId: string,
  response: unknown,
  actionType: 'CREATE_PRESCRIPTION' | 'UPDATE_PRESCRIPTION' | 'DISCONTINUE_PRESCRIPTION'
) {
  queryClient.setQueryData(
    ['patient', patientId],
    (oldData: PatientProfileSnapshot | undefined) => {
      if (!oldData) return oldData
      const newData: PatientProfileSnapshot = { ...oldData, optimisticCreatedAt: Date.now() }

      let type: PatientTimelineEvent['type'] = 'medicine_added'
      let title = 'Medicine Added'
      let desc = 'New prescription added'

      const res = response as {
        input?: AddMedicineInput | UpdateMedicineInput;
        reason?: DiscontinueReason;
        medicineId?: string;
        conditionId?: string;
      }

      if (actionType === 'UPDATE_PRESCRIPTION') {
        type = 'medicine_updated'
        title = 'Medicine Updated'
        desc = 'Prescription modified'
      } else if (actionType === 'DISCONTINUE_PRESCRIPTION') {
        type = 'medicine_discontinued'
        title = 'Medicine Discontinued'
        desc = res.reason ? `Reason: ${res.reason}` : 'Prescription stopped'
      } else if (actionType === 'CREATE_PRESCRIPTION' && res.input && 'medicineName' in res.input) {
        desc = `Prescribed ${res.input.medicineName}`
      }

      // Issue B FIX: Optimistically inject new medicine into condition
      if (actionType === 'CREATE_PRESCRIPTION' && res.input && 'medicineName' in res.input) {
        const input = res.input as AddMedicineInput;
        const newMedicine: ConditionMedicine = {
          id: `temp-med-${Date.now()}`,
          conditionId: input.conditionId,
          medicineName: input.medicineName,
          dosage: input.dosage,
          timing: input.timing,
          frequency: input.frequency,
          startDate: input.startDate,
          durationDays: input.durationDays,
          instructions: input.instructions,
          status: 'Active',
        };

        newData.conditions = newData.conditions.map(cond => {
          if (cond.id !== input.conditionId) return cond;
          return {
            ...cond,
            medicines: [...cond.medicines, newMedicine],
          };
        });

        newData.overview = {
          ...newData.overview,
          activeMedicinesCount: newData.overview.activeMedicinesCount + 1,
        };
      }

      // BUG 2 & 3 FIX: Modifying the medicine record directly
      if (res.conditionId && res.medicineId && (actionType === 'UPDATE_PRESCRIPTION' || actionType === 'DISCONTINUE_PRESCRIPTION')) {
        newData.conditions = newData.conditions.map(cond => {
          if (cond.id !== res.conditionId) return cond;
          return {
            ...cond,
            medicines: cond.medicines.map(med => {
              if (med.id !== res.medicineId) return med;

              if (actionType === 'DISCONTINUE_PRESCRIPTION') {
                return {
                  ...med,
                  status: 'Discontinued',
                  discontinuedReason: res.reason
                };
              } else if (actionType === 'UPDATE_PRESCRIPTION' && res.input) {
                const input = res.input as UpdateMedicineInput;
                let newDuration = med.durationDays;
                let newStartDate = med.startDate;

                if (input.updateMode === 'Extend' && input.extendDays) {
                  newDuration += input.extendDays;
                } else if (input.updateMode === 'Replace_Current' && input.replaceDurationDays) {
                  newDuration = input.replaceDurationDays;
                  newStartDate = new Date().toISOString().split('T')[0];
                }

                return {
                  ...med,
                  dosage: input.dosage || med.dosage,
                  timing: input.timing && input.timing.length > 0 ? input.timing : med.timing,
                  frequency: input.frequency || med.frequency,
                  instructions: input.instructions || med.instructions,
                  durationDays: newDuration,
                  startDate: newStartDate
                };
              }
              return med;
            })
          };
        });

        if (actionType === 'DISCONTINUE_PRESCRIPTION') {
          newData.overview = {
            ...newData.overview,
            activeMedicinesCount: Math.max(0, newData.overview.activeMedicinesCount - 1)
          };
        }
      }

      newData.timeline = [
        createTimelineEvent(patientId, type, title, desc),
        ...newData.timeline,
      ]

      return newData
    }
  )
}

// ---------------------------------------------------------------------------
// Helper
// ---------------------------------------------------------------------------
function mapTimeSlot(time: string): 'Morning' | 'Afternoon' | 'Night' {
  const lower = time?.toLowerCase() ?? ''
  if (lower === 'afternoon') return 'Afternoon'
  if (lower === 'night' || lower === 'evening') return 'Night'
  return 'Morning'
}
