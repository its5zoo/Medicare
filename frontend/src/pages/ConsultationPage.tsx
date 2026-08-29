import { motion, AnimatePresence } from 'framer-motion'
import { Search } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConditionInformationCard } from '@/components/consultation/ConditionInformationCard'
import { ConsultationSummaryCard } from '@/components/consultation/ConsultationSummaryCard'
import { FollowUpScheduleCard } from '@/components/consultation/FollowUpScheduleCard'
import { PatientSummaryCard } from '@/components/consultation/PatientSummaryCard'
import { PrescriptionBuilderSection } from '@/components/consultation/PrescriptionBuilderSection'
import { RemindersInfoCard } from '@/components/consultation/RemindersInfoCard'
import { WorkflowModal } from '@/components/workflow/WorkflowModal'
import { PageHeader } from '@/components/shared/PageHeader'
import { TransactionResultCard } from '@/components/shared/TransactionResultCard'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CONSULTATION_WORKFLOW_STEPS, useConsultation } from '@/hooks/useConsultation'
import { formatDisplayName } from '@/lib/patientDisplayFormat'
import { cn } from '@/lib/utils'

export function ConsultationPage() {
  const { patientId } = useParams<{ patientId: string }>()
  const navigate = useNavigate()
  const consultation = useConsultation({ initialPatientId: patientId })
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const resultsRef = useRef<HTMLDivElement>(null)
  const {
    searchQuery,
    setSearchQuery,
    searchFocused,
    setSearchFocused,
    searchResults,
    selectedPatient,
    selectPatient,
    clearSelection,
    skinProblem,
    setSkinProblem,
    infectionType,
    setInfectionType,
    diagnosisDate,
    setDiagnosisDate,
    doctorNotes,
    setDoctorNotes,
    medicines,
    expandedMedicineId,
    updateMedicine,
    addMedicine,
    removeMedicine,
    toggleMedicine,
    followUpDate,
    setFollowUpDate,
    followUpTime,
    setFollowUpTime,
    errors,
    isValid,
    submit,
    resetForm,
    isRunning,
    success,
    error,
    timeoutNotice,
    lastPatientId,
    notFound,
  } = consultation

  useEffect(() => {
    setSelectedIndex(-1)
  }, [searchQuery, searchFocused])

  useEffect(() => {
    if (selectedIndex >= 0 && resultsRef.current) {
      const selectedItem = resultsRef.current.querySelector(`[data-index="${selectedIndex}"]`)
      if (selectedItem) {
        selectedItem.scrollIntoView({ block: 'nearest' })
      }
    }
  }, [selectedIndex])

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

      if (!isInputFocused && !hasOpenModals) {
        if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && /[a-zA-Z0-9]/.test(e.key)) {
          e.preventDefault()
          const consultSearch = document.getElementById('consultation-search-input') as HTMLInputElement | null
          if (consultSearch) {
            consultSearch.focus()
            const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
            if (nativeInputValueSetter) {
              nativeInputValueSetter.call(consultSearch, consultSearch.value + e.key)
              consultSearch.dispatchEvent(new Event('input', { bubbles: true }))
            }
          }
        }
      }
    }

    window.addEventListener('keydown', handleGlobalKeyDown)
    return () => window.removeEventListener('keydown', handleGlobalKeyDown)
  }, [])

  if (success) {
    return (
      <TransactionResultCard
        variant="success"
        title={success.title}
        lines={success.lines}
        primaryAction={{
          label: 'View Patient',
          onClick: () => {
            if (lastPatientId) {
              navigate(`/patients/${lastPatientId}`)
            }
          },
        }}
        secondaryAction={{
          label: 'New Consultation',
          onClick: () => {
            clearSelection()
            resetForm()
          },
        }}
      />
    )
  }

  if (notFound) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
        <Search className="h-11 w-11 text-muted-foreground/40" />
        <h2 className="mt-4 text-xl font-bold tracking-tight">Patient Not Found</h2>
        <p className="mt-1 max-w-md text-sm text-muted-foreground">
          We couldn't find a patient with the ID "{patientId}".
        </p>
        <Button className="mt-6" variant="outline" onClick={() => navigate('/consultation')}>
          Back To Consultation Search
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl pb-12 md:pb-0">
      <PageHeader
        title="Consultation"
        description="Structured dermatology workflow - condition, per-medicine prescriptions, and follow-up."
      />

      {error && !error.isTimeout && (
        <div className="mb-6 rounded-2xl border border-danger/30 bg-danger/5 p-4">
          <p className="font-semibold text-danger">{error.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        </div>
      )}

      {timeoutNotice && (
        <div className="mb-6 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4">
          <p className="font-semibold text-amber-700 dark:text-amber-400">
            Processing Taking Longer Than Expected
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            We&apos;ll notify you if the workflow completes.
          </p>
        </div>
      )}

      <div className="relative mb-6">
        <div
          className={cn(
            'relative rounded-2xl border transition-all duration-200',
            searchFocused
              ? 'border-primary/40 bg-card shadow-lg ring-4 ring-primary/10'
              : 'border-border bg-muted/30'
          )}
        >
          <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="consultation-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'ArrowDown') {
                e.preventDefault()
                if (searchResults.length > 0) {
                  setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0))
                }
              } else if (e.key === 'ArrowUp') {
                e.preventDefault()
                if (searchResults.length > 0) {
                  setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1))
                }
              } else if (e.key === 'Enter') {
                e.preventDefault()
                if (searchResults.length > 0) {
                  if (selectedIndex >= 0 && searchResults[selectedIndex]) {
                    selectPatient(searchResults[selectedIndex])
                  } else {
                    selectPatient(searchResults[0])
                  }
                  document.getElementById('consultation-search-input')?.blur()
                }
              } else if (e.key === 'Escape') {
                e.preventDefault()
                setSelectedIndex(-1)
                document.getElementById('consultation-search-input')?.blur()
              }
            }}
            placeholder="Search by Patient ID, Phone Number, or Name..."
            className="h-14 border-0 bg-transparent pl-14 pr-6 text-base shadow-none focus-visible:ring-0"
            disabled={isRunning}
            autoComplete="off"
          />
        </div>

        <AnimatePresence>
          {searchFocused && searchResults.length > 0 && (
            <motion.div
              ref={resultsRef}
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full left-0 right-0 z-20 mt-2 max-h-[300px] overflow-y-auto rounded-2xl border border-border bg-card shadow-xl"
            >
              {searchResults.map((patient, index) => (
                <button
                  key={patient.patientId}
                  data-index={index}
                  type="button"
                  onMouseDown={() => selectPatient(patient)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={cn(
                    "flex w-full cursor-pointer items-center gap-4 border-b border-border/50 px-5 py-4 sm:py-3.5 text-left transition-colors last:border-0",
                    index === selectedIndex ? "bg-muted/60" : "hover:bg-muted/60"
                  )}
                >
                  <div className="min-w-0 flex-1 space-y-0.5">
                    <p className="font-mono text-sm font-semibold text-primary">
                      {patient.patientId}
                    </p>
                    <p className="font-medium">{formatDisplayName(patient.fullName)}</p>
                    <p className="text-sm text-muted-foreground">{patient.phone}</p>
                    <p className="text-sm text-muted-foreground">{patient.doctor}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {selectedPatient && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
        >
          <WorkflowModal
            open={isRunning}
            steps={[...CONSULTATION_WORKFLOW_STEPS]}
            title="Saving Consultation"
          />

          <form
            onSubmit={(e) => {
              e.preventDefault()
              submit()
            }}
          >
            <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
              <div className="space-y-5">
                <PatientSummaryCard patient={selectedPatient} />

                <ConditionInformationCard
                  skinProblem={skinProblem}
                  onSkinProblemChange={setSkinProblem}
                  infectionType={infectionType}
                  onInfectionTypeChange={setInfectionType}
                  diagnosisDate={diagnosisDate}
                  onDiagnosisDateChange={setDiagnosisDate}
                  doctorNotes={doctorNotes}
                  onDoctorNotesChange={setDoctorNotes}
                  skinProblemError={errors.skinProblem}
                  infectionTypeError={errors.infectionType}
                  diagnosisDateError={errors.diagnosisDate}
                />

                <PrescriptionBuilderSection
                  medicines={medicines}
                  expandedMedicineId={expandedMedicineId}
                  onToggleMedicine={toggleMedicine}
                  onUpdateMedicine={updateMedicine}
                  onRemoveMedicine={removeMedicine}
                  onAddMedicine={addMedicine}
                  medicineErrors={errors.medicines}
                />

                <div className="grid gap-5 lg:grid-cols-2">
                  <FollowUpScheduleCard
                    followUpDate={followUpDate}
                    onFollowUpDateChange={setFollowUpDate}
                    followUpTime={followUpTime}
                    onFollowUpTimeChange={setFollowUpTime}
                    followUpDateError={errors.followUpDate}
                    followUpTimeError={errors.followUpTime}
                  />
                  <RemindersInfoCard />
                </div>

                <div className="xl:hidden">
                  <ConsultationSummaryCard
                    patientName={selectedPatient.fullName}
                    conditionType={infectionType}
                    skinProblem={skinProblem}
                    medicines={medicines}
                    followUpDate={followUpDate}
                    followUpTime={followUpTime}
                  />
                </div>

                <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={clearSelection}
                    disabled={isRunning}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    variant="gradient"
                    size="lg"
                    disabled={!isValid || isRunning}
                  >
                    Save Consultation
                  </Button>
                </div>
              </div>

              <aside className="hidden xl:block">
                <div className="sticky top-24 space-y-4">
                  <ConsultationSummaryCard
                    compact
                    patientName={selectedPatient.fullName}
                    conditionType={infectionType}
                    skinProblem={skinProblem}
                    medicines={medicines}
                    followUpDate={followUpDate}
                    followUpTime={followUpTime}
                  />
                </div>
              </aside>
            </div>
          </form>
        </motion.div>
      )}

      {!selectedPatient && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border py-16 text-center">
          <Search className="h-11 w-11 text-muted-foreground/40" />
          <p className="mt-4 text-lg font-medium">Search for a patient to begin</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Try DERM-1040, Md Faizaan Fatah, or a phone number
          </p>
        </div>
      )}
    </div>
  )
}
