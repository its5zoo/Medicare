import type { PatientProfileBundle } from './patientProfileTypes'
import { patients } from './mockData'

const bundles: Record<string, PatientProfileBundle> = {}

function daysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

function daysFromNow(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString().split('T')[0]
}

function isoDaysAgo(n: number): string {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString()
}

patients.slice(0, 40).forEach((patient, i) => {
  const hasData = i % 5 !== 0
  const cid = `cond-${patient.id}-1`
  bundles[patient.id] = {
    patientId: patient.id,
    lastConsultationDate: hasData ? daysAgo(10 + (i % 15)) : null,
    conditions: hasData
      ? [
          {
            id: cid,
            patientId: patient.id,
            conditionName: patient.conditions?.[0] ?? 'Dermatitis',
            infectionType: 'Acne',
            diagnosisDate: daysAgo(30 + i),
            lastReviewDate: daysAgo(5 + (i % 10)),
            status: 'Active',
            medicines: [
              {
                id: `med-${patient.id}-1`,
                conditionId: cid,
                medicineName: 'Clindamycin Gel 1%',
                dosage: 'Apply thin layer',
                timing: ['Night'],
                frequency: 'Daily',
                startDate: daysAgo(14),
                durationDays: 30,
                instructions: 'Apply on clean skin',
                status: i % 6 === 0 ? 'Discontinued' : 'Active',
              },
            ],
          },
        ]
      : [],
    followUps: hasData
      ? [
          {
            id: `fu-${patient.id}-1`,
            patientId: patient.id,
            date: daysFromNow(3 + (i % 5)),
            timeSlot: 'Morning',
            status: 'Scheduled',
            source: 'Consultation',
          },
        ]
      : [],
    timeline: [
      {
        id: `tl-${patient.id}-reg`,
        patientId: patient.id,
        type: 'patient_registered',
        title: 'Registration',
        description: `${patient.name} registered at clinic`,
        timestamp: isoDaysAgo(60 + i),
      },
    ],
  }
})

