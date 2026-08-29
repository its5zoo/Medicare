import { Pill, Search, CheckCircle2, AlertCircle, Clock, Calendar } from 'lucide-react'
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

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'completed' | 'discontinued'>(
    completed ? 'completed' : 'active'
  )
  const [search, setSearch] = useState('')
  const [doctorFilter, setDoctorFilter] = useState('All Doctors')

  const allActive = (data?.activePrescriptions as unknown as ActivePrescriptionRecord[]) ?? []
  const allCompleted = data?.completedPrescriptions ?? []

  // Combine both datasets
  const allPrescriptions = useMemo(() => {
    const activeList = allActive.map((item) => ({ ...item, isGroup: 'active' as const, daysRemaining: item.daysRemaining }))
    const completedList = allCompleted.map((item) => ({ ...item, isGroup: 'completed' as const, daysRemaining: undefined as number | undefined }))
    return [...activeList, ...completedList]
  }, [allActive, allCompleted])

  const counts = useMemo(() => {
    const activeCount = allActive.length
    const compCount = allCompleted.filter((p) => p.status === 'Completed').length
    const discCount = allCompleted.filter((p) => p.status === 'Stopped' || p.status === 'Discontinued').length
    return {
      all: allPrescriptions.length,
      active: activeCount,
      completed: compCount,
      discontinued: discCount,
    }
  }, [allActive, allCompleted, allPrescriptions])

  const featuredCards = activeTab === 'completed' || activeTab === 'discontinued'
    ? data?.featuredPrescriptions
    : data?.allFeaturedPrescriptions

  const filteredRows = useMemo(() => {
    let result = allPrescriptions

    // 1. Tab filter
    if (activeTab === 'active') {
      result = result.filter((rx) => rx.status === 'Active')
    } else if (activeTab === 'completed') {
      result = result.filter((rx) => rx.status === 'Completed')
    } else if (activeTab === 'discontinued') {
      result = result.filter((rx) => rx.status === 'Stopped' || rx.status === 'Discontinued')
    }

    // 2. Search
    if (search.trim() !== '') {
      const query = search.trim().toLowerCase()
      result = result.filter((rx) => rx.searchText?.toLowerCase().includes(query) || rx.medicine?.toLowerCase().includes(query) || rx.patientName?.toLowerCase().includes(query))
    }

    // 3. Doctor
    if (doctorFilter !== 'All Doctors') {
      result = result.filter((rx) => rx.doctor === doctorFilter)
    }

    return result
  }, [allPrescriptions, activeTab, search, doctorFilter])

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
    <div className="space-y-6 pb-12">
      <PageHeader
        title="Patient Prescriptions & Treatments"
        description={`${counts.active} active medication treatments • ${counts.completed} completed courses`}
      />

      {/* Featured Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {featuredCards?.map((rx) => (
          <Card key={rx.prescriptionId} className="transition-shadow border-border/70 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950">
                  <Pill className="h-5 w-5 text-sky-600" />
                </div>
                <PrescriptionStatusBadge status={normalizeStatus(rx.status) as PrescriptionStatus} />
              </div>
              <p className="mt-3 font-semibold text-foreground">{displayValue(rx.medicine)}</p>
              <p className="text-sm text-muted-foreground">{displayValue(rx.patientName)}</p>
              <p className="mt-2 text-xs text-muted-foreground">
                {displayValue(rx.startDate && formatDate(rx.startDate))} - {displayValue(rx.endDate && formatDate(rx.endDate))}
              </p>
              {rx.status === 'Active' && rx.daysRemaining !== undefined && (
                <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400">
                  <Clock className="h-3.5 w-3.5" />
                  <span>{humanizeDaysRemaining(rx.daysRemaining)}</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Filter & Tab Card */}
      <Card className="border-border/60 shadow-sm">
        <CardContent className="p-4 space-y-4">
          {/* Top Controls: Search + Doctor Filter */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="prescriptions-search-input"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search prescription ID, patient, medicine, doctor..."
                className="pl-10 h-9 text-xs"
                autoComplete="off"
              />
            </div>
            <Select value={doctorFilter} onValueChange={setDoctorFilter}>
              <SelectTrigger className="w-full sm:w-[200px] h-9 text-xs">
                <SelectValue placeholder="Doctor" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="All Doctors">All Doctors</SelectItem>
                <SelectItem value="Dr. Priya Sharma">Dr. Priya Sharma</SelectItem>
                <SelectItem value="Dr. Rahul Mehta">Dr. Rahul Mehta</SelectItem>
                <SelectItem value="Rizwana Barkat">Rizwana Barkat</SelectItem>
                <SelectItem value="Muzammil Barkat">Muzammil Barkat</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Integrated Status Tabs: Active, Completed, Discontinued, All */}
          <div className="flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
            {[
              { id: 'active', label: 'Active Treatments (Ongoing)', count: counts.active },
              { id: 'completed', label: 'Completed Courses', count: counts.completed },
              { id: 'discontinued', label: 'Discontinued / Stopped', count: counts.discontinued },
              { id: 'all', label: 'All Prescriptions History', count: counts.all },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`rounded-lg px-3.5 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Table List */}
      {filteredRows.length === 0 ? (
        <div className="py-12">
          <EmptyState
            title={`No ${activeTab === 'active' ? 'Active' : activeTab === 'completed' ? 'Completed' : ''} Prescriptions Found`}
          />
        </div>
      ) : (
        <Card className="border-border/60 shadow-sm overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-y border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Medicine & Regimen</th>
                    <th className="px-6 py-3.5">Patient</th>
                    <th className="px-6 py-3.5 hidden md:table-cell">Doctor</th>
                    <th className="px-6 py-3.5">Start Date</th>
                    <th className="px-6 py-3.5">Kab Tak Dawaai Le Rha Hai (End Date)</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredRows.map((rx) => (
                    <tr
                      key={rx.prescriptionId}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-6 py-4 font-medium">
                        <div className="flex flex-col">
                          <span className="font-bold text-foreground">{displayValue(rx.medicine)}</span>
                          <span className="text-xs text-muted-foreground mt-0.5">
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
                          className="text-left font-medium text-foreground hover:text-primary hover:underline cursor-pointer"
                        >
                          {displayValue(rx.patientName)}
                        </button>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell text-muted-foreground text-xs">
                        {displayValue(rx.doctor)}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground text-xs">
                        {displayValue(rx.startDate && formatDate(rx.startDate))}
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 text-xs font-bold text-foreground">
                            <Calendar className="h-3.5 w-3.5 text-primary" />
                            <span>{displayValue(rx.endDate && formatDate(rx.endDate))}</span>
                          </div>
                          {rx.status === 'Active' && rx.daysRemaining !== undefined && (
                            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400">
                              {humanizeDaysRemaining(rx.daysRemaining)}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <PrescriptionStatusBadge status={normalizeStatus(rx.status) as PrescriptionStatus} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
