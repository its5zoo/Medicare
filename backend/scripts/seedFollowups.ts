import dotenv from 'dotenv'
dotenv.config()
import mongoose from 'mongoose'
import { connectDB } from '../config/db.js'
import { Patient } from '../models/Patient.js'
import { FollowUp } from '../models/FollowUp.js'
import { Activity } from '../models/Activity.js'

function daysAgo(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() - days)
  return d.toISOString().split('T')[0]
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

const followUpReasons = [
  'Acne Vulgaris - 4 Week Treatment Review',
  'Post-Chemical Peel Skin Assessment',
  'Melasma Pigmentation Response Check',
  'Psoriasis Topical Steroid Tapering Check',
  'Atopic Dermatitis Flare-up Evaluation',
  'Vitiligo Phototherapy Progress Review',
  'Tinea Corporis Antifungal Course Completion',
  'Laser Hair Reduction Follow-Up Session',
  'Rosacea Erythema & Trigger Review',
  'Contact Dermatitis Patch Test Results Discussion',
  'Seborrheic Dermatitis Scalp Check',
  'Isotretinoin Monthly LFT & Lipid Monitoring Check',
]

const doctors = [
  'Dr. Priya Sharma',
  'Dr. Rahul Mehta',
  'Dr. Ananya Reddy',
  'Dr. Vikram Singh',
]

const timeSlots = [
  '09:30 AM',
  '10:00 AM',
  '10:30 AM',
  '11:15 AM',
  '11:45 AM',
  '12:30 PM',
  '02:00 PM',
  '02:30 PM',
  '03:15 PM',
  '04:00 PM',
  '04:45 PM',
  '05:30 PM',
]

