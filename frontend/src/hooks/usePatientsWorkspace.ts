import { useEffect, useMemo, useState } from 'react'
import {
  buildAllPatientListRows,
  computePatientsWorkspaceKpis,
  defaultPatientsFilters,
  filterPatientListRows,
  searchPatientSuggestions,
  type PatientsWorkspaceFilters,
} from '@/data/patientsWorkspace'

interface UsePatientsWorkspaceOptions {
  activeOnly?: boolean
  simulateLoadingMs?: number
}

export function usePatientsWorkspace(options: UsePatientsWorkspaceOptions = {}) {
  const { activeOnly = false, simulateLoadingMs = 350 } = options
  const [filters, setFilters] = useState<PatientsWorkspaceFilters>(defaultPatientsFilters)
  const [loading, setLoading] = useState(true)
  const [allRows] = useState(() => buildAllPatientListRows())

  useEffect(() => {
    const t = window.setTimeout(() => setLoading(false), simulateLoadingMs)
    return () => window.clearTimeout(t)
  }, [simulateLoadingMs])

  const filteredRows = useMemo(
    () => filterPatientListRows(allRows, filters, { activeOnly }),
    [allRows, filters, activeOnly]
  )

  const kpis = useMemo(() => computePatientsWorkspaceKpis(allRows), [allRows])

  const suggestions = useMemo(
    () => searchPatientSuggestions(filters.search, allRows),
    [filters.search, allRows]
  )

  const clearFilters = () => setFilters(defaultPatientsFilters)

  const hasActiveFilters =
    filters.search !== '' ||
    filters.doctorId !== 'all' ||
    filters.workspaceStatus !== 'all' ||
    filters.conditionType !== 'all' ||
    filters.hasActiveMedicines !== 'all' ||
    filters.hasActiveFollowUp !== 'all' ||
    filters.registrationRange !== 'all'

  return {
    filters,
    setFilters,
    clearFilters,
    hasActiveFilters,
    rows: filteredRows,
    totalPatients: allRows.length,
    kpis,
    suggestions,
    loading,
  }
}
