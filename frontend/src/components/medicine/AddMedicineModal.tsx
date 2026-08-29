import { useState } from 'react'
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
import type { MedicineItem } from '@/data/medicineInventoryData'
import { PlusCircle } from 'lucide-react'

interface AddMedicineModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAdd: (newMed: MedicineItem) => void
}

export function AddMedicineModal({ open, onOpenChange, onAdd }: AddMedicineModalProps) {
  const [name, setName] = useState('')
  const [genericName, setGenericName] = useState('')
  const [category, setCategory] = useState<MedicineItem['category']>('Antibiotics')
  const [form, setForm] = useState<MedicineItem['form']>('Tablet')
  const [strength, setStrength] = useState('100 mg')
  const [currentStock, setCurrentStock] = useState<number | string>(50)
  const [unit, setUnit] = useState('Tablets')
  const [minThreshold, setMinThreshold] = useState<number | string>(20)
  const [dailyConsumption, setDailyConsumption] = useState<number | string>(5)
  const [unitPrice, setUnitPrice] = useState<number | string>(25)
  const [supplier, setSupplier] = useState('Cipla Healthcare Labs')
  const [supplierPhone, setSupplierPhone] = useState('+91 98402 33445')
  const [batchNumber, setBatchNumber] = useState(`BAT-${Date.now().toString().slice(-4)}`)

  const defaultExp = new Date()
  defaultExp.setFullYear(defaultExp.getFullYear() + 2)
  const [expiryDate, setExpiryDate] = useState(defaultExp.toISOString().split('T')[0])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const stock = Number(currentStock) || 0
    const daily = Number(dailyConsumption) || 1
    const threshold = Number(minThreshold) || 20
    const days = Math.round(stock / daily)

    let status: 'In Stock' | 'Low Stock' | 'Critical Shortage' | 'Out of Stock' = 'In Stock'
    if (stock <= 0) status = 'Out of Stock'
    else if (days <= 3 || stock <= threshold / 2) status = 'Critical Shortage'
    else if (days <= 10 || stock <= threshold) status = 'Low Stock'

    const deadlineDate = new Date()
    deadlineDate.setDate(deadlineDate.getDate() + Math.max(1, days - 3))

    const newMed: MedicineItem = {
      id: `MED-${Math.floor(100 + Math.random() * 900)}`,
      name: name.trim(),
      genericName: genericName.trim() || name.trim(),
      category,
      form,
      strength: strength.trim(),
      currentStock: stock,
      unit,
      minThreshold: threshold,
      dailyConsumption: daily,
      daysRemaining: days,
      reorderDeadline: deadlineDate.toISOString().split('T')[0],
      status,
      batchNumber: batchNumber.trim(),
      expiryDate,
      isExpiringSoon: false,
      unitPrice: Number(unitPrice) || 0,
      totalValue: stock * (Number(unitPrice) || 0),
      supplier: supplier.trim(),
      supplierPhone: supplierPhone.trim(),
      recommendedReorderQty: threshold * 3,
      lastRestockedDate: new Date().toISOString().split('T')[0],
    }

    onAdd(newMed)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Medicine to Formulary</DialogTitle>
          <p className="text-xs text-muted-foreground">
            Register a new drug with stock, dosage form, and automated depletion tracking.
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Brand Name</Label>
              <Input
                className="mt-1 h-9 text-sm"
                placeholder="e.g. Accutane / Doxinate"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Generic Formula</Label>
              <Input
                className="mt-1 h-9 text-sm"
                placeholder="e.g. Isotretinoin IP"
                value={genericName}
                onChange={(e) => setGenericName(e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Category</Label>
              <Select value={category} onValueChange={(v: any) => setCategory(v)}>
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Retinoids">Retinoids</SelectItem>
                  <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                  <SelectItem value="Antihistamines">Antihistamines</SelectItem>
                  <SelectItem value="Topical Steroids">Topical Steroids</SelectItem>
                  <SelectItem value="Antifungals">Antifungals</SelectItem>
                  <SelectItem value="Cleansers & Sunscreen">Cleansers & Sunscreen</SelectItem>
                  <SelectItem value="Supplements">Supplements</SelectItem>
                  <SelectItem value="Hair Care">Hair Care</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Dosage Form</Label>
              <Select value={form} onValueChange={(v: any) => setForm(v)}>
                <SelectTrigger className="mt-1 h-9 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Tablet">Tablet</SelectItem>
                  <SelectItem value="Capsule">Capsule</SelectItem>
                  <SelectItem value="Cream">Cream</SelectItem>
                  <SelectItem value="Gel">Gel</SelectItem>
                  <SelectItem value="Lotion">Lotion</SelectItem>
                  <SelectItem value="Serum">Serum</SelectItem>
                  <SelectItem value="Shampoo">Shampoo</SelectItem>
                  <SelectItem value="Ointment">Ointment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label className="text-xs">Strength</Label>
              <Input
                className="mt-1 h-9 text-sm"
                placeholder="e.g. 20 mg / 5%"
                value={strength}
                onChange={(e) => setStrength(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label className="text-xs">Initial Stock</Label>
              <Input
                type="number"
                className="mt-1 h-9 text-sm"
                value={currentStock}
                onChange={(e) => setCurrentStock(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Unit Type</Label>
              <Input
                className="mt-1 h-9 text-sm"
                placeholder="Pills / Tubes / Bottles"
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Est. Daily Dispense</Label>
              <Input
                type="number"
                min={1}
                className="mt-1 h-9 text-sm"
                value={dailyConsumption}
                onChange={(e) => setDailyConsumption(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label className="text-xs">Supplier / Distributor</Label>
              <Input
                className="mt-1 h-9 text-sm"
                value={supplier}
                onChange={(e) => setSupplier(e.target.value)}
                required
              />
            </div>
            <div>
              <Label className="text-xs">Unit Price (₹)</Label>
              <Input
                type="number"
                step="0.1"
                className="mt-1 h-9 text-sm"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
                required
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
              variant="gradient"
              size="sm"
              className="gap-1.5"
            >
              <PlusCircle className="h-4 w-4" />
              Add Medicine
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
