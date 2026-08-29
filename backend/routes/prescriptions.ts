import { Router, Request, Response } from 'express'
import { Prescription } from '../models/Prescription'
import { Patient } from '../models/Patient'
import { Activity } from '../models/Activity'

const router = Router()

// POST /prescriptions/create
router.post('/create', async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body
    const patientId = body.Patient_ID || body.patientId
    const conditionId = body.Condition_ID || body.conditionId || ''
    const medicineName = body.Medicine_Name || body.medicineName
    const dosage = body.Dosage || body.dosage || '1 dose'
    const timing = body.Timing || body.timing || ['Morning']
    const frequency = body.Frequency || body.frequency || 'Once daily'
    const startDate = body.Start_Date || body.startDate || new Date().toISOString().split('T')[0]
    const durationDays = Number(body.Duration_Days || body.durationDays || 14)
    const instructions = body.Instructions || body.instructions || ''
    const reminderActive = body.Reminder_Active === 'Yes' || body.reminderActive !== false

    const patient = await Patient.findOne({ patientId })
    if (!patient) {
      return res.status(404).json({ success: false, error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found' } })
    }

    const count = await Prescription.countDocuments()
    const rxId = `RX-${String(3001 + count).padStart(4, '0')}`

    const endD = new Date(startDate)
    endD.setDate(endD.getDate() + durationDays)

    const rx = await Prescription.create({
      prescriptionId: rxId,
      patientId,
      conditionId,
      patientName: patient.name,
      doctor: patient.doctor,
      phone: patient.phone,
      medicineName,
      dosage,
      timing,
      frequency,
      startDate,
      endDate: endD.toISOString().split('T')[0],
      durationDays,
      instructions,
      reminderActive,
      status: 'Active',
    })

    await Activity.create({
      type: 'prescription_activated',
      title: 'Prescription Activated',
      description: `${medicineName} prescribed for ${patient.name}`,
      patientCode: patient.patientId,
      priority: 'normal',
    })

    return res.json({
      success: true,
      data: rx,
      message: 'Prescription created successfully in MongoDB.',
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
})

// POST /prescriptions/update
router.post('/update', async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body
    const prescriptionId = body.Prescription_ID || body.prescriptionId

    const rx = await Prescription.findOne({ prescriptionId })
    if (!rx) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Prescription not found' } })
    }

    if (body.Dosage) rx.dosage = body.Dosage
    if (body.Timing) rx.timing = body.Timing
    if (body.Frequency) rx.frequency = body.Frequency
    if (body.Instructions) rx.instructions = body.Instructions
    if (body.Extend_Days) {
      rx.durationDays += Number(body.Extend_Days)
      const endD = new Date(rx.startDate)
      endD.setDate(endD.getDate() + rx.durationDays)
      rx.endDate = endD.toISOString().split('T')[0]
    }
    if (body.Replace_Duration) {
      rx.durationDays = Number(body.Replace_Duration)
      const endD = new Date(rx.startDate)
      endD.setDate(endD.getDate() + rx.durationDays)
      rx.endDate = endD.toISOString().split('T')[0]
    }

    await rx.save()

    return res.json({
      success: true,
      data: rx,
      message: 'Prescription updated successfully in MongoDB.',
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
})

// POST /prescriptions/discontinue
router.post('/discontinue', async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body
    const prescriptionId = body.Prescription_ID || body.prescriptionId

    const rx = await Prescription.findOne({ prescriptionId })
    if (!rx) {
      return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Prescription not found' } })
    }

    rx.status = 'Discontinued'
    rx.discontinueReason = body.Discontinue_Reason || body.reason || 'Discontinued by doctor'
    rx.discontinuedBy = body.Discontinued_By || 'Doctor'
    await rx.save()

    await Activity.create({
      type: 'prescription_discontinued',
      title: 'Prescription Discontinued',
      description: `${rx.medicineName} discontinued for ${rx.patientName}`,
      patientCode: rx.patientId,
      priority: 'normal',
    })

    return res.json({
      success: true,
      data: rx,
      message: 'Prescription discontinued in MongoDB.',
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
})

export default router
