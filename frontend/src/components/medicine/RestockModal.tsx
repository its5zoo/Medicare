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
import type { MedicineItem } from '@/data/medicineInventoryData'
import { PackagePlus, Calendar, AlertCircle } from 'lucide-react'

interface RestockModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  medicine: MedicineItem | null
  onSave: (updatedMedicine: MedicineItem) => void
}

export function RestockModal({ open, onOpenChange, medicine, onSave }: RestockModalProps) {
  const [addQty, setAddQty] = useState<number | string>(50)
  const [batchNumber, setBatchNumber] = useState('')
  const [expiryDate, setExpiryDate] = useState('')
  const [unitPrice, setUnitPrice] = useState<number | string>(0)

  useEffect(() => {
    if (medicine) {
      setAddQty(medicine.recommendedReorderQty || 50)
      setBatchNumber(`BAT-${Date.now().toString().slice(-4)}`)
      // Default 18 months expiry
      const exp = new Date()
      exp.setMonth(exp.getMonth() + 18)
      setExpiryDate(exp.toISOString().split('T')[0])
      setUnitPrice(medicine.unitPrice || 0)
    }
  }, [medicine])

  if (!medicine) return null

  const newStock = medicine.currentStock + Number(addQty || 0)
  const dailyRate = medicine.dailyConsumption || 1
  const newDays = Math.round(newStock / dailyRate)

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault()
    const added = Number(addQty) || 0
    const finalStock = medicine.currentStock + added

    let newStatus: 'In Stock' | 'Low Stock' | 'Critical Shortage' | 'Out of Stock' = 'In Stock'
    if (newDays <= 3 || finalStock <= medicine.minThreshold / 2) {
      newStatus = 'Critical Shortage'
    } else if (newDays <= 10 || finalStock <= medicine.minThreshold) {
      newStatus = 'Low Stock'
    }

    const reorderDate = new Date()
    reorderDate.setDate(reorderDate.getDate() + Math.max(1, newDays - 3))

    const updated: MedicineItem = {
      ...medicine,
      currentStock: finalStock,
      daysRemaining: newDays,
      status: newStatus,
      reorderDeadline: reorderDate.toISOString().split('T')[0],
      batchNumber: batchNumber.trim() || medicine.batchNumber,
      expiryDate: expiryDate || medicine.expiryDate,
      unitPrice: Number(unitPrice) || medicine.unitPrice,
      totalValue: finalStock * (Number(unitPrice) || medicine.unitPrice),
      lastRestockedDate: new Date().toISOString().split('T')[0],
    }

    onSave(updated)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <DialogTitle>Receive Medicine Stock / Restock</DialogTitle>
          </div>
          <p className="text-xs text-muted-foreground">
            Update inventory stock, batch number, and expiration date for {medicine.name}.
          </p>
        </DialogHeader>

        <div className="rounded-xl border border-border/70 bg-muted/40 p-3.5 space-y-2 text-xs">
          <div className="flex items-center justify-between font-semibold">
            <span className="text-foreground">{medicine.name}</span>
            <span className="rounded bg-primary/10 px-2 py-0.5 text-primary font-bold">
              {medicine.strength}
            </span>
          </div>
          <div className="grid grid-cols-3 gap-2 pt-1 text-[11px] text-muted-foreground border-t border-border/60">
            <div>
              <span>Current Stock:</span>
              <p className="font-bold text-foreground">{medicine.currentStock} {medicine.unit}</p>
            </div>
            <div>
              <span>Daily Dispense:</span>
              <p className="font-bold text-foreground">~{medicine.dailyConsumption}/day</p>
            </div>
            <div>
              <span>Days Left:</span>
              <p className="font-bold text-amber-600">{medicine.daysRemaining} days</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Quantity to Add ({medicine.unit})</Label>
              <Input
                type="number"
                min={1}
                className="mt-1 h-9 text-sm"
                value={addQty}
                onChange={(e) => setAddQty(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Unit Purchase Price (₹)</Label>
              <Input
                type="number"
                step="0.1"
                min={0}
                className="mt-1 h-9 text-sm"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">New Batch Number</Label>
              <Input
                className="mt-1 h-9 text-sm"
                value={batchNumber}
                onChange={(e) => setBatchNumber(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Expiry Date</Label>
              <Input
                type="date"
                className="mt-1 h-9 text-sm"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Real-time Calculation Preview */}
          <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-1.5 font-medium">
              <PackagePlus className="h-4 w-4" />
              <span>Projected Post-Restock Stock:</span>
            </div>
            <div className="text-right font-bold">
              <span>{newStock} {medicine.unit}</span>
              <span className="ml-1 text-[11px] font-semibold text-emerald-600">({newDays} Days Supply)</span>
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
              className="gap-1.5"
            >
              <PackagePlus className="h-4 w-4" />
              Confirm Restock
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
