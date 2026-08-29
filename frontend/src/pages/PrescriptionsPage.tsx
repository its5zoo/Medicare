import { Pill, Search } from 'lucide-react'
import { useMemo, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/shared/PageHeader'
import { PrescriptionStatusBadge } from '@/components/shared/StatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DashboardContentSkeleton } from '@/components/dashboard/DashboardSkeleton'
import { EmptyState } from '@/components/patient-profile/EmptyState'
import { useDashboard } from '@/hooks/useDashboard'
import { formatDate } from '@/lib/utils'
import { humanizeDaysRemaining } from '@/lib/humanizer'
import type { PrescriptionStatus } from '@/data/types'
import type { ActivePrescriptionRecord } from '@/api/types'

interface PrescriptionsPageProps {
  completed?: boolean
}

export function PrescriptionsPage({ completed = false }: PrescriptionsPageProps) {
  const { data, isLoading } = useDashboard()
  const navigate = useNavigate()
  
  const [search, setSearch] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('All Doctors')
  const [statusFilter, setStatusFilter] = useState('All Statuses')

  const baseDataset = completed 
    ? (data?.completedPrescriptions ?? []) 
    : ((data?.activePrescriptions as unknown as ActivePrescriptionRecord[]) ?? [])
  const summaryCount = completed 
    ? data?.completedPrescriptionSummary?.totalCompletedPrescriptions 
    : data?.totalActivePrescriptionSummary?.totalActivePrescriptions
  
  const featuredCards = completed ? data?.featuredPrescriptions : data?.allFeaturedPrescriptions

  // Global Keyboard Workflow
  useEffect(() => {
    if (window.innerWidth < 768) return

    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const hasOpenModals = document.querySelector('[role="dialog"], [role="menu"]') !== null
      const activeElement = document.activeElement as HTMLElement | null
      const isInputFocused = activeElement && (
        activeElement.tagName === 'INPUT' ||
        activeElement.tagName === 'TEXTAREA' ||
        activeElement.tagName === 'SELECT' ||
        activeElement.isContentEditable ||
        activeElement.getAttribute('role') === 'combobox'
      )

      // Feature 3, 4, 5 - Universal Escape
      if (e.key === 'Escape') {
        if (activeElement && activeElement !== document.body) {
          activeElement.blur()
        }
        return
      }

      // Feature 1, 8 - CMD+K / CTRL+K
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        if (hasOpenModals) return
        e.preventDefault()
        const globalSearch = document.getElementById('global-patient-search-input') as HTMLInputElement | null
        if (globalSearch) {
          globalSearch.focus()
          setTimeout(() => globalSearch.select(), 0)
        }
        return
      }

      // Feature 2, 6 - Auto-Type into Page Search
      if (!isInputFocused && !hasOpenModals) {
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && /[a-zA-Z0-9]/.test(e.key)) {
          e.preventDefault()
          const pageSearch = document.getElementById('prescriptions-search-input') as HTMLInputElement | null
          if (pageSearch) {
            pageSearch.focus()
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(pageSearch, pageSearch.value + e.key)
              pageSearch.dispatchEvent(new Event('input', { bubbles: true }))
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  const filteredRows = useMemo(() => {
    if (!baseDataset) return []

    let result = baseDataset

    // 1. Search
    if (search.trim() !== '') {
      const query = search.trim().toLowerCase()
      result = result.filter(rx => rx.searchText.toLowerCase().includes(query))
    }

    // 2. Doctor
    if (doctorFilter !== 'All Doctors') {
      result = result.filter(rx => rx.doctor === doctorFilter)
    }

    // 3. Status (Only on completed page)
    if (completed && statusFilter !== 'All Statuses') {
      if (statusFilter === 'Completed') {
        result = result.filter(rx => rx.status === 'Completed')
      } else if (statusFilter === 'Discontinued') {
        result = result.filter(rx => rx.status === 'Stopped')
      }
    }

    return result
  }, [baseDataset, search, doctorFilter, statusFilter, completed])

  if (isLoading) {
    return <DashboardContentSkeleton />
  }

  const displayValue = (val: string | null | undefined) => {
    if (!val || val.trim() === '') return '-'
    return val
  }

  const normalizeStatus = (status: string) => {
    return status === 'Stopped' ? 'Discontinued' : status
  }

  return (
    <div>
      <PageHeader
        title={completed ? 'Completed Prescriptions' : 'Active Prescriptions'}
        description={`${summaryCount ?? 0} prescriptions`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featuredCards?.map((rx) => (
          <Card key={rx.prescriptionId} className="transition-shadow">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950">
                  <Pill className="h-5 w-5 text-sky-600" />
                </div>
                <PrescriptionStatusBadge status={normalizeStatus(rx.status) as PrescriptionStatus} />
              </div>
              <p className="mt-3 font-semibold">{displayValue(rx.medicine)}</p>
              <p className="text-sm text-muted-foreground">{displayValue(rx.patientName)}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {displayValue(rx.startDate && formatDate(rx.startDate))} - {displayValue(rx.endDate && formatDate(rx.endDate))}
              </p>
              {!completed && rx.daysRemaining !== undefined && (
                <p className="mt-2 text-sm font-medium text-sky-600 dark:text-sky-400">
                  {humanizeDaysRemaining(rx.daysRemaining)}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mb-6">
        <CardContent className="p-4 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="prescriptions-search-input"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search prescription ID, patient, medicine, doctor, or phone..."
              className="pl-10"
              autoComplete="off"
            />
          </div>
          <Select value={doctorFilter} onValueChange={setDoctorFilter}>
            <SelectTrigger className="w-full sm:w-[200px]">
              <SelectValue placeholder="Doctor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All Doctors">All Doctors</SelectItem>
              <SelectItem value="Rizwana Barkat">Rizwana Barkat</SelectItem>
              <SelectItem value="Muzammil Barkat">Muzammil Barkat</SelectItem>
            </SelectContent>
          </Select>
          
          {completed && (
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[200px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Statuses">All Statuses</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
                <SelectItem value="Discontinued">Discontinued</SelectItem>
              </SelectContent>
            </Select>
          )}
        </CardContent>
      </Card>

      {filteredRows.length === 0 ? (
        <div className="py-12">
          <EmptyState 
            title={completed ? 'No Completed Prescriptions Found' : 'No Active Prescriptions Found'}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto hidden md:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-left text-muted-foreground">
                    <th className="px-6 py-4 font-medium">Medicine Name</th>
                    <th className="px-6 py-4 font-medium">Patient</th>
                    <th className="px-6 py-4 font-medium hidden md:table-cell">Doctor</th>
                    <th className="px-6 py-4 font-medium">Start Date</th>
                    <th className="px-6 py-4 font-medium">End Date</th>
                    <th className="px-6 py-4 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRows.map((rx) => (
                    <tr
                      key={rx.prescriptionId}
                      className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium">
                        <div className="flex flex-col">
                          <span>{displayValue(rx.medicine)}</span>
                          <span className="text-xs text-muted-foreground">
                            {displayValue(rx.dosage)} • {displayValue(rx.frequency)}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => {
                            if (!rx.patientId) return
                            navigate(`/patients/${rx.patientId}`)
                          }}
                          className="text-left hover:underline"
                        >
                          {displayValue(rx.patientName)}
                        </button>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-muted-foreground">
                        {displayValue(rx.doctor)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">{displayValue(rx.startDate && formatDate(rx.startDate))}</td>
                      <td className="px-6 py-4 text-muted-foreground">{displayValue(rx.endDate && formatDate(rx.endDate))}</td>
                      <td className="px-6 py-4"><PrescriptionStatusBadge status={normalizeStatus(rx.status) as PrescriptionStatus} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* --- MOBILE VIEW --- */}
            <div className="md:hidden p-4 space-y-4">
              {filteredRows.map((rx) => (
                <div key={rx.prescriptionId} className="rounded-2xl border border-border/50 bg-card shadow-sm p-4 flex flex-col gap-4">
                  {/* Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 flex flex-col">
                      <span className="text-lg font-semibold text-foreground whitespace-normal break-words leading-tight">{displayValue(rx.medicine)}</span>
                      <span className="text-sm text-muted-foreground mt-1">
                        {displayValue(rx.dosage)} • {displayValue(rx.frequency)}
                      </span>
                    </div>
                    <div className="shrink-0">
                      <PrescriptionStatusBadge status={normalizeStatus(rx.status) as PrescriptionStatus} />
                    </div>
                  </div>

                  <div className="border-t border-border/50" />

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-y-4 gap-x-3">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Patient</span>
                      <button
                        type="button"
                        onClick={() => {
                          if (!rx.patientId) return
                          navigate(`/patients/${rx.patientId}`)
                        }}
                        className="text-sm font-medium text-foreground text-left whitespace-normal break-words hover:underline focus:outline-none"
                      >
                        {displayValue(rx.patientName)}
                      </button>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Doctor</span>
                      <span className="text-sm font-medium text-foreground whitespace-normal break-words">{displayValue(rx.doctor)}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Start Date</span>
                      <span className="text-sm font-medium text-foreground">{displayValue(rx.startDate && formatDate(rx.startDate))}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">End Date</span>
                      <span className="text-sm font-medium text-foreground">{displayValue(rx.endDate && formatDate(rx.endDate))}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-1 flex justify-end">
                    <button
                      type="button"
                      className="inline-flex items-center text-sm font-medium text-primary hover:text-primary/80 transition-colors focus-visible:outline-none"
                      onClick={() => {
                        if (!rx.patientId) return
                        navigate(`/patients/${rx.patientId}`)
                      }}
                    >
                      View Details <span className="ml-1">→</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
