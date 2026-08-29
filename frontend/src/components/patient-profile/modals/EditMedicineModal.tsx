import { useEffect, useState } from 'react'
import type { ConditionMedicineRow } from '@/components/patient-profile/ConditionMedicinesTable'
import { TimingChipSelect } from '@/components/consultation/TimingChipSelect'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { FrequencyOption, MedicineUpdateMode, TimingOption, UpdateMedicineInput } from '@/data/patientProfileTypes'

interface EditMedicineModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine: ConditionMedicineRow | null
  onSubmit: (input: UpdateMedicineInput) => void
}

export function EditMedicineModal({
  open,
  onOpenChange,
  medicine,
  onSubmit,
}: EditMedicineModalProps) {
  const [dosage, setDosage] = useState('')
  const [timing, setTiming] = useState<TimingOption[]>([])
  const [frequency, setFrequency] = useState<FrequencyOption>('Daily')
  const [instructions, setInstructions] = useState('')
  const [updateMode, setUpdateMode] = useState<MedicineUpdateMode>('')
  const [extendDays, setExtendDays] = useState('14')
  const [replaceDurationDays, setReplaceDurationDays] = useState('30')

  useEffect(() => {
    if (medicine) {
      setDosage(medicine.dosage)
      setTiming([...medicine.timing])
      setFrequency(medicine.frequency)
      setInstructions(medicine.instructions)
      setUpdateMode('')
    }
  }, [medicine])

  if (!medicine) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      dosage,
      timing,
      frequency,
      instructions,
      updateMode,
      extendDays: updateMode === 'Extend' ? Number(extendDays) : undefined,
      replaceDurationDays:
        updateMode === 'Replace_Current' ? Number(replaceDurationDays) : undefined,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Medicine</DialogTitle>
          <p className="text-sm text-muted-foreground">{medicine.medicineName}</p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Update Mode</Label>
            <Select
              value={updateMode || 'none'}
              onValueChange={(v) => setUpdateMode(v === 'none' ? '' : (v as MedicineUpdateMode))}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue placeholder="Optional - extend or replace" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None - update details only</SelectItem>
                <SelectItem value="Extend">Extend</SelectItem>
                <SelectItem value="Replace_Current">Replace_Current</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {updateMode === 'Extend' && (
            <div>
              <Label>Extend Days</Label>
              <Input type="number" min={1} className="mt-1.5" value={extendDays} onChange={(e) => setExtendDays(e.target.value)} />
            </div>
          )}
          {updateMode === 'Replace_Current' && (
            <div>
              <Label>Replace Duration (Days)</Label>
              <Input type="number" min={1} className="mt-1.5" value={replaceDurationDays} onChange={(e) => setReplaceDurationDays(e.target.value)} />
            </div>
          )}
          <div>
            <Label>Dosage</Label>
            <Input className="mt-1.5" value={dosage} onChange={(e) => setDosage(e.target.value)} required />
          </div>
          <TimingChipSelect value={timing} onChange={setTiming} />
          <div>
            <Label>Frequency</Label>
            <Select value={frequency} onValueChange={(v) => setFrequency(v as FrequencyOption)}>
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {['Daily', 'Alternate Days', 'Weekly'].map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Instructions</Label>
            <Textarea className="mt-1.5" value={instructions} onChange={(e) => setInstructions(e.target.value)} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
