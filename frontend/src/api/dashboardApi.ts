import { apiClient } from './client'
import type { ApiResponse, DashboardData } from './types'
import {
  patients as mockPatients,
  prescriptions as mockPrescriptions,
  followUps as mockFollowUps,
  activities as mockActivities,
  doctors as mockDoctors,
  getDashboardStats,
} from '@/data/mockData'

function getMockDashboardData(): DashboardData {
  const stats = getDashboardStats()
  const todayStr = new Date().toISOString().split('T')[0]

  const todayFollowups = mockFollowUps
    .filter((f) => f.date === todayStr || f.status === 'Scheduled')
    .slice(0, 10)
    .map((f) => {
      const p = mockPatients.find((pt) => pt.id === f.patientId)
      const doc = mockDoctors.find((d) => d.id === f.doctorId)
      return {
        followupId: f.id,
        patientId: f.patientId,
        patientName: p?.name || 'Patient',
        doctor: doc?.name || 'Dr. Priya Sharma',
        date: f.date,
        time: f.time,
        status: f.date === todayStr ? 'Today' : 'Upcoming',
      }
    })

  const recentRegistrations = mockPatients.slice(0, 8).map((p) => {
    const doc = mockDoctors.find((d) => d.id === p.doctorId)
    return {
      patientId: p.id,
      name: p.name,
      phone: p.phone,
      doctor: doc?.name || 'Dr. Priya Sharma',
      date: p.registrationDate,
      status: p.status,
    }
  })

  const consultationPending = mockPatients
    .filter((p) => p.status === 'Consultation Pending' || p.status === 'Registered')
    .slice(0, 8)
    .map((p) => {
      const doc = mockDoctors.find((d) => d.id === p.doctorId)
      return {
        patientId: p.id,
        name: p.name,
        phone: p.phone,
        doctor: doc?.name || 'Dr. Priya Sharma',
        registrationDate: p.registrationDate,
        daysWaiting: 2,
      }
    })

  const activePrescriptions = mockPrescriptions
    .filter((rx) => rx.status === 'Active')
    .slice(0, 8)
    .map((rx) => {
      const p = mockPatients.find((pt) => pt.id === rx.patientId)
      const doc = mockDoctors.find((d) => d.id === rx.doctorId)
      return {
        prescriptionId: rx.id,
        patientId: rx.patientId,
        patientName: p?.name || 'Patient',
        doctor: doc?.name || 'Dr. Priya Sharma',
        medicine: rx.medicineName,
        dosage: rx.dosage,
        frequency: rx.frequency,
        startDate: rx.startDate,
        endDate: rx.endDate,
        daysRemaining: 14,
        status: rx.status,
      }
    })

  const activityFeed = mockActivities.map((a) => ({
    type: a.type,
    title: a.title,
    description: a.description,
    createdAt: a.timestamp,
    patientCode: a.patientId,
    priority: 'normal',
  }))

  const patientSearchIndex = mockPatients.map((p) => {
    const doc = mockDoctors.find((d) => d.id === p.doctorId)
    return {
      patientId: p.id,
      fullName: p.name,
      displayName: p.name,
      phone: p.phone,
      doctor: doc?.name || 'Dr. Priya Sharma',
      status: p.status,
      gender: p.gender,
      age: p.age,
      registrationDate: p.registrationDate,
      searchText: `${p.id} ${p.name} ${p.phone} ${doc?.name || ''} ${p.status}`.toLowerCase(),
    }
  })

  const totalPatientsAvailable = mockPatients.map((p) => {
    const doc = mockDoctors.find((d) => d.id === p.doctorId)
    const pRx = mockPrescriptions.filter((rx) => rx.patientId === p.id && rx.status === 'Active')
    const nextFu = mockFollowUps.find((f) => f.patientId === p.id)
    return {
      patientId: p.id,
      patientName: p.name,
      phone: p.phone,
      assignedDoctor: doc?.name || 'Dr. Priya Sharma',
      createdTime: new Date(p.registrationDate).toISOString(),
      registrationDate: p.registrationDate,
      activeMedicineCount: pRx.length,
      nextFollowupDate: nextFu ? nextFu.date : null,
      nextFollowupTime: nextFu ? nextFu.time : null,
      status: p.status,
      searchText: `${p.id} ${p.name} ${p.phone} ${doc?.name || ''}`.toLowerCase(),
    }
  })

  const upcomingFollowups = mockFollowUps
    .filter((f) => f.status === 'Scheduled' || f.date > todayStr)
    .map((f) => {
      const p = mockPatients.find((pt) => pt.id === f.patientId)
      const doc = mockDoctors.find((d) => d.id === f.doctorId)
      return {
        followupId: f.id,
        patientId: f.patientId,
        patientName: p?.name || 'Patient',
        phone: p?.phone || '',
        doctor: doc?.name || 'Dr. Priya Sharma',
        followupDate: f.date,
        followupTime: f.time,
        status: 'Upcoming',
        searchText: `${f.id} ${p?.name || ''} ${p?.phone || ''}`.toLowerCase(),
      }
    })

  const missedFollowups = mockFollowUps
    .filter((f) => f.status === 'Missed')
    .map((f) => {
      const p = mockPatients.find((pt) => pt.id === f.patientId)
      const doc = mockDoctors.find((d) => d.id === f.doctorId)
      return {
        followupId: f.id,
        patientId: f.patientId,
        patientName: p?.name || 'Patient',
        phone: p?.phone || '',
        doctor: doc?.name || 'Dr. Priya Sharma',
        followupDate: f.date,
        followupTime: f.time,
        daysOverdue: 3,
        rescheduleCount: 1,
        status: 'Missed',
      }
    })

  const completedFollowups = mockFollowUps
    .filter((f) => f.status === 'Completed')
    .map((f) => {
      const p = mockPatients.find((pt) => pt.id === f.patientId)
      const doc = mockDoctors.find((d) => d.id === f.doctorId)
      return {
        followupId: f.id,
        patientId: f.patientId,
        patientName: p?.name || 'Patient',
        phone: p?.phone || '',
        doctor: doc?.name || 'Dr. Priya Sharma',
        followupDate: f.date,
        followupTime: f.time,
        daysOverdue: 0,
        rescheduleCount: 0,
        status: 'Completed',
      }
    })

  const activePrescriptionsList = mockPrescriptions
    .filter((rx) => rx.status === 'Active')
    .map((rx) => {
      const p = mockPatients.find((pt) => pt.id === rx.patientId)
      const doc = mockDoctors.find((d) => d.id === rx.doctorId)
      return {
        prescriptionId: rx.id,
        patientId: rx.patientId,
        patientName: p?.name || 'Patient',
        doctor: doc?.name || 'Dr. Priya Sharma',
        phone: p?.phone || '',
        medicine: rx.medicineName,
        dosage: rx.dosage,
        frequency: rx.frequency,
        startDate: rx.startDate,
        endDate: rx.endDate,
        daysRemaining: 14,
        status: rx.status,
        searchText: `${rx.id} ${p?.name || ''} ${rx.medicineName}`.toLowerCase(),
      }
    })

  const completedPrescriptions = mockPrescriptions
    .filter((rx) => rx.status === 'Completed' || rx.status === 'Discontinued')
    .map((rx) => {
      const p = mockPatients.find((pt) => pt.id === rx.patientId)
      const doc = mockDoctors.find((d) => d.id === rx.doctorId)
      return {
        prescriptionId: rx.id,
        patientId: rx.patientId,
        patientName: p?.name || 'Patient',
        doctor: doc?.name || 'Dr. Priya Sharma',
        phone: p?.phone || '',
        medicine: rx.medicineName,
        dosage: rx.dosage,
        frequency: rx.frequency,
        startDate: rx.startDate,
        endDate: rx.endDate,
        status: rx.status,
        searchText: `${rx.id} ${p?.name || ''} ${rx.medicineName}`.toLowerCase(),
      }
    })

  return {
    cards: {
      totalPatients: stats.totalPatients,
      consultationPending: stats.consultationPending,
      activePatients: stats.activePatients,
      todayFollowups: stats.todaysFollowUps,
      missedFollowups: stats.missedFollowUps,
      activePrescriptions: stats.activePrescriptions,
    },
    recentRegistrations,
    activityFeed,
    consultationPending,
    todayFollowups,
    activePrescriptions,
    patientSearchIndex,
    generatedAt: new Date().toISOString(),
    totalPatientSummary: {
      totalPatients: stats.totalPatients,
      activePatients: stats.activePatients,
      patientsWithActiveFollowup: stats.todaysFollowUps + upcomingFollowups.length,
      patientsRequiringAttention: stats.missedFollowUps + stats.consultationPending,
    },
    totalPatientsAvailable,
    activePatientSummary: {
      totalPatients: stats.totalPatients,
      activePatients: stats.activePatients,
      patientsWithActiveFollowup: stats.todaysFollowUps + upcomingFollowups.length,
      patientsRequiringAttention: stats.missedFollowUps,
    },
    totalActivePatients: totalPatientsAvailable.filter(
      (p) => p.status === 'Active Treatment' || p.status === 'Follow-Up Due'
    ),
    totalActivePrescriptionSummary: {
      totalActivePrescriptions: activePrescriptionsList.length,
      totalCompletedPrescriptions: completedPrescriptions.length,
    },
    allFeaturedPrescriptions: activePrescriptionsList.slice(0, 4),
    activePrescriptionsList,
    completedPrescriptionSummary: {
      totalActivePrescriptions: activePrescriptionsList.length,
      totalCompletedPrescriptions: completedPrescriptions.length,
    },
    featuredPrescriptions: completedPrescriptions.slice(0, 4),
    completedPrescriptions,
    totalUpcomingFollowupSummary: {
      totalUpcomingFollowups: upcomingFollowups.length,
      totalMissedFollowups: missedFollowups.length,
      totalCompletedFollowups: completedFollowups.length,
      totalTodayFollowups: todayFollowups.length,
    },
    upcomingFollowups,
    totalMissedFollowupSummary: {
      totalUpcomingFollowups: upcomingFollowups.length,
      totalMissedFollowups: missedFollowups.length,
      totalCompletedFollowups: completedFollowups.length,
      totalTodayFollowups: todayFollowups.length,
    },
    missedFollowups,
    totalCompletedFollowupSummary: {
      totalUpcomingFollowups: upcomingFollowups.length,
      totalMissedFollowups: missedFollowups.length,
      totalCompletedFollowups: completedFollowups.length,
      totalTodayFollowups: todayFollowups.length,
    },
    completedFollowups,
  }
}

export async function fetchDashboard(): Promise<DashboardData> {
  try {
    const response = await apiClient.get<ApiResponse<DashboardData>>('/dashboard')
    if (response && response.data) {
      return response.data
    }
    return getMockDashboardData()
  } catch (error) {
    console.warn('[fetchDashboard] Backend unreachable, using fallback dataset:', error)
    return getMockDashboardData()
  }
}

