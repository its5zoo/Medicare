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
import type { BedItem, InpatientDetail } from '@/data/bedManagementData'
import { UserPlus, BedDouble } from 'lucide-react'

interface AdmitPatientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bed: BedItem | null
  availableBeds: BedItem[]
  onAdmit: (bedId: string, inpatient: InpatientDetail) => void
}

export function AdmitPatientModal({
  open,
  onOpenChange,
  bed,
  availableBeds,
  onAdmit,
}: AdmitPatientModalProps) {
  const [selectedBedId, setSelectedBedId] = useState<string>('')
  const [patientName, setPatientName] = useState('')
  const [age, setAge] = useState<number | string>(34)
  const [gender, setGender] = useState<'Male' | 'Female' | 'Other'>('Male')
  const [phone, setPhone] = useState('+91 94384 79763')
  const [doctor, setDoctor] = useState('Dr. Rahul Mehta')
  const [diagnosis, setDiagnosis] = useState('Acute Flare & Inpatient Observation')
  const [attendingNurse, setAttendingNurse] = useState('Nurse Ananya Sharma')
  const [diet, setDiet] = useState('High Protein / Low Sodium')
  const [emergencyContact, setEmergencyContact] = useState('+91 98201 11223 (Family)')

  const today = new Date().toISOString().split('T')[0]
  const defaultDischarge = new Date()
  defaultDischarge.setDate(defaultDischarge.getDate() + 3)
  const [expectedDischargeDate, setExpectedDischargeDate] = useState(
    defaultDischarge.toISOString().split('T')[0]
  )

  useEffect(() => {
    if (bed) {
      setSelectedBedId(bed.id)
    } else if (availableBeds.length > 0 && !selectedBedId) {
      setSelectedBedId(availableBeds[0].id)
    }
  }, [bed, availableBeds])

  const targetBed = availableBeds.find((b) => b.id === selectedBedId) || bed

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedBedId || !patientName.trim()) return

    const patientId = `PID-${Math.floor(1000 + Math.random() * 9000)}`
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })

    const inpatient: InpatientDetail = {
      patientId,
      patientName: patientName.trim(),
      age: Number(age) || 30,
      gender,
      phone: phone.trim(),
      admittedDate: today,
      admittedTime: nowTime,
      expectedDischargeDate,
      doctor,
      diagnosis: diagnosis.trim(),
      attendingNurse,
      diet: diet.trim(),
      totalDaysStay: 1,
      estimatedBill: targetBed ? targetBed.dailyRate : 1500,
      emergencyContact: emergencyContact.trim(),
    }

    onAdmit(selectedBedId, inpatient)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Inpatient Admission & Bed Allocation</DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Assign patient to a vacant hospital bed and record medical admission notes.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Bed Selection */}
          <div>
            <Label className="text-xs font-semibold">Select Bed & Ward</Label>
            <Select value={selectedBedId} onValueChange={setSelectedBedId}>
              <SelectTrigger className="mt-1 h-9 text-xs">
                <SelectValue placeholder="Choose an available bed" />
              </SelectTrigger>
              <SelectContent>
                {availableBeds.map((b) => (
                  <SelectItem key={b.id} value={b.id}>
                    {b.bedNumber} • {b.ward} ({b.floor}) - ₹{b.dailyRate}/day
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Patient Full Name</Label>
              <Input
                className="mt-1 h-9 text-xs"
                placeholder="e.g. Farhan Ali"
                value={patientName}
                onChange={(e) => setPatientName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Contact Phone</Label>
              <Input
                className="mt-1 h-9 text-xs"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Age</Label>
              <Input
                type="number"
                min={1}
                max={120}
                className="mt-1 h-9 text-xs"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Gender</Label>
              <Select value={gender} onValueChange={(v: any) => setGender(v)}>
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Admitting Doctor</Label>
              <Select value={doctor} onValueChange={setDoctor}>
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Dr. Rahul Mehta">Dr. Rahul Mehta</SelectItem>
                  <SelectItem value="Dr. Priya Sharma">Dr. Priya Sharma</SelectItem>
                  <SelectItem value="Dr. Rizwana Barkat">Dr. Rizwana Barkat</SelectItem>
                  <SelectItem value="Dr. Muzammil Barkat">Dr. Muzammil Barkat</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label className="text-xs">Primary Admission Diagnosis / Condition</Label>
            <Input
              className="mt-1 h-9 text-xs"
              placeholder="e.g. Severe Dermatitis / Post-Procedure Stay"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Expected Discharge Date</Label>
              <Input
                type="date"
                className="mt-1 h-9 text-xs"
                value={expectedDischargeDate}
                onChange={(e) => setExpectedDischargeDate(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Attending Nurse</Label>
              <Input
                className="mt-1 h-9 text-xs"
                value={attendingNurse}
                onChange={(e) => setAttendingNurse(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Diet Instructions</Label>
              <Input
                className="mt-1 h-9 text-xs"
                value={diet}
                onChange={(e) => setDiet(e.target.value)}
              />
            </div>
            <div>
              <Label className="text-xs">Emergency Contact</Label>
              <Input
                className="mt-1 h-9 text-xs"
                value={emergencyContact}
                onChange={(e) => setEmergencyContact(e.target.value)}
              />
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
              variant="default"
              size="sm"
              className="gap-1.5"
            >
              <UserPlus className="h-4 w-4" />
              Confirm Admission
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
