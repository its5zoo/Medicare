import { Router, Request, Response } from 'express'
import { Patient } from '../models/Patient'
import { Consultation } from '../models/Consultation'
import { Prescription } from '../models/Prescription'
import { FollowUp } from '../models/FollowUp'
import { Review } from '../models/Review'
import { Activity } from '../models/Activity'

const router = Router()

interface PatientAuditItem {
  id: string
  patientId: string
  name: string
  phone: string
  age: number
  gender: string
  address: string
  doctor: string
  status: string
  hasPhone: boolean
  hasAddress: boolean
  hasDoctor: boolean
  hasAgeGender: boolean
  hasConsultation: boolean
  hasPrescription: boolean
  hasFollowUp: boolean
  hasReview: boolean
  completenessScore: number
  missingFields: string[]
  completedFields: string[]
  riskLevel: 'high' | 'medium' | 'low'
  registrationDate: string
}

function calculateScore(flags: boolean[]): number {
  const trueCount = flags.filter(Boolean).length
  return Math.round((trueCount / flags.length) * 100)
}

// GET /data-health or /api/data-health
router.get('/', async (_req: Request, res: Response): Promise<any> => {
  try {
    const [patients, consultations, prescriptions, followups, reviews] = await Promise.all([
      Patient.find().sort({ createdAt: -1 }),
      Consultation.find(),
      Prescription.find(),
      FollowUp.find(),
      Review.find(),
    ])

    const totalPatients = patients.length

    // Build lookup maps for relations
    const consultationMap = new Set(consultations.map((c) => c.patientId))
    const prescriptionMap = new Set(prescriptions.map((p) => p.patientId))
    const followUpMap = new Set(followups.map((f) => f.patientId))
    const reviewMap = new Set(reviews.map((r) => r.patientId))

    let totalScoreSum = 0
    let perfectRecordsCount = 0
    let missingPhoneCount = 0
    let missingAddressCount = 0
    let missingDoctorCount = 0
    let missingAgeGenderCount = 0
    let missingConsultationCount = 0
    let missingPrescriptionCount = 0
    let missingFollowUpCount = 0
    let missingReviewCount = 0

    const auditedPatients: PatientAuditItem[] = patients.map((p) => {
      const cleanPhone = (p.phone || '').trim().replace(/\D/g, '')
      const hasPhone = cleanPhone.length >= 10
      const hasAddress = Boolean(p.address && p.address.trim().length > 3)
      const hasDoctor = Boolean(p.doctor && p.doctor.trim().length > 0 && p.doctor !== 'Unassigned')
      const hasAgeGender = Boolean(p.age && p.age > 0 && p.gender && p.gender.trim().length > 0)
      const hasConsultation = consultationMap.has(p.patientId)
      const hasPrescription = prescriptionMap.has(p.patientId)
      const hasFollowUp = followUpMap.has(p.patientId)
      const hasReview = reviewMap.has(p.patientId)

      const flags = [
        hasPhone,
        hasAddress,
        hasDoctor,
        hasAgeGender,
        hasConsultation,
        hasPrescription,
        hasFollowUp,
        hasReview,
      ]

      const completenessScore = calculateScore(flags)
      totalScoreSum += completenessScore

      if (completenessScore === 100) perfectRecordsCount++
      if (!hasPhone) missingPhoneCount++
      if (!hasAddress) missingAddressCount++
      if (!hasDoctor) missingDoctorCount++
      if (!hasAgeGender) missingAgeGenderCount++
      if (!hasConsultation) missingConsultationCount++
      if (!hasPrescription) missingPrescriptionCount++
      if (!hasFollowUp) missingFollowUpCount++
      if (!hasReview) missingReviewCount++

      const missingFields: string[] = []
      const completedFields: string[] = []

      if (!hasPhone) missingFields.push('WhatsApp Number')
      else completedFields.push('WhatsApp Number')

      if (!hasAddress) missingFields.push('Address')
      else completedFields.push('Address')

      if (!hasDoctor) missingFields.push('Doctor Assigned')
      else completedFields.push('Doctor Assigned')

      if (!hasAgeGender) missingFields.push('Demographics')
      else completedFields.push('Demographics')

      if (!hasConsultation) missingFields.push('Consultation/Diagnosis')
      else completedFields.push('Consultation/Diagnosis')

      if (!hasPrescription) missingFields.push('Prescription')
      else completedFields.push('Prescription')

      if (!hasFollowUp) missingFields.push('Follow-Up Schedule')
      else completedFields.push('Follow-Up Schedule')

      if (!hasReview) missingFields.push('Feedback Review')
      else completedFields.push('Feedback Review')

      let riskLevel: 'high' | 'medium' | 'low' = 'low'
      if (completenessScore < 60 || !hasPhone || !hasDoctor) {
        riskLevel = 'high'
      } else if (completenessScore < 85) {
        riskLevel = 'medium'
      }

      return {
        id: p._id.toString(),
        patientId: p.patientId,
        name: p.name,
        phone: p.phone || '',
        age: p.age || 0,
        gender: p.gender || 'Unknown',
        address: p.address || '',
        doctor: p.doctor || 'Unassigned',
        status: p.status || 'Registered',
        hasPhone,
        hasAddress,
        hasDoctor,
        hasAgeGender,
        hasConsultation,
        hasPrescription,
        hasFollowUp,
        hasReview,
        completenessScore,
        missingFields,
        completedFields,
        riskLevel,
        registrationDate: p.registrationDate || new Date().toISOString().split('T')[0],
      }
    })

    const averageCompleteness = totalPatients > 0 ? Math.round(totalScoreSum / totalPatients) : 100
    const incompleteRecordsCount = totalPatients - perfectRecordsCount

    const calcFieldHealth = (missing: number, label: string, severity: 'critical' | 'high' | 'medium' | 'low') => {
      const complete = totalPatients - missing
      const percentage = totalPatients > 0 ? Math.round((complete / totalPatients) * 100) : 100
      const missingPercentage = totalPatients > 0 ? Math.round((missing / totalPatients) * 100) : 0
      return {
        label,
        total: totalPatients,
        completeCount: complete,
        missingCount: missing,
        percentage,
        missingPercentage,
        severity,
      }
    }

    const fieldHealth = {
      phone: calcFieldHealth(missingPhoneCount, 'WhatsApp / Phone Number', 'critical'),
      address: calcFieldHealth(missingAddressCount, 'Residential Address', 'medium'),
      doctor: calcFieldHealth(missingDoctorCount, 'Assigned Doctor', 'high'),
      demographics: calcFieldHealth(missingAgeGenderCount, 'Patient Demographics (Age/Gender)', 'medium'),
      consultation: calcFieldHealth(missingConsultationCount, 'Clinical Consultation & Diagnosis', 'high'),
      prescription: calcFieldHealth(missingPrescriptionCount, 'Active Prescription Schedule', 'medium'),
      followup: calcFieldHealth(missingFollowUpCount, 'Scheduled Follow-Up Appointment', 'medium'),
      review: calcFieldHealth(missingReviewCount, 'Patient Feedback & Review Rating', 'low'),
    }

    // Generate Contextual AI/Algorithmic Suggestions
    const suggestions = []

    if (missingPhoneCount > 0) {
      suggestions.push({
        id: 'fix-phone',
        type: 'CRITICAL',
        title: `${missingPhoneCount} Patients Missing Valid WhatsApp Numbers`,
        description:
          'Automated medicine reminders and follow-up alerts cannot reach these patients. Update their contact details immediately.',
        affectedCount: missingPhoneCount,
        fieldKey: 'phone',
        actionLabel: 'Filter by Missing Phone',
        filterValue: 'missing-phone',
      })
    }

    if (missingAddressCount > 0) {
      suggestions.push({
        id: 'fix-address',
        type: 'RECOMMENDED',
        title: `${missingAddressCount} Patients Have Blank Address Details`,
        description:
          'Completing patient addresses enables geographic analysis and home prescription delivery.',
        affectedCount: missingAddressCount,
        fieldKey: 'address',
        actionLabel: 'Filter by Missing Address',
        filterValue: 'missing-address',
      })
    }

    if (missingFollowUpCount > 0) {
      suggestions.push({
        id: 'fix-followup',
        type: 'CLINICAL',
        title: `${missingFollowUpCount} Patients Without Scheduled Follow-Up`,
        description:
          'Dermatology care requires proactive follow-ups. Schedule follow-ups to increase retention.',
        affectedCount: missingFollowUpCount,
        fieldKey: 'followup',
        actionLabel: 'Filter by Missing Follow-Up',
        filterValue: 'missing-followup',
      })
    }

    if (missingConsultationCount > 0) {
      suggestions.push({
        id: 'fix-consultation',
        type: 'WORKFLOW',
        title: `${missingConsultationCount} Registered Patients Awaiting Initial Consultation`,
        description:
          'Patients are registered but do not have an active skin problem or infection type recorded.',
        affectedCount: missingConsultationCount,
        fieldKey: 'consultation',
        actionLabel: 'Filter Awaiting Consultation',
        filterValue: 'missing-consultation',
      })
    }

    if (missingReviewCount > 0) {
      suggestions.push({
        id: 'fix-reviews',
        type: 'OPPORTUNITY',
        title: `${missingReviewCount} Patients Have Not Provided Post-Care Feedback`,
        description:
          'Send automated review collection links via WhatsApp to boost clinic ratings.',
        affectedCount: missingReviewCount,
        fieldKey: 'review',
        actionLabel: 'Filter by Missing Review',
        filterValue: 'missing-review',
      })
    }

    return res.json({
      success: true,
      data: {
        summary: {
          totalPatients,
          averageCompleteness,
          perfectRecordsCount,
          incompleteRecordsCount,
          perfectPercentage: totalPatients > 0 ? Math.round((perfectRecordsCount / totalPatients) * 100) : 100,
          incompletePercentage: totalPatients > 0 ? Math.round((incompleteRecordsCount / totalPatients) * 100) : 0,
          criticalErrorsCount: missingPhoneCount + missingDoctorCount,
        },
        fieldHealth,
        suggestions,
        patients: auditedPatients,
      },
    })
  } catch (error: any) {
    console.error('[Data Health Audit Error]', error)
    return res.status(500).json({
      success: false,
      error: { code: 'DATA_HEALTH_ERROR', message: error.message },
    })
  }
})

