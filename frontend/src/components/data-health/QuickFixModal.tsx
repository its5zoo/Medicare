import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AuditedPatient, QuickFixPayload } from '@/services/dataHealthApi'
import { CheckCircle2, AlertCircle, Sparkles } from 'lucide-react'

interface QuickFixModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  patient: AuditedPatient | null
  onSave: (payload: QuickFixPayload) => Promise<void>
}

export function QuickFixModal({ open, onOpenChange, patient, onSave }: QuickFixModalProps) {
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [age, setAge] = useState<number | string>(28)
  const [gender, setGender] = useState('Female')
  const [address, setAddress] = useState('')
  const [doctor, setDoctor] = useState('Dr. Priya Sharma')
  const [status, setStatus] = useState('Consultation Pending')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (patient) {
      setName(patient.name || '')
      setPhone(patient.phone || '')
      setAge(patient.age || 28)
      setGender(patient.gender || 'Female')
      setAddress(patient.address || '')
      setDoctor(patient.doctor && patient.doctor !== 'Unassigned' ? patient.doctor : 'Dr. Priya Sharma')
      setStatus(patient.status || 'Consultation Pending')
    }
  }, [patient])

  if (!patient) return null

  const handleAutoSuggestAddress = () => {
    if (!address) {
      setAddress('Sector 14, Ring Road, Medical Enclave, New Delhi')
    }
  }

  const handleAutoFormatPhone = () => {
    const raw = phone.replace(/\D/g, '')
    if (raw.length === 10) {
      setPhone(`91${raw}`)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await onSave({
        patientId: patient.patientId,
        name,
        phone,
        age: Number(age),
        gender,
        address,
        doctor,
        status,
      })
      onOpenChange(false)
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Complete Patient Record</DialogTitle>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
              {patient.patientId}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            Fix missing data fields to increase clinical data completeness to 100%.
          </p>
        </DialogHeader>

        {patient.missingFields.length > 0 && (
          <div className="rounded-lg border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-700 dark:text-amber-300">
            <div className="flex items-center gap-1.5 font-semibold">
              <AlertCircle className="h-3.5 w-3.5" />
              Missing Information:
            </div>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              {patient.missingFields.map((field) => (
                <span
                  key={field}
                  className="rounded bg-amber-500/20 px-2 py-0.5 font-medium text-amber-800 dark:text-amber-200"
                >
                  {field}
                </span>
              ))}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Full Name</Label>
              <Input
                className="mt-1 h-9 text-sm"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <div className="flex items-center justify-between">
                <Label className="text-xs">WhatsApp / Phone</Label>
                <button
                  type="button"
                  onClick={handleAutoFormatPhone}
                  className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
                >
                  <Sparkles className="h-2.5 w-2.5" /> Auto-91
                </button>
              </div>
              <Input
                className="mt-1 h-9 text-sm"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="919876543210"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Age</Label>
              <Input
                type="number"
                className="mt-1 h-9 text-sm"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                min={1}
                max={120}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Gender</Label>
              <Select value={gender} onValueChange={setGender}>
                <SelectTrigger className="mt-1 h-9 text-sm">
                  <SelectValue placeholder="Select Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <Label className="text-xs">Residential Address</Label>
              <button
                type="button"
                onClick={handleAutoSuggestAddress}
                className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
              >
                <Sparkles className="h-2.5 w-2.5" /> Suggest Sample
              </button>
            </div>
            <Input
              className="mt-1 h-9 text-sm"
              placeholder="House, Street, Area, City, PIN"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Assigned Doctor</Label>
              <Select value={doctor} onValueChange={setDoctor}>
                <SelectTrigger className="mt-1 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Priya Sharma">Dr. Priya Sharma (Senior Derm)</SelectItem>
                  <SelectItem value="Dr. Rahul Mehta">Dr. Rahul Mehta (Trichologist)</SelectItem>
                  <SelectItem value="Dr. Ananya Iyer">Dr. Ananya Iyer (Cosmetologist)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Clinical Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="mt-1 h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Registered">Registered</SelectItem>
                  <SelectItem value="Consultation Pending">Consultation Pending</SelectItem>
                  <SelectItem value="Active Treatment">Active Treatment</SelectItem>
                  <SelectItem value="Follow-Up Due">Follow-Up Due</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-4 pt-2 border-t border-border">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="gradient"
              size="sm"
              disabled={saving}
              className="gap-1.5"
            >
              <CheckCircle2 className="h-4 w-4" />
              {saving ? 'Saving...' : 'Save & Update Health Score'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
