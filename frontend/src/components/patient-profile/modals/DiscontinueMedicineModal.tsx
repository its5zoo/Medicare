import { useState } from 'react'
import type { ConditionMedicineRow } from '@/components/patient-profile/ConditionMedicinesTable'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { DiscontinueReason } from '@/data/patientProfileTypes'
import { DISCONTINUE_REASONS } from '@/data/patientProfileTypes'

interface DiscontinueMedicineModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine: ConditionMedicineRow | null
  onConfirm: (reason: DiscontinueReason) => void
}

export function DiscontinueMedicineModal({
  open,
  onOpenChange,
  medicine,
  onConfirm,
}: DiscontinueMedicineModalProps) {
  const [reason, setReason] = useState<DiscontinueReason>('Doctor Instruction')

  if (!medicine) return null

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Discontinue Medicine</DialogTitle>
          <DialogDescription>
            Confirm discontinuation of <strong>{medicine.medicineName}</strong> for this
            condition.
          </DialogDescription>
        </DialogHeader>
        <div>
          <Label>Reason</Label>
          <Select value={reason} onValueChange={(v) => setReason(v as DiscontinueReason)}>
            <SelectTrigger className="mt-1.5">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {DISCONTINUE_REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={() => {
              onConfirm(reason)
              onOpenChange(false)
            }}
          >
            Confirm Discontinue
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
