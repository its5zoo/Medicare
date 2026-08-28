import type { ConditionMedicineRow } from '@/components/patient-profile/ConditionMedicinesTable'
import { ConditionCard } from '@/components/patient-profile/ConditionCard'
import type { PatientCondition } from '@/data/patientProfileTypes'

interface ConditionAccordionCardProps {
  condition: PatientCondition
  expanded: boolean
  onToggle: () => void
  onAddMedicine: () => void
  onEditMedicine: (medicine: ConditionMedicineRow) => void
  onDiscontinueMedicine: (medicine: ConditionMedicineRow) => void
}

export function ConditionAccordionCard(props: ConditionAccordionCardProps) {
  return <ConditionCard {...props} />
}
