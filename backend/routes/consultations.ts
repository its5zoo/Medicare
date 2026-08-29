import { Router, Request, Response } from 'express'
import { Patient } from '../models/Patient'
import { Consultation } from '../models/Consultation'
import { Prescription } from '../models/Prescription'
import { FollowUp } from '../models/FollowUp'
import { Activity } from '../models/Activity'

const router = Router()

// POST /consultations/create
router.post('/create', async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body
    const patientRaw = body.Patient || body.patientId || ''
    const skinProblem = body['Skin Problem'] || body.skinProblem || 'Dermatitis'
    const infectionType = body['Infection Type'] || body.infectionType || 'Non-infectious'
    const diagnosisDate = body['Diagnosis Date'] || body.diagnosisDate || new Date().toISOString().split('T')[0]
    const medicines = body.Medicines || body.medicines || []
    const followupDate = body['Follow-Up Date'] || body.followupDate || ''
    const followupTime = body['Follow-Up Time'] || body.followupTime || '10:30 AM'

    // Extract patient ID from string like "DERM-1001 - John Doe" or "DERM-1001"
    const patientIdMatch = patientRaw.match(/DERM-\d+/) || [patientRaw.split(' ')[0]]
    const patientId = patientIdMatch ? patientIdMatch[0] : patientRaw

    const patient = await Patient.findOne({ patientId })
    if (!patient) {
      return res.status(404).json({
        success: false,
        error: { code: 'PATIENT_NOT_FOUND', message: `Patient ${patientId} not found` },
      })
    }

    const conCount = await Consultation.countDocuments()
    const conditionId = `COND-${String(2001 + conCount).padStart(4, '0')}`

    // 1. Create Consultation
    await Consultation.create({
      conditionId,
      patientId: patient.patientId,
      title: skinProblem,
      infectionType,
      diagnosisDate,
      followupDate,
      followupTime,
      status: 'Active',
      clinicalNotes: `Consultation created for ${skinProblem}. Infection type: ${infectionType}.`,
    })

    // 2. Create Prescriptions
    const rxCount = await Prescription.countDocuments()
    const createdRxIds: string[] = []

    for (let idx = 0; idx < medicines.length; idx++) {
      const med = medicines[idx]
      const rxId = `RX-${String(3001 + rxCount + idx).padStart(4, '0')}`
      createdRxIds.push(rxId)

      const medName = med['Medicine Name'] || med.medicineName || 'Medicine'
      const dosage = med.Dosage || med.dosage || '1 tablet'
      const timing = med.Timing || med.timing || ['Morning']
      const frequency = med.Frequency || med.frequency || 'Once daily'
      const durationDays = Number(med['Duration (Days)'] || med.durationDays || 14)
      const instructions = med.Instructions || med.instructions || ''
      const reminder = med.Reminder === 'Yes' || med.reminder === true
      const startDate = med['Start Date'] || med.startDate || diagnosisDate

      const endD = new Date(startDate)
      endD.setDate(endD.getDate() + durationDays)
      const endDate = endD.toISOString().split('T')[0]

      await Prescription.create({
        prescriptionId: rxId,
        patientId: patient.patientId,
        conditionId,
        patientName: patient.name,
        doctor: patient.doctor,
        phone: patient.phone,
        medicineName: medName,
        dosage,
        timing,
        frequency,
        startDate,
        endDate,
        durationDays,
        instructions,
        reminderActive: reminder,
        status: 'Active',
      })
    }

    // 3. Create Follow-Up if date provided
    if (followupDate) {
      const fuCount = await FollowUp.countDocuments()
      const fuId = `FU-${String(4001 + fuCount).padStart(4, '0')}`
      const isToday = followupDate === new Date().toISOString().split('T')[0]

      await FollowUp.create({
        followupId: fuId,
        patientId: patient.patientId,
        patientName: patient.name,
        phone: patient.phone,
        doctor: patient.doctor,
        followupDate,
        followupTime,
        type: 'Consultation Follow-Up',
        status: isToday ? 'Today' : 'Upcoming',
        reason: `Follow-up for ${skinProblem}`,
      })
    }

    // 4. Update Patient Status
    patient.status = 'Active Treatment'
    patient.lastVisitDate = diagnosisDate
    await patient.save()

    // 5. Create Activity
    await Activity.create({
      type: 'consultation_created',
      title: 'Consultation Created',
      description: `Consultation recorded for ${skinProblem} - ${patient.name} (${patient.patientId})`,
      patientCode: patient.patientId,
      priority: 'high',
    })

    return res.json({
      success: true,
      data: {
        patient: {
          name: patient.name,
          code: patient.patientId,
        },
        condition: {
          id: conditionId,
        },
        Medicine: {
          count: medicines.length,
          ids: createdRxIds.join(', '),
        },
        followup: {
          date: followupDate,
          time: followupTime,
        },
      },
      message: 'Consultation and treatment plan created successfully in MongoDB.',
    })
  } catch (error: any) {
    console.error('[Consultation Create Error]', error)
    return res.status(500).json({
      success: false,
      error: { code: 'SERVER_ERROR', message: error.message },
    })
  }
})

export default router
