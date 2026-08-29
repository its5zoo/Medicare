import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { triggerPostWriteSync } from '@/services/postWriteSync'
import type { PatientSearchIndexItem } from '@/api/types'
import {
  createEmptyMedicine,
  type ConsultationMedicineDraft,
  type FollowUpTimeSlot,
  type InfectionType,
} from '@/components/consultation/types'
import { useDashboard } from '@/hooks/useDashboard'
import { usePatientSearch } from '@/hooks/usePatientSearch'
import { useWorkflowTransaction } from '@/hooks/useWorkflowTransaction'
import {
  buildConsultationPatientLabel,
  createConsultation,
  mapMedicineToPayload,
  type ConsultationResponseData,
} from '@/services/consultationApi'
import { formatConsultationSuccessLines } from '@/utils/formatters'
import {
  isConsultationFormValid,
  validateConsultationForm,
  type ConsultationFormErrors,
} from '@/utils/validators'

export const CONSULTATION_WORKFLOW_STEPS = [
  'Creating Condition',
  'Creating Prescriptions',
  'Scheduling Follow-Up',
  'Generating Timeline',
  'Finalizing Consultation',
] as const

export type ConsultationSelectedPatient = PatientSearchIndexItem

interface UseConsultationProps {
  initialPatientId?: string
}

export function useConsultation({ initialPatientId }: UseConsultationProps = {}) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchFocused, setSearchFocused] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState<ConsultationSelectedPatient | null>(null)

  const [skinProblem, setSkinProblem] = useState('')
  const [infectionType, setInfectionType] = useState<InfectionType>('Acne')
  const [diagnosisDate, setDiagnosisDate] = useState(
    () => new Date().toISOString().split('T')[0]
  )
  const [doctorNotes, setDoctorNotes] = useState('')
  const [medicines, setMedicines] = useState<ConsultationMedicineDraft[]>(() => [
    createEmptyMedicine(),
  ])
  const [expandedMedicineId, setExpandedMedicineId] = useState<string | null>(
    () => medicines[0]?.id ?? null
  )
  const [followUpDate, setFollowUpDate] = useState('')
  const [followUpTime, setFollowUpTime] = useState<FollowUpTimeSlot>('Morning')
  const [showValidation, setShowValidation] = useState(false)

  // Success metadata for routing
  const [lastPatientId, setLastPatientId] = useState<string | null>(null)
  const [notFound, setNotFound] = useState(false)

  const { data: dashboard } = useDashboard()
  const searchIndex = dashboard?.patientSearchIndex
  const { results: searchResults } = usePatientSearch(searchIndex, searchQuery)
  const transaction = useWorkflowTransaction()
  const queryClient = useQueryClient()


  // Auto-restore patient from URL
  useEffect(() => {
    if (initialPatientId && searchIndex && !selectedPatient) {
      const found = searchIndex.find((p) => p.patientId === initialPatientId)
      if (found) {
        setSelectedPatient(found)
        setNotFound(false)
      } else {
        setNotFound(true)
      }
    } else if (!initialPatientId) {
      setNotFound(false)
    }
  }, [initialPatientId, searchIndex, selectedPatient])

  const formValues = useMemo(
    () => ({
      skinProblem,
      infectionType,
      diagnosisDate,
      followUpDate,
      followUpTime,
      medicines,
    }),
    [skinProblem, infectionType, diagnosisDate, followUpDate, followUpTime, medicines]
  )

  const errors = useMemo((): ConsultationFormErrors => {
    if (!showValidation) return {}
    return validateConsultationForm(formValues)
  }, [formValues, showValidation])

  const isValid = useMemo(() => isConsultationFormValid(formValues), [formValues])

  const selectPatient = (patient: ConsultationSelectedPatient) => {
    setSelectedPatient(patient)
    setNotFound(false)
    setSearchQuery('')
    setSearchFocused(false)
    navigate(`/consultation/${patient.patientId}`)
  }

  const resetForm = useCallback(() => {
    const first = createEmptyMedicine()
    setSkinProblem('')
    setInfectionType('Acne')
    setDiagnosisDate(new Date().toISOString().split('T')[0])
    setDoctorNotes('')
    setMedicines([first])
    setExpandedMedicineId(first.id)
    setFollowUpDate('')
    setFollowUpTime('Morning')
    setShowValidation(false)
    setLastPatientId(null)
    setNotFound(false)
    transaction.clearStates()
  }, [transaction])

  const updateMedicine = (index: number, med: ConsultationMedicineDraft) => {
    setMedicines((prev) => prev.map((m, i) => (i === index ? med : m)))
  }

  const addMedicine = () => {
    const next = createEmptyMedicine()
    setMedicines((prev) => [...prev, next])
    setExpandedMedicineId(next.id)
  }

  const removeMedicine = (index: number) => {
    setMedicines((prev) => {
      const next = prev.filter((_, i) => i !== index)
      const removed = prev[index]
      if (expandedMedicineId === removed?.id) {
        setExpandedMedicineId(next[next.length - 1]?.id ?? null)
      }
      return next
    })
  }

  const toggleMedicine = (id: string) => {
    setExpandedMedicineId((current) => (current === id ? null : id))
  }

  const submit = async () => {
    if (!selectedPatient) return
    setShowValidation(true)
    const validationErrors = validateConsultationForm(formValues)
    if (Object.keys(validationErrors).length > 0) return

    const activeMedicines = medicines.filter((m) => m.medicineName.trim())

    await transaction.execute<ConsultationResponseData>({
      steps: [...CONSULTATION_WORKFLOW_STEPS],
      apiCall: () =>
        createConsultation({
          Patient: buildConsultationPatientLabel(
            selectedPatient.patientId,
            selectedPatient.fullName
          ),
          'Skin Problem': skinProblem.trim(),
          'Infection Type': infectionType,
          'Diagnosis Date': diagnosisDate,
          Medicines: activeMedicines.map(mapMedicineToPayload),
          'Follow-Up Date': followUpDate,
          'Follow-Up Time': followUpTime,
        }),
      buildSuccess: (data) => {
        setLastPatientId(data.patient.code)

        triggerPostWriteSync({
          queryClient,
          actionType: 'CREATE_CONSULTATION',
          patientId: data.patient.code,
          response: {
            ...data,
            skinProblem: skinProblem.trim(),
            infectionType,
            diagnosisDate,
            medicines: activeMedicines,
          },
        })

        return {
          title: 'Consultation Created',
          lines: formatConsultationSuccessLines(data),
        }
      },
      buildLateNotification: (data) => ({
        title: 'Recent Consultation Completed',
        lines: [
          { label: 'Condition', value: data.condition.id },
          { label: 'Medicines', value: String(data.Medicine.count) },
        ],
      }),
    })
  }

  const clearSelection = () => {
    setSelectedPatient(null)
    resetForm()
    navigate('/consultation')
  }

  return {
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
    lastPatientId,
    notFound,
    ...transaction,
  }
}
