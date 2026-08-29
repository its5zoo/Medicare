import { motion } from 'framer-motion'
import { Layers, Plus } from 'lucide-react'
import { MedicineAccordionCard } from '@/components/consultation/MedicineAccordionCard'
import type { ConsultationMedicineDraft } from '@/components/consultation/types'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface PrescriptionBuilderSectionProps {
  medicines: ConsultationMedicineDraft[]
  expandedMedicineId: string | null
  onToggleMedicine: (id: string) => void
  onUpdateMedicine: (index: number, medicine: ConsultationMedicineDraft) => void
  onRemoveMedicine: (index: number) => void
  onAddMedicine: () => void
  medicineErrors?: Record<string, Partial<Record<keyof ConsultationMedicineDraft, string>>>
}

export function PrescriptionBuilderSection({
  medicines,
  expandedMedicineId,
  onToggleMedicine,
  onUpdateMedicine,
  onRemoveMedicine,
  onAddMedicine,
  medicineErrors,
}: PrescriptionBuilderSectionProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 space-y-0 pb-3">
        <div>
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Layers className="h-5 w-5 text-primary" />
            Prescription Builder
          </CardTitle>
          <p className="mt-1 text-sm text-muted-foreground">
            Each medicine has its own schedule. Expand a card to edit; collapse to save space.
          </p>
        </div>
        <span className="shrink-0 rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
          {medicines.length} {medicines.length === 1 ? 'medicine' : 'medicines'}
        </span>
      </CardHeader>
      <CardContent className="space-y-2 pt-0">
        {medicines.map((med, index) => (
          <MedicineAccordionCard
            key={med.id}
            medicine={med}
            index={index}
            expanded={expandedMedicineId === med.id}
            onToggle={() => onToggleMedicine(med.id)}
            onChange={(m) => onUpdateMedicine(index, m)}
            onRemove={() => onRemoveMedicine(index)}
            canRemove={true}
            errors={medicineErrors?.[med.id]}
          />
        ))}

        <motion.div layout>
          <Button
            type="button"
            variant="outline"
            className="mt-2 w-full border-dashed py-5 text-sm font-medium"
            onClick={onAddMedicine}
          >
            <Plus className="h-4 w-4" />
            Add Another Medicine
          </Button>
        </motion.div>
      </CardContent>
    </Card>
  )
}
