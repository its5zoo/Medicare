import { useState } from 'react'
import type { ConditionMedicineRow } from '@/components/patient-profile/ConditionMedicinesTable'
import { ConditionCard } from '@/components/patient-profile/ConditionCard'
import { EmptyState } from '@/components/patient-profile/EmptyState'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { PatientCondition } from '@/data/patientProfileTypes'

interface ProfileConditionsTabProps {
  conditions: PatientCondition[]
  onAddMedicine: (conditionId: string) => void
  onEditMedicine: (medicine: ConditionMedicineRow) => void
  onDiscontinueMedicine: (medicine: ConditionMedicineRow) => void
}

export function ProfileConditionsTab({
  conditions,
  onAddMedicine,
  onEditMedicine,
  onDiscontinueMedicine,
}: ProfileConditionsTabProps) {
  const [expandedId, setExpandedId] = useState<string | null>(conditions[0]?.id ?? null)

  if (conditions.length === 0) {
    return (
      <Card>
        <CardContent className="py-16">
          <EmptyState
            title="No active conditions found."
            description="Complete a consultation to create a condition and prescribe medicines."
          />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Conditions & Medicines</CardTitle>
        <p className="text-sm text-muted-foreground">
          Patient → Conditions → Medicines. Follow-ups are managed separately at patient level.
        </p>
      </CardHeader>
      <CardContent className="grid gap-3 grid-cols-1 sm:grid-cols-2 lg:flex lg:flex-col lg:gap-0 lg:space-y-3">
        {conditions.map((condition) => (
          <ConditionCard
            key={condition.id}
            condition={condition}
            expanded={expandedId === condition.id}
            onToggle={() =>
              setExpandedId((id) => (id === condition.id ? null : condition.id))
            }
            onAddMedicine={() => onAddMedicine(condition.id)}
            onEditMedicine={onEditMedicine}
            onDiscontinueMedicine={onDiscontinueMedicine}
          />
        ))}
      </CardContent>
    </Card>
  )
}
