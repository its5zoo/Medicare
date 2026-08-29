import mongoose from 'mongoose'
import { connectDB } from './config/db'
import { User } from './models/User'
import { Patient } from './models/Patient'
import { Consultation } from './models/Consultation'
import { Prescription } from './models/Prescription'
import { FollowUp } from './models/FollowUp'
import { Review } from './models/Review'
import { Activity } from './models/Activity'

const firstNames = [
  'Md Faizaan', 'Aisha', 'Rahul', 'Priya', 'Arjun', 'Sneha', 'Vikram', 'Kavya',
  'Imran', 'Fatima', 'Rohan', 'Deepika', 'Sanjay', 'Meera', 'Aditya', 'Nisha',
  'Karan', 'Pooja', 'Amit', 'Shreya', 'Rajesh', 'Anjali', 'Suresh', 'Divya',
  'Manoj', 'Lakshmi', 'Harish', 'Swati', 'Naveen', 'Ritu', 'Gaurav', 'Neha',
  'Ashok', 'Tanvi', 'Prakash', 'Simran', 'Dinesh', 'Kritika', 'Sunil', 'Ananya',
]

const lastNames = [
  'Fatah', 'Khan', 'Patel', 'Sharma', 'Gupta', 'Reddy', 'Singh', 'Verma',
  'Malik', 'Joshi', 'Desai', 'Nair', 'Iyer', 'Chopra', 'Kapoor', 'Mehta',
  'Rao', 'Pillai', 'Bhat', 'Saxena', 'Mishra', 'Pandey', 'Yadav', 'Thakur',
  'Chauhan', 'Dubey', 'Tiwari', 'Agarwal', 'Sethi', 'Khanna', 'Bansal', 'Arora',
]

const addresses = [
  '12 MG Road, Bangalore', '45 Park Street, Kolkata', '78 Connaught Place, Delhi',
  '23 Marine Drive, Mumbai', '56 Jubilee Hills, Hyderabad', '89 Anna Salai, Chennai',
  '34 FC Road, Pune', '67 SG Highway, Ahmedabad', '91 Civil Lines, Jaipur',
]

const skinProblems = [
  'Acne Vulgaris', 'Atopic Dermatitis', 'Psoriasis', 'Melasma', 'Tinea Corporis',
  'Vitiligo', 'Urticaria', 'Rosacea', 'Seborrheic Dermatitis', 'Contact Dermatitis',
]

const doctors = [
  'Dr. Priya Sharma',
  'Dr. Rahul Mehta',
  'Dr. Ananya Reddy',
  'Dr. Vikram Singh',
]

const medicines = [
  { name: 'Isotretinoin 20mg', dosage: '20mg', timing: ['Night'], frequency: 'Once daily', durationDays: 90 },
  { name: 'Clindamycin Gel 1%', dosage: 'Apply thin layer', timing: ['Morning', 'Night'], frequency: 'Twice daily', durationDays: 42 },
  { name: 'Betamethasone Cream', dosage: 'Apply locally', timing: ['Night'], frequency: 'Once daily', durationDays: 14 },
  { name: 'Hydroquinone 4%', dosage: 'Pea-sized amount', timing: ['Night'], frequency: 'Once daily', durationDays: 60 },
  { name: 'Terbinafine 250mg', dosage: '250mg', timing: ['Morning'], frequency: 'Once daily', durationDays: 28 },
  { name: 'Tacrolimus Ointment', dosage: 'Apply locally', timing: ['Morning', 'Night'], frequency: 'Twice daily', durationDays: 30 },
  { name: 'Doxycycline 100mg', dosage: '100mg', timing: ['Afternoon'], frequency: 'Once daily', durationDays: 60 },
]

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

