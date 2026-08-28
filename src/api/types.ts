export interface ApiResponse<T> {
  success: boolean
  data: T
}

export interface DashboardCards {
  totalPatients: number
  consultationPending: number
  activePatients: number
  todayFollowups: number
  missedFollowups: number
  activePrescriptions: number
}

export interface RecentRegistration {
  patientId: string
  name: string
  phone: string
  doctor: string
  date: string
  status: string
}

export interface ActivityFeedItem {
  type: string
  title: string
  description: string
  createdAt: string
  patientCode?: string
  priority?: string
}

export interface ConsultationPendingItem {
  patientId: string
  name: string
  phone?: string
  doctor: string
  registrationDate: string
  daysWaiting: number
}

export interface TodayFollowupItem {
  followupId?: string
  patientId?: string
  patientName: string
  doctor: string
  date: string
  time: string
  status: string
}

export interface PatientSearchIndexItem {
  patientId: string
  fullName: string
  displayName: string
  phone: string
  doctor: string
  status: string
  gender: string
  age: number
  registrationDate: string
  searchText: string
}

export interface ActivePrescriptionItem {
  prescriptionId?: string
  patientId?: string
  patientName: string
  doctor?: string
  medicine: string
  dosage: string
  frequency: string
  startDate?: string
  endDate?: string
  daysRemaining: number
  status: string
}

export interface PatientSummary {
  totalPatients: number
  activePatients: number
  patientsWithActiveFollowup: number
  patientsRequiringAttention: number
}

export interface PatientRecord {
  patientId: string
  patientName: string
  phone: string | null
  assignedDoctor: string | null
  createdTime: string
  registrationDate: string | null
  activeMedicineCount: number
  nextFollowupDate: string | null
  nextFollowupTime: string | null
  status: string
  searchText: string
}

export interface PrescriptionSummary {
  totalActivePrescriptions?: number
  totalCompletedPrescriptions?: number
}

export interface FeaturedPrescriptionCard {
  prescriptionId: string
  medicine: string
  patientName: string
  startDate: string
  endDate: string
  status: string
  daysRemaining?: number
}

export interface ActivePrescriptionRecord {
  prescriptionId: string
  patientId: string
  patientName: string
  doctor: string
  phone: string
  medicine: string
  dosage: string
  frequency: string
  startDate: string
  endDate: string
  daysRemaining: number
  status: string
  searchText: string
}

export interface CompletedPrescriptionRecord {
  prescriptionId: string
  patientId: string
  patientName: string
  doctor: string
  phone: string
  medicine: string
  dosage: string
  frequency: string
  startDate: string
  endDate: string
  status: string
  searchText: string
}

export interface FollowupSummary {
  totalUpcomingFollowups?: number
  totalMissedFollowups?: number
  totalCompletedFollowups?: number
  totalTodayFollowups?: number
}

export interface UpcomingFollowupRecord {
  followupId: string
  patientId: string
  patientName: string
  phone: string
  doctor: string
  followupDate: string
  followupTime: string
  status: string
  searchText: string
}

export interface MissedFollowupRecord {
  followupId: string
  patientId: string
  patientName: string
  phone: string
  doctor: string
  followupDate: string
  followupTime: string
  daysOverdue: number
  rescheduleCount: number
  status: string
}

export interface CompletedFollowupRecord {
  followupId: string
  patientId: string
  patientName: string
  phone: string
  doctor: string
  followupDate: string
  followupTime: string
  daysOverdue?: number
  rescheduleCount: number
  status: string
}

export interface DashboardData {
  cards: DashboardCards
  recentRegistrations: RecentRegistration[]
  activityFeed: ActivityFeedItem[]
  consultationPending: ConsultationPendingItem[]
  todayFollowups: TodayFollowupItem[]
  activePrescriptions: ActivePrescriptionItem[]
  patientSearchIndex?: PatientSearchIndexItem[]
  meta?: Record<string, unknown>
  generatedAt?: string
  optimisticCreatedAt?: number
  totalPatientSummary?: PatientSummary
  totalPatientsAvailable?: PatientRecord[]
  activePatientSummary?: PatientSummary
  totalActivePatients?: PatientRecord[]
  totalActivePrescriptionSummary?: PrescriptionSummary
  allFeaturedPrescriptions?: FeaturedPrescriptionCard[]
  activePrescriptionsList?: ActivePrescriptionRecord[]
  completedPrescriptionSummary?: PrescriptionSummary
  featuredPrescriptions?: FeaturedPrescriptionCard[]
  completedPrescriptions?: CompletedPrescriptionRecord[]
  totalUpcomingFollowupSummary?: FollowupSummary
  upcomingFollowups?: UpcomingFollowupRecord[]
  totalMissedFollowupSummary?: FollowupSummary
  missedFollowups?: MissedFollowupRecord[]
  totalCompletedFollowupSummary?: FollowupSummary
  completedFollowups?: CompletedFollowupRecord[]
  reviewSummary?: import('@/components/feedback-dashboard/types').ReviewSummary
  allReviews?: import('@/components/feedback-dashboard/types').DashboardReview[]
}
