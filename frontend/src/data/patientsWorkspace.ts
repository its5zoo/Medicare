import type { Patient } from './types'
import type { PatientProfileBundle } from './patientProfileTypes'
import {
  countActiveConditions,
  countActiveMedicines,
  getActiveFollowUp,
} from './patientProfileTypes'
import type { FollowUpStatus } from './types'
import { doctors, patients } from './mockData'
import { getPatientProfileBundle } from './patientProfileMock'

/** Workspace-level status shown on All Patients page. */
export type WorkspacePatientStatus =
  | 'Registered'
  | 'Under Treatment'
  | 'Follow-Up Scheduled'
  | 'Completed'
  | 'Inactive'

export type ConditionTypeFilter =
  | 'Acne'
  | 'Fungal Infection'
  | 'Allergy'
  | 'Pigmentation'
  | 'Hair Loss'
  | 'Other'

export const WORKSPACE_PATIENT_STATUSES: WorkspacePatientStatus[] = [
  'Registered',
  'Under Treatment',
  'Follow-Up Scheduled',
  'Completed',
  'Inactive',
]

export const CONDITION_TYPE_OPTIONS: ConditionTypeFilter[] = [
  'Acne',
  'Fungal Infection',
  'Allergy',
  'Pigmentation',
  'Hair Loss',
  'Other',
]

export interface PatientListRow {
  id: string
  name: string
  phone: string
  doctorId: string
  doctorName: string
  registrationDate: string
  workspaceStatus: WorkspacePatientStatus
  conditionNames: string[]
  infectionTypes: string[]
  activeMedicinesCount: number
  activeConditionsCount: number
  activeFollowUpDate: string | null
  activeFollowUpTime: string | null
  activeFollowUpStatus: FollowUpStatus | null
  requiresAttention: boolean
  attentionReason?: string
}

export interface PatientsWorkspaceKpis {
  total: number
  activePatients: number
  withActiveFollowUp: number
  requiringAttention: number
  trends: {
    total: number
    activePatients: number
    withActiveFollowUp: number
    requiringAttention: number
  }
}

export interface PatientsWorkspaceFilters {
  search: string
  doctorId: string | 'all'
  workspaceStatus: WorkspacePatientStatus | 'all'
  conditionType: ConditionTypeFilter | 'all'
  hasActiveMedicines: 'all' | 'yes' | 'no'
  hasActiveFollowUp: 'all' | 'yes' | 'no'
  registrationRange: 'all' | '7d' | '30d' | '90d'
}

export const defaultPatientsFilters: PatientsWorkspaceFilters = {
  search: '',
  doctorId: 'all',
  workspaceStatus: 'all',
  conditionType: 'all',
  hasActiveMedicines: 'all',
  hasActiveFollowUp: 'all',
  registrationRange: 'all',
}

function deriveWorkspaceStatus(
  patient: Patient,
  bundle: PatientProfileBundle | null
): WorkspacePatientStatus {
  const activeMeds = bundle ? countActiveMedicines(bundle.conditions) : 0
  const activeConds = bundle ? countActiveConditions(bundle.conditions) : 0
  const activeFu = bundle ? getActiveFollowUp(bundle.followUps) : null

  if (patient.status === 'Completed') return 'Completed'
  if (activeFu) return 'Follow-Up Scheduled'
  if (activeMeds > 0 || activeConds > 0 || patient.status === 'Active Treatment') {
    return 'Under Treatment'
  }
  if (patient.status === 'Registered' || patient.status === 'Consultation Pending') {
    return 'Registered'
  }
  return 'Inactive'
}

function computeAttention(
  patient: Patient,
  bundle: PatientProfileBundle | null
): { requiresAttention: boolean; reason?: string } {
  const today = new Date().toISOString().split('T')[0]
  const activeFu = bundle ? getActiveFollowUp(bundle.followUps) : null

  if (activeFu && activeFu.date < today) {
    return { requiresAttention: true, reason: 'Overdue follow-up' }
  }

  const missed = bundle?.followUps.some((f) => f.status === 'Missed')
  if (missed) {
    return { requiresAttention: true, reason: 'Missed follow-up in history' }
  }

  if (patient.status === 'Consultation Pending') {
    return { requiresAttention: true, reason: 'Consultation pending' }
  }

  if (patient.status === 'Follow-Up Due' && !activeFu) {
    return { requiresAttention: true, reason: 'Follow-up action needed' }
  }

  return { requiresAttention: false }
}

