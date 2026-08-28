export type PatientStatus =
  | 'Registered'
  | 'Consultation Pending'
  | 'Active Treatment'
  | 'Follow-Up Due'
  | 'Completed'

export type PrescriptionStatus = 'Active' | 'Completed' | 'Discontinued' | 'Stopped'

export type FollowUpStatus =
  | 'Scheduled'
  | 'Completed'
  | 'Missed'
  | 'Rescheduled'
  | 'Cancelled'
  | 'Superseded'

export type ConsultationStatus = 'Pending' | 'In Progress' | 'Completed'

export interface Doctor {
  id: string
  name: string
  specialization: string
  phone: string
  email: string
}

export interface Patient {
  id: string
  name: string
  age: number
  gender: 'Male' | 'Female' | 'Other'
  phone: string
  whatsapp: string
  address: string
  doctorId: string
  registrationDate: string
  status: PatientStatus
  conditions?: string[]
}

export interface Consultation {
  id: string
  patientId: string
  doctorId: string
  skinProblem: string
  infectionType: string
  diagnosisDate: string
  doctorNotes: string
  status: ConsultationStatus
  createdAt: string
}

export interface Prescription {
  id: string
  patientId: string
  doctorId: string
  consultationId: string
  medicineName: string
  dosage: string
  timing: string
  frequency: string
  duration: string
  instructions: string
  reminder: boolean
  startDate: string
  endDate: string
  status: PrescriptionStatus
}

export interface FollowUp {
  id: string
  patientId: string
  doctorId: string
  date: string
  time: string
  status: FollowUpStatus
  notes?: string
}

export interface ActivityItem {
  id: string
  type:
    | 'patient_registered'
    | 'consultation_created'
    | 'prescription_activated'
    | 'follow_up_scheduled'
    | 'reminder_sent'
    | 'follow_up_completed'
    | 'consultation_completed'
  title: string
  description: string
  timestamp: string
  patientId?: string
}

export interface DashboardKPI {
  label: string
  value: number
  trend: number
  sparkline: number[]
}
