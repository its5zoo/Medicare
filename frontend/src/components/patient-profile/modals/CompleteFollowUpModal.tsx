import { useState } from 'react'
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
import { Textarea } from '@/components/ui/textarea'
import type { PatientFollowUpRecord } from '@/data/patientProfileTypes'
import { formatDate } from '@/lib/utils'

interface CompleteFollowUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  followUp: PatientFollowUpRecord | null
  onConfirm: (notes?: string) => void
}

export function CompleteFollowUpModal({
  open,
  onOpenChange,
  followUp,
  onConfirm,
}: CompleteFollowUpModalProps) {
  const [notes, setNotes] = useState('')

  if (!followUp) return null

  const handleConfirm = () => {
    onConfirm(notes.trim() || undefined)
    setNotes('')
    onOpenChange(false)
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      setNotes('')
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Complete Follow-Up</DialogTitle>
          <DialogDescription>
            Mark the follow-up on <strong>{formatDate(followUp.date)}</strong> (
            {followUp.timeSlot}) as completed?
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-2">
          <Label>Visit Notes (Optional)</Label>
          <Textarea
            className="mt-1.5"
            placeholder="Any notes for this visit..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="gradient"
            onClick={handleConfirm}
          >
            Confirm Complete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
