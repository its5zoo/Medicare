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
  RescheduleFollowUpInput,
} from '@/data/patientProfileTypes'

interface RescheduleFollowUpModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  followUp: PatientFollowUpRecord | null
  onSubmit: (input: RescheduleFollowUpInput) => void
}

export function RescheduleFollowUpModal({
  open,
  onOpenChange,
  followUp,
  onSubmit,
}: RescheduleFollowUpModalProps) {
  const [date, setDate] = useState('')
  const [timeSlot, setTimeSlot] = useState<FollowUpTimeSlot>('Morning')
  const [reason, setReason] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  // Calculate tomorrow's date for the min attribute
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const tomorrowStr = tomorrow.toISOString().split('T')[0]

  useEffect(() => {
    if (followUp) {
      setDate(followUp.date)
      setTimeSlot(followUp.timeSlot)
      setReason(followUp.rescheduleReason ?? '')
    }
  }, [followUp])

  // Clear error when modal closes/opens
  useEffect(() => {
    if (!open) setErrorMsg('')
  }, [open])

  if (!followUp) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Server-side validation check client-side
    const today = new Date().toISOString().split('T')[0]
    if (date <= today) {
      setErrorMsg('Please select a future date.')
      return
    }

    setErrorMsg('')
    onSubmit({ date, timeSlot, reason })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Reschedule Follow-Up</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>New Date</Label>
            <Input 
              type="date" 
              className="mt-1.5" 
              value={date} 
              onChange={(e) => {
                setDate(e.target.value)
                setErrorMsg('')
              }} 
              min={tomorrowStr}
              required 
            />
            {errorMsg && <p className="text-sm text-danger mt-1">{errorMsg}</p>}
          </div>
          <FollowUpTimeChipSelect value={timeSlot} onChange={setTimeSlot} />
          <div>
            <Label>Reason</Label>
            <Textarea
              className="mt-1.5"
              placeholder="Reason for rescheduling..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="gradient">
              Reschedule
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