// POST /data-health/quick-fix
router.post('/quick-fix', async (req: Request, res: Response): Promise<any> => {
  try {
    const { patientId, name, phone, age, gender, address, doctor, status } = req.body

    if (!patientId) {
      return res.status(400).json({
        success: false,
        error: { code: 'VALIDATION_ERROR', message: 'patientId is required' },
      })
    }

    const patient = await Patient.findOne({ patientId })
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found' },
      })
    }

    if (name) patient.name = name.trim()
    if (phone) patient.phone = phone.trim()
    if (age) patient.age = Number(age)
    if (gender) patient.gender = gender.trim()
    if (address !== undefined) patient.address = address.trim()
    if (doctor) patient.doctor = doctor.trim()
    if (status) patient.status = status.trim()

    await patient.save()

    await Activity.create({
      type: 'data_health_updated',
      title: 'Patient Record Completed',
      description: `Data quality audit fix applied for ${patient.name} (${patient.patientId})`,
      patientCode: patient.patientId,
      priority: 'normal',
    })

    return res.json({
      success: true,
      data: patient,
      message: 'Patient record successfully updated and data quality score improved.',
    })
  } catch (error: any) {
    console.error('[Data Health Quick Fix Error]', error)
    return res.status(500).json({
      success: false,
      error: { code: 'UPDATE_ERROR', message: error.message },
    })
  }
})

