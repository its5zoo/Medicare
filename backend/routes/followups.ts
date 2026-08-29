import { Router, Request, Response } from 'express'
import { FollowUp } from '../models/FollowUp'
import { Patient } from '../models/Patient'
import { Activity } from '../models/Activity'

const router = Router()

function extractPatientId(raw: string): string {
  const match = raw.match(/DERM-\d+/)
  return match ? match[0] : raw.split(' ')[0]
}

// POST /followups/manual
router.post('/manual', async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body
    const patientId = extractPatientId(body.Patient || body.patientId)
    const followupDate = body['Follow-Up Date'] || body.followupDate
    const followupTime = body['Follow-Up Time'] || body.followupTime || '10:00 AM'
    const reason = body['Follow-Up Reason'] || body.reason || 'Manual follow-up'
    const notes = body['Clinic Notes'] || body.notes || ''

    const patient = await Patient.findOne({ patientId })
    if (!patient) {
      return res.status(404).json({ success: false, error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found' } })
    }

    const count = await FollowUp.countDocuments()
    const fuId = `FU-${String(4001 + count).padStart(4, '0')}`
    const isToday = followupDate === new Date().toISOString().split('T')[0]

    const fu = await FollowUp.create({
      followupId: fuId,
      patientId: patient.patientId,
      patientName: patient.name,
      phone: patient.phone,
      doctor: patient.doctor,
      followupDate,
      followupTime,
      type: 'Manual Follow-Up',
      status: isToday ? 'Today' : 'Upcoming',
      reason,
      notes,
    })

    await Activity.create({
      type: 'follow_up_scheduled',
      title: 'Follow-Up Scheduled',
      description: `Follow-up scheduled for ${patient.name} on ${followupDate} at ${followupTime}`,
      patientCode: patient.patientId,
      priority: 'high',
    })

    return res.json({
      success: true,
      data: {
        patient: {
          code: patient.patientId,
          name: patient.name,
        },
        followup: {
          date: fu.followupDate,
          time: fu.followupTime,
          status: fu.status,
        },
      },
      message: 'Follow-up created successfully in MongoDB.',
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
})

// POST /followups/reschedule
router.post('/reschedule', async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body
    const patientId = extractPatientId(body.Patient || body.patientId)
    const newDate = body['Reschedule Follow-Up Date'] || body.followupDate
    const newTime = body['Follow-Up Time'] || body.followupTime || '10:00 AM'
    const reason = body['Reschedule Reason'] || body.reason || 'Rescheduled'

    const patient = await Patient.findOne({ patientId })
    if (!patient) {
      return res.status(404).json({ success: false, error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found' } })
    }

    const fu = await FollowUp.findOne({
      patientId: patient.patientId,
      status: { $in: ['Scheduled', 'Upcoming', 'Today', 'Missed'] },
    }).sort({ createdAt: -1 })

    if (fu) {
      fu.followupDate = newDate
      fu.followupTime = newTime
      fu.rescheduleReason = reason
      fu.rescheduleCount = (fu.rescheduleCount || 0) + 1
      fu.status = newDate === new Date().toISOString().split('T')[0] ? 'Today' : 'Upcoming'
      await fu.save()
    } else {
      const count = await FollowUp.countDocuments()
      await FollowUp.create({
        followupId: `FU-${String(4001 + count).padStart(4, '0')}`,
        patientId: patient.patientId,
        patientName: patient.name,
        phone: patient.phone,
        doctor: patient.doctor,
        followupDate: newDate,
        followupTime: newTime,
        status: newDate === new Date().toISOString().split('T')[0] ? 'Today' : 'Upcoming',
        rescheduleReason: reason,
        rescheduleCount: 1,
      })
    }

    await Activity.create({
      type: 'follow_up_rescheduled',
      title: 'Follow-Up Rescheduled',
      description: `Follow-up for ${patient.name} moved to ${newDate} at ${newTime}`,
      patientCode: patient.patientId,
      priority: 'normal',
    })

    return res.json({
      success: true,
      data: {
        patient: {
          code: patient.patientId,
          name: patient.name,
        },
        followup: {
          date: newDate,
          time: newTime,
          status: 'Rescheduled',
        },
      },
      message: 'Follow-up rescheduled in MongoDB.',
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
})

// POST /followups/complete
router.post('/complete', async (req: Request, res: Response): Promise<any> => {
  try {
    const body = req.body
    const patientId = extractPatientId(body.Patient || body.patientId)
    const status = body['Completion Status'] || 'Completed'
    const notes = body['Visit Notes'] || ''

    const patient = await Patient.findOne({ patientId })
    if (!patient) {
      return res.status(404).json({ success: false, error: { code: 'PATIENT_NOT_FOUND', message: 'Patient not found' } })
    }

    const fu = await FollowUp.findOne({
      patientId: patient.patientId,
      status: { $in: ['Scheduled', 'Upcoming', 'Today', 'Missed'] },
    }).sort({ createdAt: -1 })

    if (fu) {
      fu.status = 'Completed'
      fu.notes = notes || fu.notes
      fu.completedAt = new Date()
      await fu.save()
    }

    await Activity.create({
      type: 'follow_up_completed',
      title: 'Follow-Up Completed',
      description: `Follow-up completed for ${patient.name} (${status})`,
      patientCode: patient.patientId,
      priority: 'normal',
    })

    return res.json({
      success: true,
      data: {
        patient: {
          code: patient.patientId,
          name: patient.name,
        },
        followup: {
          date: fu?.followupDate || new Date().toISOString().split('T')[0],
          time: fu?.followupTime || '10:00 AM',
          status: 'Completed',
        },
      },
      message: 'Follow-up marked as completed in MongoDB.',
    })
  } catch (error: any) {
    return res.status(500).json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } })
  }
})

export default router
