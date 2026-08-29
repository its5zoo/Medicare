import { useEffect, useState } from 'react'
import { FollowUpTimeChipSelect } from '@/components/consultation/FollowUpTimeChipSelect'
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
import { Textarea } from '@/components/ui/textarea'
import type {
  FollowUpTimeSlot,
  PatientFollowUpRecord,
  UpsertFollowUpInput,
} from '@/data/patientProfileTypes'

interface ManageFollowUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'create' | 'manage'
  activeFollowUp: PatientFollowUpRecord | null
  onSubmit: (input: UpsertFollowUpInput) => void
  disabled?: boolean
}

export function ManageFollowUpModal({
  open,
  onOpenChange,
  mode,
  activeFollowUp,
  onSubmit,
  disabled,
}: ManageFollowUpModalProps) {
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState<FollowUpTimeSlot>('Morning')
  const [reason, setReason] = useState('')
  const [clinicNotes, setClinicNotes] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    if (mode === 'manage' && activeFollowUp) {
      setDate(activeFollowUp.date)
      setTimeSlot(activeFollowUp.timeSlot)
    } else {
      setDate('')
      setTimeSlot('Morning')
    }
    setReason('')
    setClinicNotes('')
    setError(null)
  }, [open, mode, activeFollowUp])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (reason.trim() && reason.trim().length < 3) {
      setError('Follow-Up Reason must be at least 3 characters.')
      return
    }
    if (reason.trim() && reason.trim().length > 200) {
      setError('Follow-Up Reason must be at most 200 characters.')
      return
    }
    if (clinicNotes.trim() && clinicNotes.trim().length > 2000) {
      setError('Clinic Notes must be at most 2000 characters.')
      return
    }
    setError(null)
    onSubmit({
      date,
      timeSlot,
      source: 'Manual',
      reason: reason.trim() || undefined,
      clinicNotes: clinicNotes.trim() || undefined,
    })
    onOpenChange(false)
  }

  const isManage = mode === 'manage'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isManage ? 'Manage Active Follow-Up' : 'Create Follow-Up'}
          </DialogTitle>
          <p className="text-sm text-muted-foreground">
            {isManage
              ? 'Updates the existing active follow-up. A second active follow-up will not be created.'
              : 'Schedule a patient-level follow-up. Only one active follow-up is allowed at a time.'}
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-sm font-medium text-danger">{error}</p>}
          <div>
            <Label>Follow-Up Date</Label>
            <Input
              type="date"
              className="mt-1.5"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              required
              disabled={disabled}
            />
          </div>
          <FollowUpTimeChipSelect value={timeSlot} onChange={setTimeSlot} disabled={disabled} />
          
          <div>
            <Label>Follow-Up Reason (Optional)</Label>
            <Input
              className="mt-1.5"
              placeholder="e.g. Review skin improvement"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              maxLength={200}
              disabled={disabled}
            />
          </div>
          
          <div>
            <Label>Clinic Notes (Optional)</Label>
            <Textarea
              className="mt-1.5"
              placeholder="e.g. Patient reported itching reduced..."
              value={clinicNotes}
              onChange={(e) => setClinicNotes(e.target.value)}
              maxLength={2000}
              disabled={disabled}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={disabled}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient" disabled={disabled}>
              {isManage ? 'Save Changes' : 'Schedule Follow-Up'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
