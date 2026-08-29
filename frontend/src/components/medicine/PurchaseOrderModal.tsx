import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import type { MedicineItem } from '@/data/medicineInventoryData'
import { ShoppingCart, Copy, CheckCircle2, Download, AlertTriangle } from 'lucide-react'

interface PurchaseOrderModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  lowStockItems: MedicineItem[]
}

export function PurchaseOrderModal({
  open,
  onOpenChange,
  lowStockItems,
}: PurchaseOrderModalProps) {
  const [copied, setCopied] = useState(false)

  if (!lowStockItems.length) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md text-center py-8">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <DialogTitle className="mt-3">All Medicines Fully Stocked</DialogTitle>
          <p className="text-xs text-muted-foreground mt-1">
            There are currently no items in Low Stock or Critical Shortage status.
          </p>
          <DialogFooter className="mt-4 sm:justify-center">
            <Button variant="outline" size="sm" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const totalEstCost = lowStockItems.reduce(
    (sum, item) => sum + item.recommendedReorderQty * item.unitPrice,
    0
  )

  const poText = `📋 *MEDICURE CLINIC - PURCHASE ORDER REQUEST*
Date: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
Items to Replenish:
${lowStockItems
  .map(
    (item, i) =>
      `${i + 1}. *${item.name}* (${item.strength})
   - Current Stock: ${item.currentStock} ${item.unit} (Days Left: ${item.daysRemaining}d)
   - Reorder Qty: ${item.recommendedReorderQty} ${item.unit}
   - Supplier: ${item.supplier}
   - Est. Price: ₹${(item.recommendedReorderQty * item.unitPrice).toLocaleString('en-IN')}`
  )
  .join('\n\n')}

*Total Estimated Procurement Cost:* ₹${totalEstCost.toLocaleString('en-IN')}
_Please confirm dispatch and delivery timeline._`

  const handleCopy = () => {
    navigator.clipboard.writeText(poText)
    setCopied(true)
    setTimeout(() => setCopied(false), 3000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <ShoppingCart className="h-4 w-4" />
            </div>
            <div>
              <DialogTitle>Smart Purchase Order (PO) Generator</DialogTitle>
              <p className="text-xs text-muted-foreground">
                Auto-compiled procurement list for {lowStockItems.length} items with low or critical inventory levels.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {/* Summary Box */}
          <div className="flex items-center justify-between rounded-xl bg-gradient-to-br from-primary/10 to-indigo-500/10 p-4 border border-primary/20">
            <div>
              <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                Total Reorder Value
              </span>
              <p className="text-2xl font-extrabold text-foreground mt-0.5">
                ₹{totalEstCost.toLocaleString('en-IN')}
              </p>
            </div>
            <div className="text-right text-xs">
              <span className="rounded-md bg-rose-500/10 px-2 py-1 font-bold text-rose-600">
                {lowStockItems.length} Items Require Reorder
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="rounded-xl border border-border overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-muted/50 text-muted-foreground font-semibold border-b border-border">
                <tr>
                  <th className="p-2.5">Medicine & Strength</th>
                  <th className="p-2.5">Stock Left</th>
                  <th className="p-2.5">Order Qty</th>
                  <th className="p-2.5">Supplier</th>
                  <th className="p-2.5 text-right">Est. Cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {lowStockItems.map((item) => (
                  <tr key={item.id} className="hover:bg-muted/30">
                    <td className="p-2.5">
                      <p className="font-semibold text-foreground">{item.name}</p>
                      <span className="text-[10px] text-muted-foreground">{item.strength}</span>
                    </td>
                    <td className="p-2.5">
                      <span className="font-bold text-rose-600">{item.currentStock} {item.unit}</span>
                      <p className="text-[10px] text-muted-foreground">({item.daysRemaining} days left)</p>
                    </td>
                    <td className="p-2.5 font-bold text-primary">
                      +{item.recommendedReorderQty} {item.unit}
                    </td>
                    <td className="p-2.5 text-muted-foreground">
                      {item.supplier}
                    </td>
                    <td className="p-2.5 text-right font-semibold">
                      ₹{(item.recommendedReorderQty * item.unitPrice).toLocaleString('en-IN')}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <DialogFooter className="mt-4 pt-3 border-t border-border flex items-center justify-between sm:justify-between">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="gap-1.5"
          >
            {copied ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
            {copied ? 'Copied WhatsApp PO!' : 'Copy WhatsApp PO Text'}
          </Button>

          <Button
            type="button"
            variant="gradient"
            size="sm"
            onClick={() => onOpenChange(false)}
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