export async function seedDatabase() {
  await connectDB()

  console.log('[Seed] Checking database collections...')

  // 1. Seed Users
  const existingUsers = await User.countDocuments()
  if (existingUsers === 0) {
    console.log('[Seed] Creating default users...')
    await User.create([
      { username: 'admin', password: 'password123', fullName: 'Clinic Administrator', role: 'admin' },
      { username: 'doctor', password: 'password123', fullName: 'Dr. Priya Sharma', role: 'doctor' },
      { username: 'staff', password: 'password123', fullName: 'Front Desk Staff', role: 'staff' },
      { username: 'demo', password: 'password123', fullName: 'Dr. Rahul Mehta', role: 'doctor' },
    ])
    console.log('[Seed] Default users created (admin / password123, doctor / password123, demo / password123).')
  }

  // 2. Seed Patients
  const patientCount = await Patient.countDocuments()
  if (patientCount === 0) {
    console.log('[Seed] Seeding sample patients and clinical records...')
    const patientDocs = []
    const consultationDocs = []
    const prescriptionDocs = []
    const followUpDocs = []
    const reviewDocs = []

    const statuses = ['Registered', 'Consultation Pending', 'Active Treatment', 'Follow-Up Due', 'Completed']

    for (let i = 0; i < 40; i++) {
      const patientId = `DERM-${String(1001 + i).padStart(4, '0')}`
      const name = `${firstNames[i % firstNames.length]} ${lastNames[i % lastNames.length]}`
      const phone = `+91 90000 ${String(10001 + i).slice(1)}`
      const doctor = doctors[i % doctors.length]
      const status = statuses[i % statuses.length]
      const regDate = daysAgo(Math.floor(Math.random() * 60) + 1)
      const address = addresses[i % addresses.length]
      const gender = i % 2 === 0 ? 'Female' : 'Male'
      const age = 18 + (i % 45)

      patientDocs.push({
        patientId,
        name,
        phone,
        age,
        gender,
        address,
        doctor,
        status,
        registrationDate: regDate,
        lastVisitDate: status !== 'Registered' ? daysAgo(Math.floor(Math.random() * 15) + 1) : null,
      })

      // If active or completed, add a consultation
      if (status !== 'Registered') {
        const conditionId = `COND-${String(2001 + i).padStart(4, '0')}`
        const skinProb = skinProblems[i % skinProblems.length]
        const diagDate = daysAgo(Math.floor(Math.random() * 25) + 1)
        const fuDate = status === 'Follow-Up Due' ? new Date().toISOString().split('T')[0] : daysFromNow(7 + (i % 14))

        consultationDocs.push({
          conditionId,
          patientId,
          title: skinProb,
          infectionType: i % 3 === 0 ? 'Bacterial' : i % 3 === 1 ? 'Fungal' : 'Non-infectious',
          diagnosisDate: diagDate,
          followupDate: fuDate,
          followupTime: '10:30 AM',
          status: status === 'Completed' ? 'Resolved' : 'Active',
          clinicalNotes: `Patient diagnosed with ${skinProb}. Advised standard topical treatment and sun protection.`,
        })

        // Add 1-2 prescriptions
        const med = medicines[i % medicines.length]
        prescriptionDocs.push({
          prescriptionId: `RX-${String(3001 + i).padStart(4, '0')}`,
          patientId,
          conditionId,
          patientName: name,
          doctor,
          phone,
          medicineName: med.name,
          dosage: med.dosage,
          timing: med.timing,
          frequency: med.frequency,
          startDate: diagDate,
          endDate: daysFromNow(med.durationDays),
          durationDays: med.durationDays,
          instructions: 'Take as directed with water.',
          reminderActive: true,
          status: status === 'Completed' ? 'Completed' : 'Active',
        })

        // Add follow-up
        const fuStatus =
          status === 'Follow-Up Due'
            ? 'Today'
            : status === 'Completed'
            ? 'Completed'
            : i % 4 === 0
            ? 'Missed'
            : 'Upcoming'

        followUpDocs.push({
          followupId: `FU-${String(4001 + i).padStart(4, '0')}`,
          patientId,
          patientName: name,
          phone,
          doctor,
          followupDate: fuStatus === 'Today' ? new Date().toISOString().split('T')[0] : fuStatus === 'Missed' ? daysAgo(3) : daysFromNow(10),
          followupTime: '11:00 AM',
          type: 'Consultation Follow-Up',
          status: fuStatus,
          reason: `Review progress on ${skinProb}`,
          rescheduleCount: fuStatus === 'Missed' ? 1 : 0,
        })

        // Add review
        if (i % 2 === 0) {
          const isCompleted = i % 3 !== 0
          reviewDocs.push({
            feedbackId: `FB-${String(5001 + i).padStart(4, '0')}`,
            patientId,
            patientName: name,
            doctorName: doctor,
            phone,
            visitDate: diagDate,
            submittedAt: isCompleted ? new Date() : null,
            status: isCompleted ? 'Completed' : 'Pending',
            rating: isCompleted ? (4 + (i % 2)) : null,
            reasons: isCompleted ? ['Doctor helpful', 'Quick service'] : [],
            comment: isCompleted ? 'Very satisfied with the treatment results!' : '',
            googleRedirected: isCompleted,
            reviewLinkOpened: true,
            whatsappSent: true,
            token: `token-${patientId.toLowerCase()}-${i}`,
          })
        }
      }
    }

    await Patient.insertMany(patientDocs)
    await Consultation.insertMany(consultationDocs)
    await Prescription.insertMany(prescriptionDocs)
    await FollowUp.insertMany(followUpDocs)
    await Review.insertMany(reviewDocs)

    // Seed Activities
    await Activity.create([
      { type: 'patient_registered', title: 'Patient Registered', description: 'Md Faizaan Fatah registered with Dr. Priya Sharma', patientCode: 'DERM-1001', priority: 'normal' },
      { type: 'consultation_created', title: 'Consultation Created', description: 'New consultation for Acne Vulgaris - DERM-1002', patientCode: 'DERM-1002', priority: 'normal' },
      { type: 'prescription_activated', title: 'Prescription Activated', description: 'Isotretinoin 20mg activated for DERM-1003', patientCode: 'DERM-1003', priority: 'normal' },
      { type: 'follow_up_scheduled', title: 'Follow-Up Scheduled', description: 'Follow-up scheduled for DERM-1004 today at 10:30 AM', patientCode: 'DERM-1004', priority: 'high' },
      { type: 'reminder_sent', title: 'Reminder Sent', description: 'WhatsApp reminder sent to DERM-1005', patientCode: 'DERM-1005', priority: 'low' },
    ])

    console.log('[Seed] MongoDB successfully populated with sample data!')
  } else {
    console.log(`[Seed] Database already contains ${patientCount} patients. Skipping mock population.`)
  }
}

if (process.argv[1] && process.argv[1].endsWith('seed.ts')) {
  seedDatabase()
    .then(() => {
      console.log('[Seed] Done!')
      process.exit(0)
    })
    .catch((err) => {
      console.error('[Seed] Error:', err)
      process.exit(1)
    })
}
