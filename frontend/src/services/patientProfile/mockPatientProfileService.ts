import type { IPatientProfileService } from './types'
import type { ConditionMedicine, PatientProfileBundle } from '@/data/patientProfileTypes'
import { isActiveFollowUp } from '@/data/patientProfileTypes'
import {
  ensurePatientProfileBundle,
  getPatientProfileBundle,
} from '@/data/patientProfileMock'

const store = new Map<string, PatientProfileBundle>()

function load(patientId: string): PatientProfileBundle {
  if (!store.has(patientId)) {
    const seed = getPatientProfileBundle(patientId) ?? ensurePatientProfileBundle(patientId)
    store.set(patientId, structuredClone(seed))
  }
  return store.get(patientId)!
}

function save(bundle: PatientProfileBundle): PatientProfileBundle {
  store.set(bundle.patientId, bundle)
  return bundle
}

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

function appendTimeline(
  bundle: PatientProfileBundle,
  type: PatientProfileBundle['timeline'][0]['type'],
  title: string,
  description: string
): PatientProfileBundle['timeline'] {
  return [
    ...bundle.timeline,
    {
      id: newId('tl'),
      patientId: bundle.patientId,
      type,
      title,
      description,
      timestamp: new Date().toISOString(),
    },
  ]
}

export const mockPatientProfileService: IPatientProfileService = {
  async getBundle(patientId) {
    return load(patientId)
  },

  async addMedicine(patientId, input) {
    const bundle = load(patientId)
    const med: ConditionMedicine = {
      id: newId('med'),
      conditionId: input.conditionId,
      medicineName: input.medicineName,
      dosage: input.dosage,
      timing: input.timing,
      frequency: input.frequency,
      startDate: input.startDate,
      durationDays: input.durationDays,
      instructions: input.instructions,
      status: 'Active',
    }
    return save({
      ...bundle,
      conditions: bundle.conditions.map((c) =>
        c.id === input.conditionId ? { ...c, medicines: [...c.medicines, med] } : c
      ),
      timeline: appendTimeline(
        bundle,
        'medicine_added',
        'Medicine added',
        `${input.medicineName} added to profile`
      ),
    })
  },

  async updateMedicine(patientId, conditionId, medicineId, input) {
    const bundle = load(patientId)
    return save({
      ...bundle,
      conditions: bundle.conditions.map((c) => {
        if (c.id !== conditionId) return c
        return {
          ...c,
          medicines: c.medicines.map((m) => {
            if (m.id !== medicineId) return m
            let durationDays = m.durationDays
            if (input.updateMode === 'Extend' && input.extendDays) {
              durationDays += input.extendDays
            } else if (input.updateMode === 'Replace_Current' && input.replaceDurationDays) {
              durationDays = input.replaceDurationDays
            }
            return {
              ...m,
              dosage: input.dosage,
              timing: input.timing,
              frequency: input.frequency,
              instructions: input.instructions,
              durationDays,
            }
          }),
        }
      }),
      timeline: appendTimeline(bundle, 'medicine_updated', 'Medicine updated', medicineId),
    })
  },

  async discontinueMedicine(patientId, conditionId, medicineId, reason) {
    const bundle = load(patientId)
    return save({
      ...bundle,
      conditions: bundle.conditions.map((c) => {
        if (c.id !== conditionId) return c
        return {
          ...c,
          medicines: c.medicines.map((m) =>
            m.id === medicineId
              ? { ...m, status: 'Discontinued', discontinuedReason: reason }
              : m
          ),
        }
      }),
      timeline: appendTimeline(
        bundle,
        'medicine_discontinued',
        'Medicine discontinued',
        reason
      ),
    })
  },

  async upsertActiveFollowUp(patientId, input) {
    const bundle = load(patientId)
    const active = bundle.followUps.find(isActiveFollowUp)
    if (active) {
      return save({
        ...bundle,
        followUps: bundle.followUps.map((f) =>
          f.id === active.id
            ? {
                ...f,
                date: input.date,
                timeSlot: input.timeSlot,
                status: 'Rescheduled',
                source: input.source ?? f.source,
              }
            : f
        ),
        timeline: appendTimeline(
          bundle,
          'follow_up_rescheduled',
          'Follow-Up updated',
          `${input.date} · ${input.timeSlot}`
        ),
      })
    }
    const created = {
      id: newId('fu'),
      patientId,
      date: input.date,
      timeSlot: input.timeSlot,
      status: 'Scheduled' as const,
      source: input.source ?? ('Manual' as const),
    }
    return save({
      ...bundle,
      followUps: [...bundle.followUps, created],
      timeline: appendTimeline(
        bundle,
        'follow_up_scheduled',
        'Follow-Up scheduled',
        `${input.date} · ${input.timeSlot}`
      ),
    })
  },

  async completeFollowUp(patientId, followUpId) {
    const bundle = load(patientId)
    return save({
      ...bundle,
      followUps: bundle.followUps.map((f) =>
        f.id === followUpId
          ? { ...f, status: 'Completed', completedDate: today() }
          : f
      ),
      timeline: appendTimeline(
        bundle,
        'follow_up_completed',
        'Follow-Up completed',
        'Marked complete from profile'
      ),
    })
  },

  async rescheduleFollowUp(patientId, followUpId, input) {
    const bundle = load(patientId)
    return save({
      ...bundle,
      followUps: bundle.followUps.map((f) =>
        f.id === followUpId
          ? {
              ...f,
              date: input.date,
              timeSlot: input.timeSlot,
              status: 'Rescheduled',
              rescheduleReason: input.reason,
            }
          : f
      ),
      timeline: appendTimeline(
        bundle,
        'follow_up_rescheduled',
        'Follow-Up rescheduled',
        input.reason
      ),
    })
  },
}
