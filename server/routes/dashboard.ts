import { Router, Request, Response } from 'express'
import { Patient } from '../models/Patient'
import { Consultation } from '../models/Consultation'
import { Prescription } from '../models/Prescription'
import { FollowUp } from '../models/FollowUp'
import { Review } from '../models/Review'
import { Activity } from '../models/Activity'

const router = Router()

// GET /dashboard
router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const todayStr = new Date().toISOString().split('T')[0]

    // Fetch collections from MongoDB
    const [patients, consultations, prescriptions, followUps, reviews, activities] =
      await Promise.all([
        Patient.find().sort({ createdAt: -1 }),
        Consultation.find().sort({ createdAt: -1 }),
        Prescription.find().sort({ createdAt: -1 }),
        FollowUp.find().sort({ createdAt: -1 }),
        Review.find().sort({ createdAt: -1 }),
        Activity.find().sort({ createdAt: -1 }).limit(20),
      ])

    const totalPatients = patients.length
    const consultationPendingCount = patients.filter((p) => p.status === 'Consultation Pending' || p.status === 'Registered').length
    const activePatientsCount = patients.filter((p) => p.status === 'Active Treatment' || p.status === 'Follow-Up Due').length
    const todayFollowupsCount = followUps.filter((f) => f.followupDate === todayStr || f.status === 'Today').length
    const missedFollowupsCount = followUps.filter((f) => f.status === 'Missed').length
    const activePrescriptionsCount = prescriptions.filter((p) => p.status === 'Active').length

    // Cards
    const cards = {
      totalPatients,
      consultationPending: consultationPendingCount,
      activePatients: activePatientsCount,
      todayFollowups: todayFollowupsCount,
      missedFollowups: missedFollowupsCount,
      activePrescriptions: activePrescriptionsCount,
    }

    // Recent Registrations
    const recentRegistrations = patients.slice(0, 10).map((p) => ({
      patientId: p.patientId,
      name: p.name,
      phone: p.phone,
      doctor: p.doctor,
      date: p.registrationDate,
      status: p.status,
    }))

    // Activity Feed
    const activityFeed = activities.map((a) => ({
      type: a.type,
      title: a.title,
      description: a.description,
      createdAt: a.createdAt.toISOString(),
      patientCode: a.patientCode,
      priority: a.priority,
    }))

    // Consultation Pending
    const consultationPending = patients
      .filter((p) => p.status === 'Consultation Pending' || p.status === 'Registered')
      .slice(0, 10)
      .map((p) => ({
        patientId: p.patientId,
        name: p.name,
        phone: p.phone,
        doctor: p.doctor,
        registrationDate: p.registrationDate,
        daysWaiting: Math.max(
          1,
          Math.floor((Date.now() - new Date(p.registrationDate).getTime()) / (1000 * 60 * 60 * 24))
        ),
      }))

    // Today Followups
    const todayFollowups = followUps
      .filter((f) => f.followupDate === todayStr || f.status === 'Today')
      .map((f) => ({
        followupId: f.followupId,
        patientId: f.patientId,
        patientName: f.patientName,
        doctor: f.doctor,
        date: f.followupDate,
        time: f.followupTime,
        status: f.status,
      }))

    // Active Prescriptions (Preview Items)
    const activePrescriptions = prescriptions
      .filter((p) => p.status === 'Active')
      .slice(0, 10)
      .map((p) => ({
        prescriptionId: p.prescriptionId,
        patientId: p.patientId,
        patientName: p.patientName,
        doctor: p.doctor,
        medicine: p.medicineName,
        dosage: p.dosage,
        frequency: p.frequency,
        startDate: p.startDate,
        endDate: p.endDate,
        daysRemaining: p.durationDays || 14,
        status: p.status,
      }))

    // Patient Search Index
    const patientSearchIndex = patients.map((p) => ({
      patientId: p.patientId,
      fullName: p.name,
      displayName: p.name,
      phone: p.phone,
      doctor: p.doctor,
      status: p.status,
      gender: p.gender,
      age: p.age,
      registrationDate: p.registrationDate,
      searchText: `${p.patientId} ${p.name} ${p.phone} ${p.doctor} ${p.status}`.toLowerCase(),
    }))

    // Full Patient Records for All Patients table
    const totalPatientsAvailable = patients.map((p) => {
      const pRx = prescriptions.filter((rx) => rx.patientId === p.patientId && rx.status === 'Active')
      const nextFu = followUps.find(
        (f) => f.patientId === p.patientId && (f.status === 'Scheduled' || f.status === 'Upcoming' || f.status === 'Today')
      )
      return {
        patientId: p.patientId,
        patientName: p.name,
        phone: p.phone || null,
        assignedDoctor: p.doctor || null,
        createdTime: p.createdAt.toISOString(),
        registrationDate: p.registrationDate || null,
        activeMedicineCount: pRx.length,
        nextFollowupDate: nextFu ? nextFu.followupDate : null,
        nextFollowupTime: nextFu ? nextFu.followupTime : null,
        status: p.status,
        searchText: `${p.patientId} ${p.name} ${p.phone} ${p.doctor}`.toLowerCase(),
      }
    })

    const totalActivePatients = totalPatientsAvailable.filter(
      (p) => p.status === 'Active Treatment' || p.status === 'Follow-Up Due'
    )

    // Prescriptions List
    const activePrescriptionsList = prescriptions
      .filter((p) => p.status === 'Active')
      .map((p) => ({
        prescriptionId: p.prescriptionId,
        patientId: p.patientId,
        patientName: p.patientName,
        doctor: p.doctor,
        phone: p.phone,
        medicine: p.medicineName,
        dosage: p.dosage,
        frequency: p.frequency,
        startDate: p.startDate,
        endDate: p.endDate || p.startDate,
        daysRemaining: p.durationDays || 14,
        status: p.status,
        searchText: `${p.prescriptionId} ${p.patientName} ${p.medicineName} ${p.doctor}`.toLowerCase(),
      }))

    const completedPrescriptions = prescriptions
      .filter((p) => p.status === 'Completed' || p.status === 'Discontinued')
      .map((p) => ({
        prescriptionId: p.prescriptionId,
        patientId: p.patientId,
        patientName: p.patientName,
        doctor: p.doctor,
        phone: p.phone,
        medicine: p.medicineName,
        dosage: p.dosage,
        frequency: p.frequency,
        startDate: p.startDate,
        endDate: p.endDate || p.startDate,
        status: p.status,
        searchText: `${p.prescriptionId} ${p.patientName} ${p.medicineName} ${p.doctor}`.toLowerCase(),
      }))

    // Follow-ups List
    const upcomingFollowups = followUps
      .filter((f) => f.status === 'Upcoming' || f.status === 'Scheduled')
      .map((f) => ({
        followupId: f.followupId,
        patientId: f.patientId,
        patientName: f.patientName,
        phone: f.phone,
        doctor: f.doctor,
        followupDate: f.followupDate,
        followupTime: f.followupTime,
        status: f.status,
        searchText: `${f.followupId} ${f.patientName} ${f.phone} ${f.doctor}`.toLowerCase(),
      }))

    const missedFollowups = followUps
      .filter((f) => f.status === 'Missed')
      .map((f) => ({
        followupId: f.followupId,
        patientId: f.patientId,
        patientName: f.patientName,
        phone: f.phone,
        doctor: f.doctor,
        followupDate: f.followupDate,
        followupTime: f.followupTime,
        daysOverdue: 3,
        rescheduleCount: f.rescheduleCount || 0,
        status: f.status,
      }))

    const completedFollowups = followUps
      .filter((f) => f.status === 'Completed')
      .map((f) => ({
        followupId: f.followupId,
        patientId: f.patientId,
        patientName: f.patientName,
        phone: f.phone,
        doctor: f.doctor,
        followupDate: f.followupDate,
        followupTime: f.followupTime,
        daysOverdue: 0,
        rescheduleCount: f.rescheduleCount || 0,
        status: f.status,
      }))

    // Reviews list & summary
    const allReviews = reviews.map((r) => ({
      feedbackId: r.feedbackId,
      patientRecordId: r.patientRecordId || r.patientId,
      patientId: r.patientId,
      patientName: r.patientName,
      doctorName: r.doctorName,
      phone: r.phone,
      visitDate: r.visitDate,
      submittedAt: r.submittedAt ? r.submittedAt.toISOString() : null,
      submittedDate: r.submittedAt ? r.submittedAt.toISOString().split('T')[0] : null,
      submittedTime: r.submittedAt ? r.submittedAt.toTimeString().split(' ')[0] : null,
      status: r.status,
      rating: r.rating,
      reasons: r.reasons || [],
      comment: r.comment || '',
      googleRedirected: r.googleRedirected,
      reviewLinkOpened: r.reviewLinkOpened,
      whatsappSent: r.whatsappSent,
      snapshotVersion: '1.0',
      generatedAt: new Date().toISOString(),
      searchText: `${r.patientName} ${r.doctorName} ${r.comment} ${r.phone}`.toLowerCase(),
    }))

    const submittedReviewsList = reviews.filter((r) => r.status === 'Completed' && r.rating !== null)
    const avgRating =
      submittedReviewsList.length > 0
        ? Number(
            (
              submittedReviewsList.reduce((acc, curr) => acc + (curr.rating || 0), 0) /
              submittedReviewsList.length
            ).toFixed(1)
          )
        : 4.8

    const reviewSummary = {
      totalReviewRequests: reviews.length,
      reviewsSubmitted: submittedReviewsList.length,
      pendingReviews: reviews.length - submittedReviewsList.length,
      averageRating: avgRating,
    }

    return res.json({
      success: true,
      data: {
        cards,
        recentRegistrations,
        activityFeed,
        consultationPending,
        todayFollowups,
        activePrescriptions,
        patientSearchIndex,
        generatedAt: new Date().toISOString(),
        totalPatientSummary: {
          totalPatients,
          activePatients: activePatientsCount,
          patientsWithActiveFollowup: todayFollowupsCount + upcomingFollowups.length,
          patientsRequiringAttention: missedFollowupsCount + consultationPendingCount,
        },
        totalPatientsAvailable,
        activePatientSummary: {
          totalPatients,
          activePatients: activePatientsCount,
          patientsWithActiveFollowup: todayFollowupsCount + upcomingFollowups.length,
          patientsRequiringAttention: missedFollowupsCount,
        },
        totalActivePatients,
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
        reviewSummary,
        allReviews,
      },
    })
  } catch (error: any) {
    console.error('[Dashboard Route Error]', error)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message || 'Failed to generate dashboard data' },
    })
  }
})

// GET /search
router.get('/search', async (req: Request, res: Response): Promise<any> => {
  try {
    const q = ((req.query.q as string) || '').toLowerCase().trim()
    const patients = await Patient.find()

    const filtered = patients.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.phone.includes(q)
    )

    const results = filtered.map((p) => ({
      patientId: p.patientId,
      fullName: p.name,
      displayName: p.name,
      phone: p.phone,
      doctor: p.doctor,
      status: p.status,
      gender: p.gender,
      age: p.age,
      registrationDate: p.registrationDate,
      searchText: `${p.patientId} ${p.name} ${p.phone} ${p.doctor} ${p.status}`.toLowerCase(),
    }))

    return res.json({
      success: true,
      data: results,
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'SEARCH_ERROR', message: error.message },
    })
  }
})

export default router
