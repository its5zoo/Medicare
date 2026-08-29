import { useState, useEffect, useMemo } from 'react'
import { Link } from 'react-router-dom'
import {
  ShieldCheck,
  Search,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Download,
  RefreshCw,
  Phone,
  MapPin,
  UserCheck,
  Stethoscope,
  Pill,
  CalendarClock,
  Star,
  Users,
  ArrowUpRight,
  SlidersHorizontal,
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
  fetchDataHealthAudit,
  quickFixPatientRecord,
  autoNormalizePatientData,
  buildFallbackData,
  type DataHealthResponseData,
  type AuditedPatient,
  type QuickFixPayload,
} from '@/services/dataHealthApi'
import { QuickFixModal } from '@/components/data-health/QuickFixModal'

export function DataHealthPage() {
  const [data, setData] = useState<DataHealthResponseData>(buildFallbackData)
  const [loading, setLoading] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedFilter, setSelectedFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [activeModalPatient, setActiveModalPatient] = useState<AuditedPatient | null>(null)
  const [isNormalizing, setIsNormalizing] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadAuditData = async () => {
    setLoading(true)
    try {
      const res = await fetchDataHealthAudit()
      if (res.success && res.data) {
        setData(res.data)
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAuditData()
  }, [])

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3500)
  }

  const handleQuickFixSave = async (payload: QuickFixPayload) => {
    await quickFixPatientRecord(payload)
    showToast(`Updated record for ${payload.name || payload.patientId}. Health score recalculated!`)
    loadAuditData()
  }

  const handleAutoNormalize = async () => {
    setIsNormalizing(true)
    try {
      const res = await autoNormalizePatientData()
      if (res.success && res.message) {
        showToast(res.message)
      } else {
        showToast('Standardized patient contacts and demographic defaults!')
      }
      loadAuditData()
    } finally {
      setIsNormalizing(false)
    }
  }

  const handleExportCSV = () => {
    if (!data || !data.patients.length) return
    const headers = [
      'Patient ID',
      'Name',
      'Phone',
      'Age',
      'Gender',
      'Address',
      'Doctor',
      'Status',
      'Completeness Score (%)',
      'Missing Fields',
      'Risk Level',
    ]

    const rows = data.patients.map((p) => [
      p.patientId,
      `"${p.name.replace(/"/g, '""')}"`,
      p.phone,
      p.age,
      p.gender,
      `"${p.address.replace(/"/g, '""')}"`,
      `"${p.doctor.replace(/"/g, '""')}"`,
      p.status,
      p.completenessScore,
      `"${p.missingFields.join(', ')}"`,
      p.riskLevel,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `medicure_data_health_audit_${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported Data Health Audit report to CSV!')
  }

  // Filter and Search Logic
  const filteredPatients = useMemo(() => {
    if (!data) return []

    return data.patients.filter((p) => {
      // 1. Search Query
      const q = searchQuery.toLowerCase().trim()
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.patientId.toLowerCase().includes(q) ||
        p.phone.includes(q) ||
        p.doctor.toLowerCase().includes(q) ||
        p.missingFields.some((f) => f.toLowerCase().includes(q))

      if (!matchesSearch) return false

      // 2. Risk Filter
      if (riskFilter !== 'all' && p.riskLevel !== riskFilter) {
        return false
      }

      // 3. Tab Filter
      switch (selectedFilter) {
        case 'incomplete':
          return p.completenessScore < 100
        case 'perfect':
          return p.completenessScore === 100
        case 'missing-phone':
          return !p.hasPhone
        case 'missing-address':
          return !p.hasAddress
        case 'missing-doctor':
          return !p.hasDoctor
        case 'missing-consultation':
          return !p.hasConsultation
        case 'missing-prescription':
          return !p.hasPrescription
        case 'missing-followup':
          return !p.hasFollowUp
        case 'missing-review':
          return !p.hasReview
        default:
          return true
      }
    })
  }, [data, searchQuery, selectedFilter, riskFilter])

  const summary = data?.summary
  const fieldHealth = data?.fieldHealth
  const suggestions = data?.suggestions || []

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm text-background shadow-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Data Quality & Health Center</h1>
              <p className="text-xs text-muted-foreground">
                Audit raw patient records, calculate missing data percentages, and optimize clinical completeness.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAuditData}
            disabled={loading}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleAutoNormalize}
            disabled={isNormalizing}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Sparkles className={`h-3.5 w-3.5 ${isNormalizing ? 'animate-spin' : ''}`} />
            Auto-Standardize Data
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export Audit CSV
          </Button>
        </div>
      </div>

      {/* Overview KPI Cards - Clean & Minimal */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Overall Health Score Card */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Overall Health Score
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {summary?.averageCompleteness || 0}%
                  </span>
                  <span className="text-xs text-muted-foreground">completeness</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <ShieldCheck className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all duration-500"
                  style={{ width: `${summary?.averageCompleteness || 0}%` }}
                />
              </div>
              <p className="mt-2 text-[11px] text-muted-foreground flex items-center justify-between">
                <span>Target: 100% complete</span>
                <span className="font-medium">{summary?.perfectPercentage || 0}% Perfect</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Audited Records Count */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Total Patients Audited
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {summary?.totalPatients || 0}
                  </span>
                  <span className="text-xs text-muted-foreground">records</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">
                {summary?.perfectRecordsCount || 0}
              </span>{' '}
              records 100% complete
            </p>
          </CardContent>
        </Card>

        {/* Incomplete Records Card */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Incomplete Records
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {summary?.incompleteRecordsCount || 0}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">
                    ({summary?.incompletePercentage || 0}%)
                  </span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Needs profile updates or clinical assignment
            </p>
          </CardContent>
        </Card>

        {/* Critical Missing Errors */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Critical Missing Errors
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {summary?.criticalErrorsCount || 0}
                  </span>
                  <span className="text-xs text-muted-foreground font-medium">errors</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Missing phone or doctor blocks automation
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Field-by-Field Missing Data Percentage Breakdown - Clean Minimal Design */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Field-by-Field Completeness & Error Rates</CardTitle>
              <CardDescription className="text-xs">
                Detailed percentage breakdown of data missing across specific clinical and contact parameters.
              </CardDescription>
            </div>
            <span className="rounded-md bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
              8 Core Parameters
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {fieldHealth && (
              <>
                {/* 1. Phone */}
                <div
                  onClick={() => setSelectedFilter('missing-phone')}
                  className="cursor-pointer rounded-lg border border-border/70 p-3 transition-colors hover:border-primary/60 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">WhatsApp / Phone</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{fieldHealth.phone.percentage}%</span>
                  </div>
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${fieldHealth.phone.percentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{fieldHealth.phone.completeCount} valid</span>
                      <span className="font-medium">
                        {fieldHealth.phone.missingPercentage}% missing ({fieldHealth.phone.missingCount})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. Address */}
                <div
                  onClick={() => setSelectedFilter('missing-address')}
                  className="cursor-pointer rounded-lg border border-border/70 p-3 transition-colors hover:border-primary/60 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Address</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{fieldHealth.address.percentage}%</span>
                  </div>
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${fieldHealth.address.percentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{fieldHealth.address.completeCount} valid</span>
                      <span className="font-medium">
                        {fieldHealth.address.missingPercentage}% missing ({fieldHealth.address.missingCount})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Doctor */}
                <div
                  onClick={() => setSelectedFilter('missing-doctor')}
                  className="cursor-pointer rounded-lg border border-border/70 p-3 transition-colors hover:border-primary/60 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <UserCheck className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Assigned Doctor</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{fieldHealth.doctor.percentage}%</span>
                  </div>
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${fieldHealth.doctor.percentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{fieldHealth.doctor.completeCount} assigned</span>
                      <span className="font-medium">
                        {fieldHealth.doctor.missingPercentage}% missing ({fieldHealth.doctor.missingCount})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 4. Demographics */}
                <div
                  onClick={() => setSelectedFilter('incomplete')}
                  className="cursor-pointer rounded-lg border border-border/70 p-3 transition-colors hover:border-primary/60 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Age & Gender</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{fieldHealth.demographics.percentage}%</span>
                  </div>
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${fieldHealth.demographics.percentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{fieldHealth.demographics.completeCount} recorded</span>
                      <span className="font-medium">
                        {fieldHealth.demographics.missingPercentage}% missing
                      </span>
                    </div>
                  </div>
                </div>

                {/* 5. Consultation */}
                <div
                  onClick={() => setSelectedFilter('missing-consultation')}
                  className="cursor-pointer rounded-lg border border-border/70 p-3 transition-colors hover:border-primary/60 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Stethoscope className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Diagnosis / Condition</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{fieldHealth.consultation.percentage}%</span>
                  </div>
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${fieldHealth.consultation.percentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{fieldHealth.consultation.completeCount} diagnosed</span>
                      <span className="font-medium">
                        {fieldHealth.consultation.missingPercentage}% missing ({fieldHealth.consultation.missingCount})
                      </span>
                    </div>
                  </div>
                </div>

                {/* 6. Prescription */}
                <div
                  onClick={() => setSelectedFilter('missing-prescription')}
                  className="cursor-pointer rounded-lg border border-border/70 p-3 transition-colors hover:border-primary/60 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Pill className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Active Prescription</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{fieldHealth.prescription.percentage}%</span>
                  </div>
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${fieldHealth.prescription.percentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{fieldHealth.prescription.completeCount} active</span>
                      <span className="font-medium">
                        {fieldHealth.prescription.missingPercentage}% missing
                      </span>
                    </div>
                  </div>
                </div>

                {/* 7. Follow-Up */}
                <div
                  onClick={() => setSelectedFilter('missing-followup')}
                  className="cursor-pointer rounded-lg border border-border/70 p-3 transition-colors hover:border-primary/60 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CalendarClock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Follow-Up Schedule</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{fieldHealth.followup.percentage}%</span>
                  </div>
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${fieldHealth.followup.percentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{fieldHealth.followup.completeCount} scheduled</span>
                      <span className="font-medium">
                        {fieldHealth.followup.missingPercentage}% missing
                      </span>
                    </div>
                  </div>
                </div>

                {/* 8. Review */}
                <div
                  onClick={() => setSelectedFilter('missing-review')}
                  className="cursor-pointer rounded-lg border border-border/70 p-3 transition-colors hover:border-primary/60 hover:bg-muted/30"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Star className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-xs font-medium">Feedback / Review</span>
                    </div>
                    <span className="text-xs font-semibold text-foreground">{fieldHealth.review.percentage}%</span>
                  </div>
                  <div className="mt-2.5">
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full bg-primary"
                        style={{ width: `${fieldHealth.review.percentage}%` }}
                      />
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>{fieldHealth.review.completeCount} rated</span>
                      <span className="font-medium">
                        {fieldHealth.review.missingPercentage}% pending
                      </span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actionable Smart Suggestions - Subtle & Minimal */}
      {suggestions.length > 0 && (
        <div className="space-y-2.5">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-muted-foreground" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Smart Suggestions & Remediation Actions
            </h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {suggestions.map((sug) => (
              <div
                key={sug.id}
                className="flex flex-col justify-between rounded-lg border border-border bg-card p-3.5 shadow-sm transition-colors hover:border-primary/50"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-foreground">
                      {sug.type}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {sug.affectedCount} Affected
                    </span>
                  </div>
                  <h3 className="mt-2 text-xs font-semibold text-foreground">{sug.title}</h3>
                  <p className="mt-1 text-[11px] text-muted-foreground leading-relaxed">
                    {sug.description}
                  </p>
                </div>
                <div className="mt-3 pt-2.5 border-t border-border/60">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedFilter(sug.filterValue)}
                    className="w-full justify-between text-xs h-7 px-2 cursor-pointer hover:bg-muted"
                  >
                    <span>{sug.actionLabel}</span>
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Audited Patients Table Section */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Audited Patient Records</CardTitle>
              <CardDescription className="text-xs">
                Showing {filteredPatients.length} of {data?.patients.length || 0} audited patient records.
              </CardDescription>
            </div>

            {/* Search and Risk Level Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-60">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search patient, ID, doctor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <Select value={riskFilter} onValueChange={setRiskFilter}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <SlidersHorizontal className="mr-1.5 h-3 w-3" />
                  <SelectValue placeholder="Risk Level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Risk Levels</SelectItem>
                  <SelectItem value="high">High Risk (&lt;60%)</SelectItem>
                  <SelectItem value="medium">Medium Risk</SelectItem>
                  <SelectItem value="low">Optimal (Low Risk)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
            {[
              { id: 'all', label: 'All Patients', count: data?.patients.length || 0 },
              { id: 'incomplete', label: 'Incomplete (<100%)', count: summary?.incompleteRecordsCount || 0 },
              { id: 'missing-phone', label: 'Missing Phone', count: fieldHealth?.phone.missingCount || 0 },
              { id: 'missing-address', label: 'Missing Address', count: fieldHealth?.address.missingCount || 0 },
              { id: 'missing-doctor', label: 'Missing Doctor', count: fieldHealth?.doctor.missingCount || 0 },
              { id: 'missing-consultation', label: 'Missing Diagnosis', count: fieldHealth?.consultation.missingCount || 0 },
              { id: 'missing-prescription', label: 'Missing Rx', count: fieldHealth?.prescription.missingCount || 0 },
              { id: 'missing-followup', label: 'Missing Follow-Up', count: fieldHealth?.followup.missingCount || 0 },
              { id: 'perfect', label: '100% Perfect', count: summary?.perfectRecordsCount || 0 },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  selectedFilter === tab.id
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
                  <th className="px-4 py-3">Patient</th>
                  <th className="px-4 py-3">Contact & Address</th>
                  <th className="px-4 py-3">Assigned Doctor</th>
                  <th className="px-4 py-3">Completeness</th>
                  <th className="px-4 py-3">Missing Data Fields</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-xs text-muted-foreground">
                      No audited records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr
                      key={patient.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      {/* Patient ID & Name */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-muted font-semibold text-xs text-foreground">
                            {patient.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <Link
                              to={`/patients/${patient.patientId}`}
                              className="font-semibold text-foreground hover:underline text-xs"
                            >
                              {patient.name}
                            </Link>
                            <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                              <span>{patient.patientId}</span>
                              <span>•</span>
                              <span>{patient.age}y / {patient.gender}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Contact & Address */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1.5 text-foreground">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {patient.hasPhone ? (
                              <span>{patient.phone}</span>
                            ) : (
                              <span className="text-muted-foreground italic">Missing</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-muted-foreground truncate max-w-xs text-[11px]">
                            <MapPin className="h-3 w-3 shrink-0" />
                            {patient.hasAddress ? (
                              <span className="truncate">{patient.address}</span>
                            ) : (
                              <span className="italic">No address</span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Doctor */}
                      <td className="px-4 py-3">
                        <span className="text-xs font-medium text-foreground">
                          {patient.doctor}
                        </span>
                        <div className="text-[11px] text-muted-foreground">
                          {patient.status}
                        </div>
                      </td>

                      {/* Completeness Score */}
                      <td className="px-4 py-3">
                        <div className="w-24 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground">
                              {patient.completenessScore}%
                            </span>
                            <span className="text-[10px] text-muted-foreground">
                              {patient.completedFields.length}/8
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${patient.completenessScore}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Missing Fields Badges */}
                      <td className="px-4 py-3">
                        {patient.missingFields.length === 0 ? (
                          <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
                            <CheckCircle2 className="h-3 w-3 text-primary" />
                            Complete
                          </span>
                        ) : (
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {patient.missingFields.slice(0, 2).map((field) => (
                              <span
                                key={field}
                                className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium"
                              >
                                {field}
                              </span>
                            ))}
                            {patient.missingFields.length > 2 && (
                              <span className="rounded bg-muted/60 px-1 py-0.5 text-[10px] text-muted-foreground">
                                +{patient.missingFields.length - 2}
                              </span>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setActiveModalPatient(patient)}
                            className="h-7 text-xs px-2.5 cursor-pointer"
                          >
                            Quick Fix
                          </Button>
                          <Link to={`/patients/${patient.patientId}`}>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer"
                              title="View Patient Profile"
                            >
                              <ArrowUpRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
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

      {/* Quick Fix Modal */}
      <QuickFixModal
        open={!!activeModalPatient}
        onOpenChange={(open) => !open && setActiveModalPatient(null)}
        patient={activeModalPatient}
        onSave={handleQuickFixSave}
      />
    </div>
  )
}
