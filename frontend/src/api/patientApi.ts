import { API_BASE_URL } from './client'
import type { PatientApiResponse } from './patientTypes'
import { apiClient } from '@/lib/apiClient'
import {
  patients as mockPatients,
  prescriptions as mockPrescriptions,
  followUps as mockFollowUps,
  consultations as mockConsultations,
  doctors as mockDoctors,
} from '@/data/mockData'

function getMockPatient(patientId: string): PatientApiResponse {
  const p = mockPatients.find((pt) => pt.id === patientId) || mockPatients[0]
  const doc = mockDoctors.find((d) => d.id === p.doctorId)
  const pRx = mockPrescriptions.filter((rx) => rx.patientId === p.id)
  const pFu = mockFollowUps.filter((f) => f.patientId === p.id)
  const pCon = mockConsultations.filter((c) => c.patientId === p.id)

  const activeFu = pFu.find((f) => f.status === 'Scheduled') || null
  const pastFus = pFu.filter((f) => f !== activeFu)

  return {
    patientId: p.id,
    patient: {
      name: p.name,
      displayName: p.name,
      patientId: p.id,
      whatsapp: p.whatsapp,
      age: p.age,
      gender: p.gender,
      doctor: doc?.name || 'Dr. Priya Sharma',
      address: p.address,
      status: p.status,
      registrationDate: p.registrationDate,
      lastVisitDate: p.registrationDate,
    },
    overview: {
      activeConditions: pCon.length || 1,
      activeMedicines: pRx.filter((r) => r.status === 'Active').length || 1,
      activeFollowupStatus: activeFu?.status || 'Scheduled',
      nextFollowupDate: activeFu?.date || null,
      lastActivityDate: p.registrationDate,
    },
    treatmentJourney: {
      registered: true,
      consultationCompleted: p.status !== 'Registered',
      prescriptionActive: pRx.some((r) => r.status === 'Active'),
      followupExists: pFu.length > 0,
    },
    conditions: [
      {
        conditionId: 'COND-2001',
        title: p.conditions?.[0] || 'Acne Vulgaris',
        infectionType: 'Non-infectious',
        status: 'Active',
        diagnosisDate: p.registrationDate,
        prescriptions: pRx.map((rx) => ({
          prescriptionId: rx.id,
          medicineName: rx.medicineName,
          dosage: rx.dosage,
          timing: [rx.timing],
          frequency: rx.frequency,
          startDate: rx.startDate,
          endDate: rx.endDate,
          durationDays: 30,
          status: rx.status,
        })),
      },
    ],
    followups: {
      active: activeFu
        ? {
            followupId: activeFu.id,
            status: activeFu.status,
            date: activeFu.date,
            time: activeFu.time,
            reason: 'Routine clinical checkup',
          }
        : null,
      history: pastFus.map((f) => ({
        followupId: f.id,
        status: f.status,
        date: f.date,
        time: f.time,
        reason: 'Follow-up consultation',
      })),
    },
    timeline: [
      {
        eventId: 'EVT-01',
        type: 'patient_registered',
        title: 'Patient Registered',
        description: `Patient registration created with ${doc?.name || 'Dr. Priya Sharma'}`,
        createdAt: new Date(p.registrationDate).toISOString(),
      },
    ],
  }
}

export async function fetchPatient(patientId: string): Promise<PatientApiResponse> {
  try {
    const response = await apiClient(`${API_BASE_URL}/patient/${encodeURIComponent(patientId)}`, {
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
    })

    if (response.ok) {
      const json = await response.json()
      if (json && (json.patientId || json.patient)) {
        return json
      }
    }
  } catch (err) {
    console.warn(`[fetchPatient] Backend unreachable for ${patientId}, using fallback:`, err)
  }

  return getMockPatient(patientId)
}

