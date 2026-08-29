import { useEffect, useState } from 'react'
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
import type { AddMedicineInput, FrequencyOption, TimingOption } from '@/data/patientProfileTypes'
import { FREQUENCY_OPTIONS } from '@/data/patientProfileTypes'

interface AddMedicineModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  conditionId: string | null
  conditionName: string
  onSubmit: (input: AddMedicineInput) => void
}

export function AddMedicineModal({
  open,
  onOpenChange,
  conditionId,
  conditionName,
  onSubmit,
}: AddMedicineModalProps) {
  const [medicineName, setMedicineName] = useState('')
  const [dosage, setDosage] = useState('')
  const [timing, setTiming] = useState<TimingOption[]>([])
  const [frequency, setFrequency] = useState<FrequencyOption>('Daily')
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0])
  const [durationDays, setDurationDays] = useState('30')
  const [instructions, setInstructions] = useState('')

  useEffect(() => {
    if (!open) return
    setMedicineName('')
    setDosage('')
    setTiming([])
    setFrequency('Daily')
    setStartDate(new Date().toISOString().split('T')[0])
    setDurationDays('30')
    setInstructions('')
  }, [open, conditionId])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!conditionId) return
    onSubmit({
      conditionId,
      medicineName,
      dosage,
      timing,
      frequency,
      startDate,
      durationDays: Number(durationDays) || 30,
      instructions,
    })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Medicine</DialogTitle>
          <p className="text-sm text-muted-foreground">
            Condition: <span className="font-medium text-foreground">{conditionName}</span>
          </p>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label>Medicine Name</Label>
            <Input className="mt-1.5" value={medicineName} onChange={(e) => setMedicineName(e.target.value)} required />
          </div>
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
                {FREQUENCY_OPTIONS.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Medicine Start Date</Label>
              <Input type="date" className="mt-1.5" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
            </div>
            <div>
              <Label>Duration (Days)</Label>
              <Input type="number" min={1} className="mt-1.5" value={durationDays} onChange={(e) => setDurationDays(e.target.value)} required />
            </div>
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
              Add Medicine
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
