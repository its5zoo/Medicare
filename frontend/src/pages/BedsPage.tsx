import { useState, useMemo, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import {
  Search,
  CheckCircle2,
  AlertCircle,
  Download,
  PlusCircle,
  UserPlus,
  UserMinus,
  RefreshCw,
  Filter,
  Users,
  BedDouble,
  Activity,
  ArrowRightLeft,
  Sparkles,
  Phone,
  Calendar,
  Clock,
  ShieldCheck,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  initialBeds,
  type BedItem,
  type InpatientDetail,
} from '@/data/bedManagementData'
import { AdmitPatientModal } from '@/components/beds/AdmitPatientModal'
import { DischargePatientModal } from '@/components/beds/DischargePatientModal'

const STORAGE_KEY = 'medicure_hospital_beds_v1'

interface BedsPageProps {
  filterStatus?: 'occupied' | 'available' | 'maintenance' | 'all'
}

export function BedsPage({ filterStatus = 'all' }: BedsPageProps) {
  const [beds, setBeds] = useState<BedItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Fallback
      }
    }
    return initialBeds
  })

  const [search, setSearch] = useState('')
  const [statusTab, setStatusTab] = useState<string>(filterStatus)
  const [wardFilter, setWardFilter] = useState<string>('all')
  const [selectedBedForAdmit, setSelectedBedForAdmit] = useState<BedItem | null>(null)
  const [selectedBedForDischarge, setSelectedBedForDischarge] = useState<BedItem | null>(null)
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(beds))
  }, [beds])

  useEffect(() => {
    if (filterStatus) {
      setStatusTab(filterStatus)
    }
  }, [filterStatus])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = beds.length
    const occupied = beds.filter((b) => b.status === 'Occupied').length
    const available = beds.filter((b) => b.status === 'Available').length
    const maintenance = beds.filter((b) => b.status === 'Maintenance' || b.status === 'Cleaning').length
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0

    return {
      total,
      occupied,
      available,
      maintenance,
      occupancyRate,
    }
  }, [beds])

  // Filtered Beds
  const filteredBeds = useMemo(() => {
    return beds.filter((b) => {
      // 1. Search Query
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        b.bedNumber.toLowerCase().includes(q) ||
        b.ward.toLowerCase().includes(q) ||
        b.floor.toLowerCase().includes(q) ||
        (b.patient &&
          (b.patient.patientName.toLowerCase().includes(q) ||
            b.patient.patientId.toLowerCase().includes(q) ||
            b.patient.doctor.toLowerCase().includes(q) ||
            b.patient.diagnosis.toLowerCase().includes(q)))

      if (!matchesSearch) return false

      // 2. Ward Category Filter
      if (wardFilter !== 'all' && b.wardType !== wardFilter) {
        return false
      }

      // 3. Status Tab Filter
      if (statusTab === 'occupied') return b.status === 'Occupied'
      if (statusTab === 'available') return b.status === 'Available'
      if (statusTab === 'maintenance') return b.status === 'Maintenance' || b.status === 'Cleaning'

      return true
    })
  }, [beds, search, statusTab, wardFilter])

  const availableBedsList = useMemo(() => {
    return beds.filter((b) => b.status === 'Available')
  }, [beds])

  // Handlers
  const handleAdmit = (bedId: string, inpatient: InpatientDetail) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: 'Occupied',
              patient: inpatient,
            }
          : b
      )
    )
    showToast(`Admitted ${inpatient.patientName} to ${beds.find((b) => b.id === bedId)?.bedNumber || 'Bed'}`)
  }

  const handleDischarge = (bedId: string, markForCleaning: boolean) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: markForCleaning ? 'Cleaning' : 'Available',
              patient: undefined,
              lastSanitizedAt: markForCleaning
                ? 'Cleaning in progress'
                : `Sanitized on ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            }
          : b
      )
    )
    showToast(`Discharged patient. Bed is now ${markForCleaning ? 'marked for Cleaning' : 'Available'}.`)
  }

  const handleMarkCleaned = (bedId: string) => {
    setBeds((prev) =>
      prev.map((b) =>
        b.id === bedId
          ? {
              ...b,
              status: 'Available',
              lastSanitizedAt: `Sanitized on ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`,
            }
          : b
      )
    )
    showToast('Bed sanitized and ready for patient admission!')
  }

  const handleExportCSV = () => {
    const headers = [
      'Bed Number',
      'Ward',
      'Ward Type',
      'Floor',
      'Daily Rate (INR)',
      'Status',
      'Patient ID',
      'Patient Name',
      'Age',
      'Gender',
      'Contact Phone',
      'Admitted Date',
      'Expected Discharge',
      'Admitting Doctor',
      'Primary Diagnosis',
      'Attending Nurse',
    ]

    const rows = beds.map((b) => [
      b.bedNumber,
      `"${b.ward.replace(/"/g, '""')}"`,
      b.wardType,
      b.floor,
      b.dailyRate,
      b.status,
      b.patient?.patientId || '-',
      b.patient ? `"${b.patient.patientName.replace(/"/g, '""')}"` : '-',
      b.patient?.age || '-',
      b.patient?.gender || '-',
      b.patient?.phone || '-',
      b.patient?.admittedDate || '-',
      b.patient?.expectedDischargeDate || '-',
      b.patient ? `"${b.patient.doctor.replace(/"/g, '""')}"` : '-',
      b.patient ? `"${b.patient.diagnosis.replace(/"/g, '""')}"` : '-',
      b.patient ? `"${b.patient.attendingNurse.replace(/"/g, '""')}"` : '-',
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `medicure_hospital_beds_audit_${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported Hospital Bed Occupancy CSV report!')
  }

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm text-background shadow-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <BedDouble className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Hospital Beds & Inpatient Management</h1>
              <p className="text-xs text-muted-foreground">
                Track live ward occupancy, manage inpatient admissions, and coordinate patient stay durations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedBedForAdmit(null)
              setIsAdmitModalOpen(true)
            }}
            disabled={availableBedsList.length === 0}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <UserPlus className="h-3.5 w-3.5" />
            Admit Patient ({availableBedsList.length} Vacant)
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export Beds CSV
          </Button>
        </div>
      </div>

      {/* Overview KPI Metrics - Clean Neutral Design */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Clinic Beds */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Total Hospital Beds
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{metrics.total}</span>
                  <span className="text-xs text-muted-foreground">capacity</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <BedDouble className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Across 6 clinical wards & recovery units
            </p>
          </CardContent>
        </Card>

        {/* Occupied Inpatient Beds */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Occupied Beds (Admitted)
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{metrics.occupied}</span>
                  <span className="text-xs text-muted-foreground font-medium">({metrics.occupancyRate}%)</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Active in-hospital treatments & recovery
            </p>
          </CardContent>
        </Card>

        {/* Available Vacant Beds */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Available Beds (Vacant)
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{metrics.available}</span>
                  <span className="text-xs text-muted-foreground">ready for admission</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <CheckCircle2 className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Cleaned, sanitized & ready for patients
            </p>
          </CardContent>
        </Card>

        {/* Cleaning & Maintenance */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Cleaning & Maintenance
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{metrics.maintenance}</span>
                  <span className="text-xs text-muted-foreground">beds</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <RefreshCw className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Sanitization or routine room servicing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Bed Matrix Table Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Ward & Bed Occupancy Register</CardTitle>
              <CardDescription className="text-xs">
                Showing {filteredBeds.length} of {beds.length} registered hospital beds.
              </CardDescription>
            </div>

            {/* Search and Ward Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search bed, patient, doctor..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <Select value={wardFilter} onValueChange={setWardFilter}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <Filter className="mr-1.5 h-3 w-3" />
                  <SelectValue placeholder="Ward" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Wards</SelectItem>
                  <SelectItem value="General">General Ward</SelectItem>
                  <SelectItem value="Semi-Private">Semi-Private</SelectItem>
                  <SelectItem value="Private">Private Deluxe</SelectItem>
                  <SelectItem value="ICU">ICU / CCU</SelectItem>
                  <SelectItem value="Day Care">Day Care / Laser</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
            {[
              { id: 'all', label: 'All Beds', count: beds.length },
              { id: 'occupied', label: 'Occupied (Admitted)', count: metrics.occupied },
              { id: 'available', label: 'Available (Vacant)', count: metrics.available },
              { id: 'maintenance', label: 'Cleaning & Servicing', count: metrics.maintenance },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusTab(tab.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  statusTab === tab.id
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Bed & Location</th>
                  <th className="px-4 py-3">Admitted Patient</th>
                  <th className="px-4 py-3">Admission & Stay Details</th>
                  <th className="px-4 py-3">Doctor & Diagnosis</th>
                  <th className="px-4 py-3">Daily Rent</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredBeds.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-muted-foreground">
                      No beds found matching the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredBeds.map((bed) => (
                    <tr key={bed.id} className="transition-colors hover:bg-muted/30">
                      {/* Bed & Ward Location */}
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-xs">{bed.bedNumber}</span>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
                              {bed.wardType}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground">{bed.ward}</p>
                          <span className="text-[10px] text-muted-foreground font-mono">{bed.floor}</span>
                        </div>
                      </td>

                      {/* Admitted Patient */}
                      <td className="px-4 py-3">
                        {bed.patient ? (
                          <div>
                            <Link
                              to={`/patients/${bed.patient.patientId}`}
                              className="font-semibold text-foreground hover:underline text-xs"
                            >
                              {bed.patient.patientName}
                            </Link>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground mt-0.5">
                              <span>{bed.patient.patientId}</span>
                              <span>•</span>
                              <span>{bed.patient.age}y / {bed.patient.gender}</span>
                            </div>
                            <div className="text-[10px] text-muted-foreground">{bed.patient.phone}</div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">No patient admitted</span>
                        )}
                      </td>

                      {/* Admission & Stay Dates */}
                      <td className="px-4 py-3">
                        {bed.patient ? (
                          <div className="space-y-0.5 text-xs">
                            <div className="flex items-center gap-1 text-foreground">
                              <Calendar className="h-3 w-3 text-muted-foreground" />
                              <span>Admitted: {bed.patient.admittedDate}</span>
                            </div>
                            <div className="flex items-center gap-1 text-muted-foreground text-[11px]">
                              <Clock className="h-3 w-3" />
                              <span>Est. Discharge: {bed.patient.expectedDischargeDate}</span>
                            </div>
                            <span className="text-[10px] text-muted-foreground">
                              Stay: {bed.patient.totalDaysStay} day(s)
                            </span>
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground">
                            {bed.lastSanitizedAt ? (
                              <span>{bed.lastSanitizedAt}</span>
                            ) : (
                              <span>Available for allocation</span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Doctor & Diagnosis */}
                      <td className="px-4 py-3">
                        {bed.patient ? (
                          <div className="space-y-0.5 max-w-xs">
                            <p className="text-xs font-medium text-foreground">{bed.patient.doctor}</p>
                            <p className="text-[11px] text-muted-foreground truncate" title={bed.patient.diagnosis}>
                              {bed.patient.diagnosis}
                            </p>
                            <p className="text-[10px] text-muted-foreground">Nurse: {bed.patient.attendingNurse}</p>
                          </div>
                        ) : (
                          <div className="text-[11px] text-muted-foreground">
                            {bed.features.slice(0, 2).join(' • ')}
                          </div>
                        )}
                      </td>

                      {/* Daily Rent */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-bold text-foreground">
                          ₹{bed.dailyRate.toLocaleString('en-IN')}/day
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-medium text-foreground">
                          {bed.status}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {bed.status === 'Occupied' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedBedForDischarge(bed)}
                              className="h-7 text-xs px-2.5 cursor-pointer gap-1"
                            >
                              <UserMinus className="h-3 w-3" />
                              Discharge
                            </Button>
                          ) : bed.status === 'Cleaning' ? (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleMarkCleaned(bed.id)}
                              className="h-7 text-xs px-2.5 cursor-pointer gap-1"
                            >
                              <CheckCircle2 className="h-3 w-3 text-primary" />
                              Mark Ready
                            </Button>
                          ) : (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedBedForAdmit(bed)
                                setIsAdmitModalOpen(true)
                              }}
                              className="h-7 text-xs px-2.5 cursor-pointer gap-1"
                            >
                              <UserPlus className="h-3 w-3" />
                              Admit
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <AdmitPatientModal
        open={isAdmitModalOpen}
        onOpenChange={setIsAdmitModalOpen}
        bed={selectedBedForAdmit}
        availableBeds={availableBedsList}
        onAdmit={handleAdmit}
      />

      <DischargePatientModal
        open={!!selectedBedForDischarge}
        onOpenChange={(open) => !open && setSelectedBedForDischarge(null)}
        bed={selectedBedForDischarge}
        onDischarge={handleDischarge}
      />
    </div>
  )
}
