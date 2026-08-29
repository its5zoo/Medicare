import { ArrowLeft } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { ActiveFollowUpQuickBar } from '@/components/patient-profile/follow-ups/ActiveFollowUpQuickBar'
import type { ConditionMedicineRow } from '@/components/patient-profile/ConditionMedicinesTable'
import { PatientProfileError } from '@/components/patient-profile/PatientProfileError'
import { PatientProfileHeader } from '@/components/patient-profile/PatientProfileHeader'
import { PatientProfileSkeleton } from '@/components/patient-profile/PatientProfileSkeleton'
import { ProfileConditionsTab } from '@/components/patient-profile/ProfileConditionsTab'
import { ProfileFollowUpsTab } from '@/components/patient-profile/ProfileFollowUpsTab'
import { ProfileOverviewTab } from '@/components/patient-profile/ProfileOverviewTab'
import { ProfileTimelineTab } from '@/components/patient-profile/ProfileTimelineTab'
import { DiscontinueMedicineModal } from '@/components/patient-profile/modals/DiscontinueMedicineModal'
import { EditMedicineModal } from '@/components/patient-profile/modals/EditMedicineModal'
import { AddMedicineModal } from '@/components/patient-profile/modals/AddMedicineModal'
import { CompleteFollowUpModal } from '@/components/patient-profile/modals/CompleteFollowUpModal'
import { ManageFollowUpModal } from '@/components/patient-profile/modals/ManageFollowUpModal'
import { RescheduleFollowUpModal } from '@/components/patient-profile/modals/RescheduleFollowUpModal'
import { Button } from '@/components/ui/button'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { PatientFollowUpRecord, UpsertFollowUpInput } from '@/data/patientProfileTypes'
import { usePatientProfile } from '@/hooks/usePatientProfile'
import { useManualFollowUp, MANUAL_FOLLOW_UP_WORKFLOW_STEPS } from '@/hooks/useManualFollowUp'
import { useRescheduleFollowUp, RESCHEDULE_FOLLOW_UP_WORKFLOW_STEPS } from '@/hooks/useRescheduleFollowUp'
import { useCompleteFollowUp, COMPLETE_FOLLOW_UP_WORKFLOW_STEPS } from '@/hooks/useCompleteFollowUp'
import { useCreatePrescription, CREATE_PRESCRIPTION_WORKFLOW_STEPS } from '@/hooks/useCreatePrescription'
import { useUpdatePrescription, UPDATE_PRESCRIPTION_WORKFLOW_STEPS } from '@/hooks/useUpdatePrescription'
import { useDiscontinuePrescription, DISCONTINUE_PRESCRIPTION_WORKFLOW_STEPS } from '@/hooks/useDiscontinuePrescription'
import { TransactionModals } from '@/components/workflow/TransactionModals'

const TAB_VALUES = ['overview', 'conditions', 'follow-ups', 'timeline'] as const

