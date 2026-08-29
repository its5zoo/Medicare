import type {
  ActivityItem,
  Consultation,
  Doctor,
  FollowUp,
  Patient,
  Prescription,
} from './types'

export const doctors: Doctor[] = [
  {
    id: 'DOC-001',
    name: 'Dr. Priya Sharma',
    specialization: 'Dermatologist',
    phone: '+91 98765 43210',
    email: 'priya.sharma@dematclinic.in',
  },
  {
    id: 'DOC-002',
    name: 'Dr. Rahul Mehta',
    specialization: 'Cosmetic Dermatologist',
    phone: '+91 98765 43211',
    email: 'rahul.mehta@dematclinic.in',
  },
  {
    id: 'DOC-003',
    name: 'Dr. Ananya Reddy',
    specialization: 'Pediatric Dermatologist',
    phone: '+91 98765 43212',
    email: 'ananya.reddy@dematclinic.in',
  },
  {
    id: 'DOC-004',
    name: 'Dr. Vikram Singh',
    specialization: 'Dermatologist',
    phone: '+91 98765 43213',
    email: 'vikram.singh@dematclinic.in',
  },
]

const firstNames = [
  'Md Faizaan', 'Aisha', 'Rahul', 'Priya', 'Arjun', 'Sneha', 'Vikram', 'Kavya',
  'Imran', 'Fatima', 'Rohan', 'Deepika', 'Sanjay', 'Meera', 'Aditya', 'Nisha',
  'Karan', 'Pooja', 'Amit', 'Shreya', 'Rajesh', 'Anjali', 'Suresh', 'Divya',
  'Manoj', 'Lakshmi', 'Harish', 'Swati', 'Naveen', 'Ritu', 'Gaurav', 'Neha',
  'Ashok', 'Tanvi', 'Prakash', 'Simran', 'Dinesh', 'Kritika', 'Sunil', 'Ananya',
  'Vivek', 'Pallavi', 'Ramesh', 'Isha', 'Mahesh', 'Sakshi', 'Anil', 'Riya',
  'Sandeep', 'Madhuri', 'Tarun',
]

const lastNames = [
  'Fatah', 'Khan', 'Patel', 'Sharma', 'Gupta', 'Reddy', 'Singh', 'Verma',
  'Malik', 'Joshi', 'Desai', 'Nair', 'Iyer', 'Chopra', 'Kapoor', 'Mehta',
  'Rao', 'Pillai', 'Bhat', 'Saxena', 'Mishra', 'Pandey', 'Yadav', 'Thakur',
  'Chauhan', 'Dubey', 'Tiwari', 'Agarwal', 'Sethi', 'Khanna', 'Bansal', 'Arora',
  'Gill', 'Kaur', 'Hussain', 'Ansari', 'Qureshi', 'Mirza', 'Begum', 'Syed',
  'Das', 'Sen', 'Bose', 'Mukherjee', 'Banerjee', 'Chatterjee', 'Roy', 'Ghosh',
  'Menon', 'Krishnan', 'Narayan',
]

const addresses = [
  '12 MG Road, Bangalore',
  '45 Park Street, Kolkata',
  '78 Connaught Place, Delhi',
  '23 Marine Drive, Mumbai',
  '56 Jubilee Hills, Hyderabad',
  '89 Anna Salai, Chennai',
  '34 FC Road, Pune',
  '67 SG Highway, Ahmedabad',
  '91 Civil Lines, Jaipur',
  '15 Mall Road, Lucknow',
]

const skinProblems = [
  'Acne Vulgaris', 'Atopic Dermatitis', 'Psoriasis', 'Melasma', 'Tinea Corporis',
  'Vitiligo', 'Urticaria', 'Rosacea', 'Seborrheic Dermatitis', 'Contact Dermatitis',
]

const infectionTypes = [
  'Bacterial', 'Fungal', 'Viral', 'Non-infectious', 'Mixed', 'None',
]

const medicines = [
  { name: 'Isotretinoin 20mg', dosage: '20mg', timing: 'After dinner', frequency: 'Once daily', duration: '3 months' },
  { name: 'Clindamycin Gel 1%', dosage: 'Apply thin layer', timing: 'Morning & Night', frequency: 'Twice daily', duration: '6 weeks' },
  { name: 'Betamethasone Cream', dosage: 'Apply locally', timing: 'Night', frequency: 'Once daily', duration: '2 weeks' },
  { name: 'Hydroquinone 4%', dosage: 'Pea-sized amount', timing: 'Night', frequency: 'Once daily', duration: '8 weeks' },
  { name: 'Terbinafine 250mg', dosage: '250mg', timing: 'After breakfast', frequency: 'Once daily', duration: '4 weeks' },
  { name: 'Tacrolimus Ointment', dosage: 'Apply locally', timing: 'Twice daily', frequency: 'Twice daily', duration: '4 weeks' },
  { name: 'Doxycycline 100mg', dosage: '100mg', timing: 'After lunch', frequency: 'Once daily', duration: '8 weeks' },
  { name: 'Ketoconazole Shampoo', dosage: '5ml', timing: 'Alternate days', frequency: '3x weekly', duration: '6 weeks' },
]

