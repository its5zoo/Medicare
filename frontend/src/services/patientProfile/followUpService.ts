import type {
  PatientFollowUpRecord,
  PatientProfileBundle,
  UpsertFollowUpInput,
  RescheduleFollowUpInput,
} from '@/data/patientProfileTypes'
import { isActiveFollowUp } from '@/data/patientProfileTypes'

function newId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export function upsertActiveFollowUpInBundle(
  bundle: PatientProfileBundle,
  input: UpsertFollowUpInput
): PatientProfileBundle {
  const existing = bundle.followUps.find(isActiveFollowUp)

  if (existing) {
    return {
      ...bundle,
      followUps: bundle.followUps.map((f) =>
        f.id === existing.id
          ? {
              ...f,
              date: input.date,
              timeSlot: input.timeSlot,
              status: 'Rescheduled',
              source: input.source ?? f.source,
            }
          : f
      ),
      timeline: [
        ...bundle.timeline,
        {
          id: newId('tl'),
          patientId: bundle.patientId,
          type: 'follow_up_rescheduled',
          title: 'Follow-up updated',
          description: `${input.date} · ${input.timeSlot}`,
          timestamp: new Date().toISOString(),
        },
      ],
    }
  }

  const newFollowUp: PatientFollowUpRecord = {
    id: newId('fu'),
    patientId: bundle.patientId,
    date: input.date,
    timeSlot: input.timeSlot,
    status: 'Scheduled',
    source: input.source ?? 'Manual',
  }

  return {
    ...bundle,
    followUps: [...bundle.followUps, newFollowUp],
    timeline: [
      ...bundle.timeline,
      {
        id: newId('tl'),
        patientId: bundle.patientId,
        type: 'follow_up_scheduled',
        title: 'Follow-up scheduled',
        description: `${input.date} · ${input.timeSlot}`,
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

export function completeFollowUpInBundle(
  bundle: PatientProfileBundle,
  followUpId: string
): PatientProfileBundle {
  return {
    ...bundle,
    followUps: bundle.followUps.map((f) =>
      f.id === followUpId && isActiveFollowUp(f)
        ? { ...f, status: 'Completed', completedDate: today() }
        : f
    ),
    timeline: [
      ...bundle.timeline,
      {
        id: newId('tl'),
        patientId: bundle.patientId,
        type: 'follow_up_completed',
        title: 'Follow-up completed',
        description: 'Marked complete from profile',
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

export function rescheduleActiveFollowUpInBundle(
  bundle: PatientProfileBundle,
  input: RescheduleFollowUpInput
): PatientProfileBundle {
  const active = bundle.followUps.find(isActiveFollowUp)
  if (!active) {
    return upsertActiveFollowUpInBundle(bundle, {
      date: input.date,
      timeSlot: input.timeSlot,
      source: 'Manual',
    })
  }

  return {
    ...bundle,
    followUps: bundle.followUps.map((f) =>
      f.id === active.id
        ? {
            ...f,
            date: input.date,
            timeSlot: input.timeSlot,
            status: 'Rescheduled',
          }
        : f
    ),
    timeline: [
      ...bundle.timeline,
      {
        id: newId('tl'),
        patientId: bundle.patientId,
        type: 'follow_up_rescheduled',
        title: 'Follow-up rescheduled',
        description: `${input.date} · ${input.timeSlot}`,
        timestamp: new Date().toISOString(),
      },
    ],
  }
}

export function hasActiveFollowUp(followUps: PatientFollowUpRecord[]): boolean {
  return followUps.some(isActiveFollowUp)
}