export function PatientProfilePage() {
  const { id: patientId } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const tabParam = searchParams.get('tab') ?? 'overview'
  const tab = TAB_VALUES.includes(tabParam as (typeof TAB_VALUES)[number])
    ? tabParam
    : 'overview'

  const {
    snapshot,
    overview,
    loading,
    isError,
    isNotFound,
    isNetworkError,
    reload,
    isFetching,
  } = usePatientProfile(patientId)

  const manualFollowUpHook = useManualFollowUp()
  const rescheduleHook = useRescheduleFollowUp()
  const completeFollowUpHook = useCompleteFollowUp()
  const createPrescriptionHook = useCreatePrescription()
  const updatePrescriptionHook = useUpdatePrescription()
  const discontinuePrescriptionHook = useDiscontinuePrescription()

  const { error } = manualFollowUpHook // Fallback for network error display

  const activeFollowUp = snapshot?.activeFollowup ?? null

  const [addMedicineConditionId, setAddMedicineConditionId] = useState<string | null>(null)
  const addMedicineConditionName = useMemo(() => {
    if (!addMedicineConditionId || !snapshot) return ''
    return (
      snapshot.conditions.find((c) => c.id === addMedicineConditionId)?.conditionName ?? ''
    )
  }, [addMedicineConditionId, snapshot])

  const [editMedicine, setEditMedicine] = useState<ConditionMedicineRow | null>(null)
  const [discontinueRow, setDiscontinueRow] = useState<ConditionMedicineRow | null>(null)
  const [followUpModalOpen, setFollowUpModalOpen] = useState(false)
  const [completeFollowUpTarget, setCompleteFollowUpTarget] =
    useState<PatientFollowUpRecord | null>(null)
  const [rescheduleTarget, setRescheduleTarget] = useState<PatientFollowUpRecord | null>(null)

  const setTab = (value: string) => setSearchParams({ tab: value })

  const followUpModalMode = activeFollowUp ? 'manage' : 'create'

  const handleManualFollowUpSubmit = async (input: UpsertFollowUpInput) => {
    if (!snapshot || !snapshot.patient) return
    await manualFollowUpHook.submit(snapshot.patient, input)
  }

  // Removed redundant reload effect. The polling engine already syncs data.

  if (loading) {
    return <PatientProfileSkeleton activeTab={tab} />
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-6xl space-y-6">
        <Button variant="ghost" className="-ml-2" onClick={() => navigate('/patients')}>
          <ArrowLeft className="h-4 w-4" />
          Back to Patients
        </Button>
        <PatientProfileError
          variant={isNotFound ? 'not-found' : isNetworkError ? 'network' : 'server'}
          onRetry={isNotFound ? undefined : () => reload()}
          isRetrying={isFetching}
        />
      </div>
    )
  }

  if (!snapshot || !overview) {
    return (
      <div className="mx-auto max-w-6xl">
        <PatientProfileError variant="not-found" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <Button variant="ghost" className="-ml-2" onClick={() => navigate('/patients')}>
        <ArrowLeft className="h-4 w-4" />
        Back to Patients
      </Button>

      <PatientProfileHeader
        overview={overview}
        onFollowUpAction={() => setFollowUpModalOpen(true)}
      />

      {error && !error.isTimeout && error.title === 'Validation Error' && (
        <div className="rounded-2xl border border-danger/30 bg-danger/5 p-4">
          <p className="font-semibold text-danger">{error.title}</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
        </div>
      )}

      {error && !error.isTimeout && error.title === 'Connection Error' && (
        <div className="fixed bottom-4 right-4 z-50 rounded-lg bg-black text-white px-4 py-3 shadow-lg">
          Network error. Please try again.
        </div>
      )}

      {activeFollowUp && tab !== 'follow-ups' && (
        <ActiveFollowUpQuickBar
          followUp={activeFollowUp}
          onGoToTab={() => setTab('follow-ups')}
          onComplete={() => setCompleteFollowUpTarget(activeFollowUp)}
          onReschedule={() => setRescheduleTarget(activeFollowUp)}
        />
      )}

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="h-auto w-full flex-wrap justify-start gap-1 bg-muted/40 p-1">
          <TabsTrigger value="overview" className="rounded-lg px-4">
            Overview
          </TabsTrigger>
          <TabsTrigger value="conditions" className="rounded-lg px-4">
            Conditions
          </TabsTrigger>
          <TabsTrigger value="follow-ups" className="rounded-lg px-4">
            Follow-Ups
          </TabsTrigger>
          <TabsTrigger value="timeline" className="rounded-lg px-4">
            Timeline
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-6">
          <ProfileOverviewTab overview={overview} />
        </TabsContent>

        <TabsContent value="conditions" className="mt-6">
          <ProfileConditionsTab
            conditions={snapshot.conditions}
            onAddMedicine={setAddMedicineConditionId}
            onEditMedicine={setEditMedicine}
            onDiscontinueMedicine={setDiscontinueRow}
          />
        </TabsContent>

        <TabsContent value="follow-ups" className="mt-6">
          <ProfileFollowUpsTab
            activeFollowUp={snapshot.activeFollowup}
            followupHistory={snapshot.followupHistory}
            onComplete={setCompleteFollowUpTarget}
            onReschedule={setRescheduleTarget}
          />
        </TabsContent>

        <TabsContent value="timeline" className="mt-6">
          <ProfileTimelineTab events={snapshot.timeline} />
        </TabsContent>
      </Tabs>

      <AddMedicineModal
        open={!!addMedicineConditionId}
        onOpenChange={(open) => !open && setAddMedicineConditionId(null)}
        conditionId={addMedicineConditionId}
        conditionName={addMedicineConditionName}
        onSubmit={(input) => {
          if (snapshot?.patient) createPrescriptionHook.submit(snapshot.patient.id, input)
        }}
      />

      <EditMedicineModal
        open={!!editMedicine}
        onOpenChange={(open) => !open && setEditMedicine(null)}
        medicine={editMedicine}
        onSubmit={(input) => {
          if (editMedicine && snapshot?.patient) {
            updatePrescriptionHook.submit(snapshot.patient.id, editMedicine.conditionId, editMedicine.id, input)
          }
        }}
      />

      <DiscontinueMedicineModal
        open={!!discontinueRow}
        onOpenChange={(open) => !open && setDiscontinueRow(null)}
        medicine={discontinueRow}
        onConfirm={(reason) => {
          if (discontinueRow && snapshot?.patient) {
            discontinuePrescriptionHook.submit(snapshot.patient.id, discontinueRow.conditionId, discontinueRow.id, reason)
          }
        }}
      />

      <ManageFollowUpModal
        open={followUpModalOpen}
        onOpenChange={setFollowUpModalOpen}
        mode={followUpModalMode}
        activeFollowUp={activeFollowUp}
        onSubmit={handleManualFollowUpSubmit}
        disabled={manualFollowUpHook.isRunning}
      />

      <TransactionModals transaction={manualFollowUpHook} steps={[...MANUAL_FOLLOW_UP_WORKFLOW_STEPS]} loadingTitle="Scheduling Follow-Up" />
      <TransactionModals transaction={rescheduleHook} steps={[...RESCHEDULE_FOLLOW_UP_WORKFLOW_STEPS]} loadingTitle="Rescheduling Follow-Up" />
      <TransactionModals transaction={completeFollowUpHook} steps={[...COMPLETE_FOLLOW_UP_WORKFLOW_STEPS]} loadingTitle="Completing Follow-Up" />
      <TransactionModals transaction={createPrescriptionHook} steps={[...CREATE_PRESCRIPTION_WORKFLOW_STEPS]} loadingTitle="Creating Prescription" />
      <TransactionModals transaction={updatePrescriptionHook} steps={[...UPDATE_PRESCRIPTION_WORKFLOW_STEPS]} loadingTitle="Updating Prescription" />
      <TransactionModals transaction={discontinuePrescriptionHook} steps={[...DISCONTINUE_PRESCRIPTION_WORKFLOW_STEPS]} loadingTitle="Discontinuing Prescription" />

      <CompleteFollowUpModal
        open={!!completeFollowUpTarget}
        onOpenChange={(open) => !open && setCompleteFollowUpTarget(null)}
        followUp={completeFollowUpTarget}
        onConfirm={(notes) => {
          if (completeFollowUpTarget && snapshot?.patient) {
            completeFollowUpHook.submit(snapshot.patient.id, snapshot.patient.name, completeFollowUpTarget.id, notes)
          }
        }}
      />

      <RescheduleFollowUpModal
        open={!!rescheduleTarget}
        onOpenChange={(open) => !open && setRescheduleTarget(null)}
        followUp={rescheduleTarget}
        onSubmit={(input) => {
          if (rescheduleTarget && snapshot?.patient) {
            rescheduleHook.submit(snapshot.patient.id, snapshot.patient.name, input)
          }
        }}
      />
    </div>
  )
}