export function buildPatientListRow(patient: Patient): PatientListRow {
  const bundle = getPatientProfileBundle(patient.id)
  const doctor = doctors.find((d) => d.id === patient.doctorId)
  const activeFu = bundle ? getActiveFollowUp(bundle.followUps) : null
  const attention = computeAttention(patient, bundle)
  const conditionNames = bundle?.conditions.map((c) => c.conditionName) ?? patient.conditions ?? []
  const infectionTypes = bundle?.conditions.map((c) => c.infectionType) ?? []

  return {
    id: patient.id,
    name: patient.name,
    phone: patient.phone,
    doctorId: patient.doctorId,
    doctorName: doctor?.name ?? '-',
    registrationDate: patient.registrationDate,
    workspaceStatus: deriveWorkspaceStatus(patient, bundle),
    conditionNames,
    infectionTypes,
    activeMedicinesCount: bundle ? countActiveMedicines(bundle.conditions) : 0,
    activeConditionsCount: bundle ? countActiveConditions(bundle.conditions) : 0,
    activeFollowUpDate: activeFu?.date ?? null,
    activeFollowUpTime: activeFu?.timeSlot ?? null,
    activeFollowUpStatus: activeFu?.status ?? null,
    requiresAttention: attention.requiresAttention,
    attentionReason: attention.reason,
  }
}

export function buildAllPatientListRows(): PatientListRow[] {
  return patients.map(buildPatientListRow)
}

export function filterPatientListRows(
  rows: PatientListRow[],
  filters: PatientsWorkspaceFilters,
  options?: { activeOnly?: boolean }
): PatientListRow[] {
  let result = [...rows]

  if (options?.activeOnly) {
    result = result.filter(
      (r) =>
        r.workspaceStatus === 'Under Treatment' ||
        r.workspaceStatus === 'Follow-Up Scheduled'
    )
  }

  if (filters.search.trim()) {
    const q = filters.search.toLowerCase()
    result = result.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.phone.includes(q)
    )
  }

  if (filters.doctorId !== 'all') {
    result = result.filter((r) => r.doctorId === filters.doctorId)
  }

  if (filters.workspaceStatus !== 'all') {
    result = result.filter((r) => r.workspaceStatus === filters.workspaceStatus)
  }

  if (filters.conditionType !== 'all') {
    result = result.filter((r) => r.infectionTypes.includes(filters.conditionType))
  }

  if (filters.hasActiveMedicines === 'yes') {
    result = result.filter((r) => r.activeMedicinesCount > 0)
  } else if (filters.hasActiveMedicines === 'no') {
    result = result.filter((r) => r.activeMedicinesCount === 0)
  }

  if (filters.hasActiveFollowUp === 'yes') {
    result = result.filter((r) => r.activeFollowUpDate !== null)
  } else if (filters.hasActiveFollowUp === 'no') {
    result = result.filter((r) => r.activeFollowUpDate === null)
  }

  if (filters.registrationRange !== 'all') {
    const days =
      filters.registrationRange === '7d' ? 7 : filters.registrationRange === '30d' ? 30 : 90
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - days)
    result = result.filter((r) => new Date(r.registrationDate) >= cutoff)
  }

  return result
}

export function computePatientsWorkspaceKpis(rows: PatientListRow[]): PatientsWorkspaceKpis {
  const activePatients = rows.filter(
    (r) => r.activeConditionsCount > 0 || r.activeMedicinesCount > 0
  ).length
  const withActiveFollowUp = rows.filter((r) => r.activeFollowUpDate !== null).length
  const requiringAttention = rows.filter((r) => r.requiresAttention).length

  return {
    total: rows.length,
    activePatients,
    withActiveFollowUp,
    requiringAttention,
    trends: {
      total: 4,
      activePatients: 6,
      withActiveFollowUp: -2,
      requiringAttention: 3,
    },
  }
}

/** Placeholder for future GET /patients/search autocomplete. */
export function searchPatientSuggestions(query: string, rows: PatientListRow[]): PatientListRow[] {
  if (!query.trim()) return []
  const q = query.toLowerCase()
  return rows
    .filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        r.phone.includes(q)
    )
    .slice(0, 6)
}