const statuses: Patient['status'][] = [
  'Registered', 'Consultation Pending', 'Active Treatment', 'Follow-Up Due', 'Completed',
]

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomPhone(index: number): string {
  return `+91 9${String(100000000 + index * 1234567).slice(0, 9)}`
}

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

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export const patients: Patient[] = Array.from({ length: 50 }, (_, i) => {
  const id = `DERM-${String(1001 + i).padStart(4, '0')}`
  const gender = randomItem(['Male', 'Female', 'Other'] as const)
  const status = statuses[i % statuses.length]
  const regDays = Math.floor(Math.random() * 90) + 1

  return {
    id,
    name: `${firstNames[i]} ${lastNames[i]}`,
    age: 18 + (i % 52),
    gender,
    phone: randomPhone(i),
    whatsapp: randomPhone(i),
    address: randomItem(addresses),
    doctorId: doctors[i % doctors.length].id,
    registrationDate: daysAgo(regDays),
    status,
    conditions: [randomItem(skinProblems)],
  }
})

export const consultations: Consultation[] = Array.from({ length: 10 }, (_, i) => {
  const patient = patients[i + 5]
  return {
    id: `CON-${String(2001 + i).padStart(4, '0')}`,
    patientId: patient.id,
    doctorId: patient.doctorId,
    skinProblem: randomItem(skinProblems),
    infectionType: randomItem(infectionTypes),
    diagnosisDate: daysAgo(Math.floor(Math.random() * 30)),
    doctorNotes: 'Patient responded well to initial treatment. Continue current regimen and monitor for side effects.',
    status: i < 3 ? 'Pending' : 'Completed',
    createdAt: daysAgo(Math.floor(Math.random() * 20) + 5),
  }
})

export const prescriptions: Prescription[] = Array.from({ length: 20 }, (_, i) => {
  const patient = patients[i % 30]
  const med = medicines[i % medicines.length]
  const startDays = Math.floor(Math.random() * 30)
  const endDays = startDays - Math.floor(Math.random() * 60) - 14

  return {
    id: `RX-${String(3001 + i).padStart(4, '0')}`,
    patientId: patient.id,
    doctorId: patient.doctorId,
    consultationId: consultations[i % consultations.length]?.id ?? `CON-2001`,
    medicineName: med.name,
    dosage: med.dosage,
    timing: med.timing,
    frequency: med.frequency,
    duration: med.duration,
    instructions: 'Take as directed. Avoid sun exposure. Report any adverse reactions immediately.',
    reminder: i % 3 !== 0,
    startDate: daysAgo(startDays),
    endDate: daysAgo(endDays),
    status: i < 12 ? 'Active' : i < 17 ? 'Completed' : 'Discontinued',
  }
})

export const followUps: FollowUp[] = Array.from({ length: 15 }, (_, i) => {
  const patient = patients[i + 10]
  const isToday = i < 5
  const isMissed = i >= 10 && i < 13
  const isUpcoming = i >= 5 && i < 10

  let date: string
  let status: FollowUp['status']

  if (isToday) {
    date = today()
    status = 'Scheduled'
  } else if (isMissed) {
    date = daysAgo(Math.floor(Math.random() * 5) + 1)
    status = 'Missed'
  } else if (isUpcoming) {
    date = daysFromNow(Math.floor(Math.random() * 14) + 1)
    status = 'Scheduled'
  } else {
    date = daysAgo(Math.floor(Math.random() * 14) + 7)
    status = 'Completed'
  }

  const times = ['09:00', '09:30', '10:00', '10:30', '11:00', '14:00', '14:30', '15:00', '16:00', '17:00']

  return {
    id: `FU-${String(4001 + i).padStart(4, '0')}`,
    patientId: patient.id,
    doctorId: patient.doctorId,
    date,
    time: times[i % times.length],
    status,
    notes: status === 'Completed' ? 'Follow-up completed successfully.' : undefined,
  }
})