bundles['DERM-1040'] = {
  patientId: 'DERM-1040',
  lastConsultationDate: daysAgo(5),
  conditions: [
    {
      id: 'cond-1040-acne',
      patientId: 'DERM-1040',
      conditionName: 'Acne Vulgaris',
      infectionType: 'Acne',
      diagnosisDate: daysAgo(45),
      lastReviewDate: daysAgo(7),
      status: 'Active',
      notes: 'Moderate inflammatory acne.',
      medicines: [
        {
          id: 'med-1040-1',
          conditionId: 'cond-1040-acne',
          medicineName: 'Isotretinoin 20mg',
          dosage: '20mg oral',
          timing: ['Night'],
          frequency: 'Daily',
          startDate: daysAgo(20),
          durationDays: 90,
          instructions: 'Take with fatty meal.',
          status: 'Active',
        },
        {
          id: 'med-1040-2',
          conditionId: 'cond-1040-acne',
          medicineName: 'Benzoyl Peroxide 2.5%',
          dosage: 'Thin layer',
          timing: ['Morning'],
          frequency: 'Daily',
          startDate: daysAgo(20),
          durationDays: 60,
          instructions: 'Apply after cleansing.',
          status: 'Active',
        },
      ],
    },
    {
      id: 'cond-1040-fungal',
      patientId: 'DERM-1040',
      conditionName: 'Tinea Corporis',
      infectionType: 'Fungal Infection',
      diagnosisDate: daysAgo(30),
      lastReviewDate: daysAgo(14),
      status: 'Monitoring',
      medicines: [
        {
          id: 'med-1040-3',
          conditionId: 'cond-1040-fungal',
          medicineName: 'Terbinafine 250mg',
          dosage: '250mg',
          timing: ['Morning', 'Night'],
          frequency: 'Daily',
          startDate: daysAgo(10),
          durationDays: 28,
          instructions: 'Complete full course.',
          status: 'Active',
        },
      ],
    },
  ],
  followUps: [
    {
      id: 'fu-1040-active',
      patientId: 'DERM-1040',
      date: daysFromNow(4),
      timeSlot: 'Afternoon',
      status: 'Scheduled',
      source: 'Consultation',
    },
    {
      id: 'fu-1040-1',
      patientId: 'DERM-1040',
      date: daysAgo(30),
      timeSlot: 'Morning',
      status: 'Completed',
      source: 'Consultation',
      completedDate: daysAgo(30),
    },
    {
      id: 'fu-1040-2',
      patientId: 'DERM-1040',
      date: daysAgo(14),
      timeSlot: 'Afternoon',
      status: 'Completed',
      source: 'Manual',
      completedDate: daysAgo(14),
    },
    {
      id: 'fu-1040-rescheduled',
      patientId: 'DERM-1040',
      date: daysAgo(12),
      timeSlot: 'Morning',
      status: 'Rescheduled',
      source: 'Manual',
      rescheduleReason: 'Patient requested later slot',
    },
    {
      id: 'fu-1040-cancelled',
      patientId: 'DERM-1040',
      date: daysAgo(20),
      timeSlot: 'Night',
      status: 'Cancelled',
      source: 'System',
    },
    {
      id: 'fu-1040-3',
      patientId: 'DERM-1040',
      date: daysAgo(45),
      timeSlot: 'Night',
      status: 'Missed',
      source: 'System',
    },
    {
      id: 'fu-1040-superseded',
      patientId: 'DERM-1040',
      date: daysAgo(60),
      timeSlot: 'Morning',
      status: 'Superseded',
      source: 'Manual',
      completedDate: daysAgo(58),
    },
  ],
  timeline: [
    {
      id: 'tl-1040-1',
      patientId: 'DERM-1040',
      type: 'patient_registered',
      title: 'Registration',
      description: 'Md Faizaan Fatah joined the clinic',
      timestamp: isoDaysAgo(90),
    },
    {
      id: 'tl-1040-2',
      patientId: 'DERM-1040',
      type: 'condition_created',
      title: 'Condition Created',
      description: 'Acne Vulgaris diagnosed',
      timestamp: isoDaysAgo(45),
    },
    {
      id: 'tl-1040-2b',
      patientId: 'DERM-1040',
      type: 'consultation_completed',
      title: 'Consultation',
      description: 'Initial acne assessment completed',
      timestamp: isoDaysAgo(45),
    },
    {
      id: 'tl-1040-3',
      patientId: 'DERM-1040',
      type: 'medicine_added',
      title: 'Medicine change',
      description: 'Isotretinoin 20mg started',
      timestamp: isoDaysAgo(20),
    },
    {
      id: 'tl-1040-4',
      patientId: 'DERM-1040',
      type: 'follow_up_scheduled',
      title: 'Follow-Up',
      description: 'Afternoon slot in 4 days',
      timestamp: isoDaysAgo(5),
    },
    {
      id: 'tl-1040-5',
      patientId: 'DERM-1040',
      type: 'visit_completed',
      title: 'Completed visit',
      description: 'Progress review - stable response',
      timestamp: isoDaysAgo(14),
    },
    {
      id: 'tl-1040-6',
      patientId: 'DERM-1040',
      type: 'follow_up_rescheduled',
      title: 'Follow-Up Rescheduled',
      description: 'Moved to afternoon slot',
      timestamp: isoDaysAgo(12),
    },
    {
      id: 'tl-1040-7',
      patientId: 'DERM-1040',
      type: 'medicine_discontinued',
      title: 'Medicine Discontinued',
      description: 'Benzoyl Peroxide discontinued - course completed',
      timestamp: isoDaysAgo(8),
    },
    {
      id: 'tl-1040-8',
      patientId: 'DERM-1040',
      type: 'follow_up_completed',
      title: 'Follow-Up Completed',
      description: 'Routine progress check completed',
      timestamp: isoDaysAgo(14),
    },
  ],
}

export function getPatientProfileBundle(patientId: string): PatientProfileBundle | null {
  return bundles[patientId] ?? null
}

export function ensurePatientProfileBundle(patientId: string): PatientProfileBundle {
  if (!bundles[patientId]) {
    bundles[patientId] = {
      patientId,
      conditions: [],
      followUps: [],
      timeline: [],
      lastConsultationDate: null,
    }
  }
  return bundles[patientId]
}
