import { useQueryClient } from '@tanstack/react-query'
import { Search } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { prefetchPatient } from '@/hooks/usePatientProfile'
import type { PatientSearchIndexItem } from '@/api/types'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { usePatientSearch } from '@/hooks/usePatientSearch'
import {
  formatPatientDisplayName,
  formatPatientPhone,
  getPatientInitials,
} from '@/lib/patientSearch'
import { cn } from '@/lib/utils'

function getStatusVariant(status: string): 'success' | 'secondary' | 'warning' | 'default' {
  const normalized = status.toLowerCase()
  if (normalized === 'active' || normalized === 'active treatment') return 'success'
  if (normalized === 'registered') return 'secondary'
  if (normalized === 'consultation pending') return 'warning'
  return 'default'
}

interface GlobalPatientSearchProps {
  patientSearchIndex?: PatientSearchIndexItem[]
  isIndexLoading?: boolean
}

export function GlobalPatientSearch({
  patientSearchIndex = [],
  isIndexLoading = false,
}: GlobalPatientSearchProps) {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const { results, showDropdown, isDebouncing } = usePatientSearch(
    patientSearchIndex,
    searchQuery
  )

  const openPatient = useCallback(
    (patientId: string) => {
      navigate(`/patients/${patientId}`)
      setSearchQuery('')
      setSelectedIndex(-1)
      setSearchFocused(false)
      inputRef.current?.blur()
    },
    [navigate]
  )

  const closeDropdown = useCallback(() => {
    setSearchFocused(false)
    setSelectedIndex(-1)
    inputRef.current?.blur()
  }, [])

  useEffect(() => {
    setSelectedIndex(-1)
  }, [searchQuery])

  useEffect(() => {
    if (selectedIndex < 0 || !listRef.current) return
    const item = listRef.current.querySelector(`[data-index="${selectedIndex}"]`)
    item?.scrollIntoView({ block: 'nearest' })
  }, [selectedIndex])

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!showDropdown) return

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault()
        if (results.length > 0) {
          setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0))
        }
        break
      case 'ArrowUp':
        event.preventDefault()
        if (results.length > 0) {
          setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1))
        }
        break
      case 'Enter':
        event.preventDefault()
        if (selectedIndex >= 0 && results[selectedIndex]) {
          openPatient(results[selectedIndex].patientId)
        } else if (results.length === 1) {
          openPatient(results[0].patientId)
        }
        break
      case 'Escape':
        event.preventDefault()
        closeDropdown()
        break
    }
  }

  const dropdownVisible = searchFocused && showDropdown
  const showLoading =
    isIndexLoading || (isDebouncing && searchQuery.trim().length > 0)
  const showEmpty =
    dropdownVisible && !showLoading && searchQuery.trim().length > 0 && results.length === 0

  return (
    <div className="relative flex-1 max-w-xl">
      <div
        className={cn(
          'relative flex items-center rounded-2xl border transition-all duration-200',
          searchFocused
            ? 'border-primary/40 bg-background shadow-md ring-4 ring-primary/10'
            : 'border-border bg-muted/40 hover:border-primary/20'
        )}
      >
        <Search className="absolute left-4 h-4 w-4 text-muted-foreground" />
        <Input
          id="global-patient-search-input"
          ref={inputRef}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
          onKeyDown={handleKeyDown}
          placeholder="Search patients by ID, name, or phone..."
          className="h-11 border-0 bg-transparent pl-11 pr-4 text-sm shadow-none focus-visible:ring-0"
          role="combobox"
          aria-expanded={dropdownVisible}
          aria-autocomplete="list"
          aria-controls="patient-search-results"
          autoComplete="off"
        />
        <kbd className="absolute right-3 hidden rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] text-muted-foreground sm:inline-block">
          ⌘K
        </kbd>
      </div>

      {dropdownVisible && (
        <div
          id="patient-search-results"
          ref={listRef}
          role="listbox"
          className="absolute top-full left-0 right-0 mt-2 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
        >
          {showLoading ? (
            <div className="px-4 py-3">
              <p className="text-sm text-muted-foreground">Searching...</p>
              <div className="mt-3 space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-full" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-48" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : showEmpty ? (
            <div className="px-4 py-6 text-center">
              <p className="text-sm font-medium">No patients found</p>
              <p className="mt-2 text-xs text-muted-foreground">
                Try searching by:
                <br />• Patient ID
                <br />• Name
                <br />• Phone Number
              </p>
            </div>
          ) : (
            results.map((patient, index) => (
              <button
                key={patient.patientId}
                type="button"
                role="option"
                data-index={index}
                aria-selected={index === selectedIndex}
                onMouseDown={() => openPatient(patient.patientId)}
                onMouseEnter={() => {
                  setSelectedIndex(index)
                  prefetchPatient(queryClient, patient.patientId)
                }}
                className={cn(
                  'flex w-full items-center gap-3 px-4 py-3 text-left transition-colors cursor-pointer',
                  index === selectedIndex
                    ? 'bg-[var(--surface-hover)]'
                    : 'hover:bg-[var(--surface-hover)]'
                )}
              >
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {getPatientInitials(patient.fullName)}
                  </AvatarFallback>
                </Avatar>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">
                    {formatPatientDisplayName(patient.fullName)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {patient.patientId} • {formatPatientPhone(patient.phone)}
                  </p>
                </div>
                <Badge variant={getStatusVariant(patient.status)} className="shrink-0">
                  {patient.status}
                </Badge>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  )
}