export const activities: ActivityItem[] = [
  { id: 'ACT-001', type: 'patient_registered', title: 'Patient Registered', description: 'Md Faizaan Fatah registered with Dr. Priya Sharma', timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), patientId: 'DERM-1040' },
  { id: 'ACT-002', type: 'consultation_created', title: 'Consultation Created', description: 'New consultation for Acne Vulgaris - DERM-1023', timestamp: new Date(Date.now() - 1000 * 60 * 45).toISOString(), patientId: 'DERM-1023' },
  { id: 'ACT-003', type: 'prescription_activated', title: 'Prescription Activated', description: 'Isotretinoin 20mg activated for DERM-1015', timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), patientId: 'DERM-1015' },
  { id: 'ACT-004', type: 'follow_up_scheduled', title: 'Follow-Up Scheduled', description: 'Follow-up scheduled for DERM-1012 on today at 10:30 AM', timestamp: new Date(Date.now() - 1000 * 60 * 120).toISOString(), patientId: 'DERM-1012' },
  { id: 'ACT-005', type: 'reminder_sent', title: 'Reminder Sent', description: 'WhatsApp reminder sent to DERM-1008', timestamp: new Date(Date.now() - 1000 * 60 * 180).toISOString(), patientId: 'DERM-1008' },
  { id: 'ACT-006', type: 'consultation_completed', title: 'Consultation Completed', description: 'Consultation completed for Psoriasis - DERM-1005', timestamp: new Date(Date.now() - 1000 * 60 * 240).toISOString(), patientId: 'DERM-1005' },
  { id: 'ACT-007', type: 'follow_up_completed', title: 'Follow-Up Completed', description: 'Follow-up marked complete for DERM-1003', timestamp: new Date(Date.now() - 1000 * 60 * 300).toISOString(), patientId: 'DERM-1003' },
  { id: 'ACT-008', type: 'patient_registered', title: 'Patient Registered', description: 'Sneha Verma registered with Dr. Rahul Mehta', timestamp: new Date(Date.now() - 1000 * 60 * 360).toISOString(), patientId: 'DERM-1006' },
]

export function getDoctorById(id: string): Doctor | undefined {
  return doctors.find((d) => d.id === id)
}

export function getPatientById(id: string): Patient | undefined {
  return patients.find((p) => p.id === id)
}

export function getConsultationsByPatient(patientId: string): Consultation[] {
  return consultations.filter((c) => c.patientId === patientId)
}

export function getPrescriptionsByPatient(patientId: string): Prescription[] {
  return prescriptions.filter((p) => p.patientId === patientId)
}

export function getFollowUpsByPatient(patientId: string): FollowUp[] {
  return followUps.filter((f) => f.patientId === patientId)
}

export function searchPatients(query: string): Patient[] {
  const q = query.toLowerCase().trim()
  if (!q) return []
  return patients.filter(
    (p) =>
      p.id.toLowerCase().includes(q) ||
      p.name.toLowerCase().includes(q) ||
      p.phone.replace(/\s/g, '').includes(q.replace(/\s/g, ''))
  ).slice(0, 8)
}

export function getDashboardStats() {
  const todayStr = today()
  return {
    totalPatients: patients.length,
    consultationPending: patients.filter((p) => p.status === 'Consultation Pending').length,
    activePatients: patients.filter((p) => p.status === 'Active Treatment').length,
    todaysFollowUps: followUps.filter((f) => f.date === todayStr && f.status === 'Scheduled').length,
    missedFollowUps: followUps.filter((f) => f.status === 'Missed').length,
    activePrescriptions: prescriptions.filter((p) => p.status === 'Active').length,
  }
}

export function getRecentRegistrations(limit = 8): Patient[] {
  return [...patients]
    .sort((a, b) => new Date(b.registrationDate).getTime() - new Date(a.registrationDate).getTime())
    .slice(0, limit)
}

export function getConsultationPendingPatients(): Patient[] {
  return patients.filter((p) => p.status === 'Consultation Pending')
}

export function getTodaysFollowUps(): FollowUp[] {
  return followUps.filter((f) => f.date === today() && f.status === 'Scheduled')
}

export function getUpcomingFollowUps(): FollowUp[] {
  return followUps.filter((f) => f.date > today() && f.status === 'Scheduled')
}

export function getMissedFollowUpsList(): FollowUp[] {
  return followUps.filter((f) => f.status === 'Missed')
}

export function getCompletedFollowUps(): FollowUp[] {
  return followUps.filter((f) => f.status === 'Completed')
}

export function getActivePrescriptions(): Prescription[] {
  return prescriptions.filter((p) => p.status === 'Active')
}

export function getCompletedPrescriptions(): Prescription[] {
  return prescriptions.filter((p) => p.status === 'Completed' || p.status === 'Discontinued')
}

export function getActivePatientsList(): Patient[] {
  return patients.filter((p) => p.status === 'Active Treatment' || p.status === 'Follow-Up Due')
}

export const kpiSparklines: Record<string, number[]> = {
  totalPatients: [42, 44, 45, 46, 47, 48, 49, 50],
  consultationPending: [8, 9, 7, 10, 9, 8, 10, 9],
  activePatients: [18, 19, 20, 21, 22, 23, 24, 25],
  todaysFollowUps: [3, 4, 5, 4, 6, 5, 5, 5],
  missedFollowUps: [2, 3, 2, 4, 3, 3, 3, 3],
  activePrescriptions: [15, 16, 17, 18, 19, 20, 19, 20],
}
