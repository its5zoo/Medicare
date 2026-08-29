import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import type { BedItem } from '@/data/bedManagementData'
import { CheckCircle2, UserMinus, Receipt, FileText } from 'lucide-react'

interface DischargePatientModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bed: BedItem | null
  onDischarge: (bedId: string, markForCleaning: boolean) => void
}

export function DischargePatientModal({
  open,
  onOpenChange,
  bed,
  onDischarge,
}: DischargePatientModalProps) {
  const [markForCleaning, setMarkForCleaning] = useState(true)
  const [dischargeNotes, setDischargeNotes] = useState('Patient stable, post-treatment recovery complete.')

  if (!bed || !bed.patient) return null

  const p = bed.patient
  const daysStay = Math.max(1, p.totalDaysStay || 1)
  const totalRoomRent = daysStay * bed.dailyRate

  const handleConfirm = () => {
    onDischarge(bed.id, markForCleaning)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md text-xs">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Patient Discharge & Bed Clearance</DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Complete stay summary and free up {bed.bedNumber} ({bed.ward}).
          </p>
        </DialogHeader>

        {/* Inpatient Summary Card */}
        <div className="rounded-lg border border-border bg-muted/40 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold text-foreground text-sm">{p.patientName}</p>
              <span className="text-[11px] text-muted-foreground">{p.patientId} • {p.age}y / {p.gender}</span>
            </div>
            <span className="rounded bg-muted px-2 py-0.5 font-medium text-foreground text-[11px]">
              {bed.bedNumber}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/70 text-[11px]">
            <div>
              <span className="text-muted-foreground">Admitted:</span>
              <p className="font-medium text-foreground">{p.admittedDate} ({p.admittedTime})</p>
            </div>
            <div>
              <span className="text-muted-foreground">Discharge:</span>
              <p className="font-medium text-foreground">Today ({new Date().toLocaleDateString()})</p>
            </div>
            <div>
              <span className="text-muted-foreground">Doctor:</span>
              <p className="font-medium text-foreground">{p.doctor}</p>
            </div>
            <div>
              <span className="text-muted-foreground">Length of Stay:</span>
              <p className="font-medium text-foreground">{daysStay} Day(s)</p>
            </div>
          </div>
        </div>

        {/* Bill Summary */}
        <div className="rounded-lg border border-border bg-card p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Receipt className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-xs font-semibold text-foreground">Total Bed & Stay Charges</p>
              <span className="text-[10px] text-muted-foreground">₹{bed.dailyRate}/day × {daysStay} days</span>
            </div>
          </div>
          <span className="text-base font-bold text-foreground">
            ₹{totalRoomRent.toLocaleString('en-IN')}
          </span>
        </div>

        {/* Discharge Notes */}
        <div>
          <Label className="text-xs">Clinical Discharge Notes</Label>
          <Input
            className="mt-1 h-9 text-xs"
            value={dischargeNotes}
            onChange={(e) => setDischargeNotes(e.target.value)}
          />
        </div>

        {/* Next Step Checkbox */}
        <label className="flex items-center gap-2 cursor-pointer pt-1">
          <input
            type="checkbox"
            checked={markForCleaning}
            onChange={(e) => setMarkForCleaning(e.target.checked)}
            className="rounded border-border"
          />
          <span className="text-xs text-muted-foreground">
            Mark bed as <strong>"Cleaning / Sanitizing"</strong> before making it available for the next admission.
          </span>
        </label>

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
            type="button"
            variant="default"
            size="sm"
            onClick={handleConfirm}
            className="gap-1.5"
          >
            <UserMinus className="h-4 w-4" />
            Confirm Discharge
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
