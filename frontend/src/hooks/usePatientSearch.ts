import { useMemo } from 'react'
import type { PatientSearchIndexItem } from '@/api/types'
import { filterPatientSearchIndex } from '@/lib/patientSearch'
import { useDebounce } from '@/hooks/useDebounce'

export function usePatientSearch(
  index: PatientSearchIndexItem[] | undefined,
  searchTerm: string
) {
  const debouncedTerm = useDebounce(searchTerm, 300)

  const results = useMemo(() => {
    if (!debouncedTerm.trim() || !index?.length) return []
    return filterPatientSearchIndex(index, debouncedTerm)
  }, [index, debouncedTerm])

  const showDropdown = searchTerm.trim().length > 0
  const isDebouncing = searchTerm.trim() !== debouncedTerm.trim()

  return {
    debouncedTerm,
    results,
    showDropdown,
    isDebouncing,
  }
}
