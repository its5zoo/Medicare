/** Re-export workspace types for service layer (future Airtable / n8n). */
export type {
  PatientListRow,
  PatientsWorkspaceFilters,
  PatientsWorkspaceKpis,
  WorkspacePatientStatus,
} from '@/data/patientsWorkspace'

export {
  buildAllPatientListRows,
  filterPatientListRows,
  computePatientsWorkspaceKpis,
  searchPatientSuggestions,
  defaultPatientsFilters,
  WORKSPACE_PATIENT_STATUSES,
  CONDITION_TYPE_OPTIONS,
} from '@/data/patientsWorkspace'

export interface IPatientsWorkspaceService {
  getRows(): Promise<import('@/data/patientsWorkspace').PatientListRow[]>
  search(query: string): Promise<import('@/data/patientsWorkspace').PatientListRow[]>
}