// POST /data-health/auto-normalize
router.post('/auto-normalize', async (_req: Request, res: Response): Promise<any> => {
  try {
    const patients = await Patient.find()
    let updatedCount = 0

    for (const p of patients) {
      let changed = false

      // Normalize phone
      let rawPhone = (p.phone || '').trim().replace(/\D/g, '')
      if (rawPhone.length === 10) {
        rawPhone = `91${rawPhone}`
        p.phone = rawPhone
        changed = true
      }

      // Default doctor if unassigned
      if (!p.doctor || p.doctor.trim() === '' || p.doctor === 'Unassigned') {
        p.doctor = 'Dr. Priya Sharma'
        changed = true
      }

      // Default age/gender if missing
      if (!p.age || p.age <= 0) {
        p.age = 28
        changed = true
      }
      if (!p.gender || p.gender.trim() === '') {
        p.gender = 'Female'
        changed = true
      }

      if (changed) {
        await p.save()
        updatedCount++
      }
    }

    return res.json({
      success: true,
      data: { updatedCount },
      message: `Standardized ${updatedCount} patient records with clean phone formats and valid defaults.`,
    })
  } catch (error: any) {
    return res.status(500).json({
      success: false,
      error: { code: 'NORMALIZE_ERROR', message: error.message },
    })
  }
})

export default router