export async function seedFollowUps() {
  await connectDB()
  console.log('[FollowUp Seed] Connected to database...')

  // Fetch all patients
  const patients = await Patient.find()
  if (patients.length === 0) {
    console.log('[FollowUp Seed] No patients found in DB. Please run seeder first.')
    return
  }

  console.log(`[FollowUp Seed] Found ${patients.length} patients. Refreshing FollowUp records...`)

  // Remove existing followups to ensure a clean, rich dataset
  await FollowUp.deleteMany({})

  const todayStr = new Date().toISOString().split('T')[0]
  const followupDocs = []
  let counter = 1

  // 1. TODAY'S Follow-ups (8-10 follow-ups for today)
  for (let i = 0; i < Math.min(10, patients.length); i++) {
    const p = patients[i]
    const fuId = `FU-${String(4000 + counter++).padStart(4, '0')}`
    const reason = followUpReasons[i % followUpReasons.length]
    const doctor = p.doctor || doctors[i % doctors.length]
    const time = timeSlots[i % timeSlots.length]

    followupDocs.push({
      followupId: fuId,
      patientId: p.patientId,
      patientName: p.name,
      phone: p.phone,
      doctor: doctor,
      followupDate: todayStr,
      followupTime: time,
      type: i % 3 === 0 ? 'Urgent Review' : 'Consultation Follow-Up',
      status: 'Today',
      reason: reason,
      notes: `Scheduled appointment with ${doctor} for ${reason}.`,
      rescheduleCount: i === 2 ? 1 : 0,
      rescheduleReason: i === 2 ? 'Patient requested morning slot' : undefined,
    })
  }

  // 2. UPCOMING Follow-ups (12-15 upcoming follow-ups for future dates)
  for (let i = 10; i < Math.min(25, patients.length); i++) {
    const p = patients[i]
    const fuId = `FU-${String(4000 + counter++).padStart(4, '0')}`
    const reason = followUpReasons[i % followUpReasons.length]
    const doctor = p.doctor || doctors[i % doctors.length]
    const futureDays = 1 + ((i - 10) % 14) // 1 to 14 days in future
    const date = daysFromNow(futureDays)
    const time = timeSlots[i % timeSlots.length]

    followupDocs.push({
      followupId: fuId,
      patientId: p.patientId,
      patientName: p.name,
      phone: p.phone,
      doctor: doctor,
      followupDate: date,
      followupTime: time,
      type: i % 4 === 0 ? 'Post-Procedure Check' : 'Consultation Follow-Up',
      status: 'Upcoming',
      reason: reason,
      notes: `Routine follow-up booked for ${date} at ${time}.`,
      rescheduleCount: i === 12 ? 1 : 0,
      rescheduleReason: i === 12 ? 'Rescheduled per patient travel request' : undefined,
    })
  }

  // 3. MISSED Follow-ups (6-8 missed follow-ups from recent past)
  for (let i = 25; i < Math.min(32, patients.length); i++) {
    const p = patients[i]
    const fuId = `FU-${String(4000 + counter++).padStart(4, '0')}`
    const reason = followUpReasons[i % followUpReasons.length]
    const doctor = p.doctor || doctors[i % doctors.length]
    const pastDays = 1 + ((i - 25) % 7) // 1 to 7 days ago
    const date = daysAgo(pastDays)
    const time = timeSlots[i % timeSlots.length]

    followupDocs.push({
      followupId: fuId,
      patientId: p.patientId,
      patientName: p.name,
      phone: p.phone,
      doctor: doctor,
      followupDate: date,
      followupTime: time,
      type: 'Consultation Follow-Up',
      status: 'Missed',
      reason: reason,
      notes: 'Patient did not arrive at scheduled time. Clinic coordinator attempted callback.',
      rescheduleCount: 1,
      rescheduleReason: 'No show. Follow-up reminder pending.',
    })
  }

  // 4. COMPLETED Follow-ups (8-10 completed records with clinical outcome notes)
  for (let i = 32; i < Math.min(40, patients.length); i++) {
    const p = patients[i]
    const fuId = `FU-${String(4000 + counter++).padStart(4, '0')}`
    const reason = followUpReasons[i % followUpReasons.length]
    const doctor = p.doctor || doctors[i % doctors.length]
    const pastDays = 3 + ((i - 32) * 2)
    const date = daysAgo(pastDays)
    const time = timeSlots[i % timeSlots.length]

    followupDocs.push({
      followupId: fuId,
      patientId: p.patientId,
      patientName: p.name,
      phone: p.phone,
      doctor: doctor,
      followupDate: date,
      followupTime: time,
      type: 'Consultation Follow-Up',
      status: 'Completed',
      reason: reason,
      notes: 'Patient reviewed successfully. Lesions resolved >80%. Advised continuing maintenance sunscreen and hydration.',
      completedAt: new Date(new Date(date).getTime() + 1000 * 60 * 60 * 12),
      rescheduleCount: 0,
    })
  }

  await FollowUp.insertMany(followupDocs)
  console.log(`[FollowUp Seed] Successfully created ${followupDocs.length} dummy follow-ups!`)

  // Add activity records for recent follow-up events
  await Activity.create([
    {
      type: 'follow_up_scheduled',
      title: 'Follow-Up Scheduled (Today)',
      description: `Today's follow-up queue populated for ${patients[0]?.name || 'Patient'} at 09:30 AM with Dr. Priya Sharma`,
      patientCode: patients[0]?.patientId || 'DERM-1001',
      priority: 'high',
    },
    {
      type: 'follow_up_rescheduled',
      title: 'Follow-Up Rescheduled',
      description: `Follow-up for ${patients[2]?.name || 'Patient'} rescheduled to 10:30 AM today per request`,
      patientCode: patients[2]?.patientId || 'DERM-1003',
      priority: 'normal',
    },
    {
      type: 'follow_up_completed',
      title: 'Follow-Up Completed',
      description: `Follow-up successfully completed for ${patients[32]?.name || 'Patient'} by Dr. Rahul Mehta`,
      patientCode: patients[32]?.patientId || 'DERM-1033',
      priority: 'normal',
    },
  ])

  console.log('[FollowUp Seed] Activity records logged.')
}

if (process.argv[1] && process.argv[1].includes('seedFollowups')) {
  seedFollowUps()
    .then(async () => {
      await mongoose.disconnect()
      console.log('Done!')
      process.exit(0)
    })
    .catch(async (e) => {
      console.error('Error seeding follow-ups:', e)
      await mongoose.disconnect()
      process.exit(1)
    })
}
