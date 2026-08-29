import { useState, useMemo, useEffect } from 'react'
import {
  Pill,
  Search,
  CheckCircle2,
  Package,
  PackagePlus,
  ShoppingCart,
  Download,
  PlusCircle,
  Calendar,
  Filter,
  DollarSign,
  TrendingDown,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  initialMedicines,
  type MedicineItem,
} from '@/data/medicineInventoryData'
import { RestockModal } from '@/components/medicine/RestockModal'
import { AddMedicineModal } from '@/components/medicine/AddMedicineModal'
import { PurchaseOrderModal } from '@/components/medicine/PurchaseOrderModal'

const STORAGE_KEY = 'medicure_medicine_inventory_v1'

export function MedicineTrackerPage() {
  const [medicines, setMedicines] = useState<MedicineItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        return JSON.parse(saved)
      } catch {
        // Use initial
      }
    }
    return initialMedicines
  })

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [selectedMedicineForRestock, setSelectedMedicineForRestock] = useState<MedicineItem | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isPOModalOpen, setIsPOModalOpen] = useState(false)
  const [toastMsg, setToastMsg] = useState<string | null>(null)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(medicines))
  }, [medicines])

  const showToast = (msg: string) => {
    setToastMsg(msg)
    setTimeout(() => setToastMsg(null), 3500)
  }

  // Stock KPI Calculations
  const metrics = useMemo(() => {
    const total = medicines.length
    const critical = medicines.filter((m) => m.status === 'Critical Shortage' || m.status === 'Out of Stock').length
    const low = medicines.filter((m) => m.status === 'Low Stock').length
    const healthy = medicines.filter((m) => m.status === 'In Stock').length
    const totalValue = medicines.reduce((acc, m) => acc + m.totalValue, 0)
    const dailyDispenseTotal = medicines.reduce((acc, m) => acc + m.dailyConsumption, 0)

    return {
      total,
      critical,
      low,
      healthy,
      totalValue,
      dailyDispenseTotal,
    }
  }, [medicines])

  // Filtered List
  const filteredMedicines = useMemo(() => {
    return medicines.filter((m) => {
      // 1. Search Query
      const q = search.toLowerCase().trim()
      const matchesSearch =
        !q ||
        m.name.toLowerCase().includes(q) ||
        m.genericName.toLowerCase().includes(q) ||
        m.batchNumber.toLowerCase().includes(q) ||
        m.supplier.toLowerCase().includes(q) ||
        m.form.toLowerCase().includes(q)

      if (!matchesSearch) return false

      // 2. Category Filter
      if (categoryFilter !== 'all' && m.category !== categoryFilter) {
        return false
      }

      // 3. Status Tab Filter
      switch (statusFilter) {
        case 'critical':
          return m.status === 'Critical Shortage' || m.status === 'Out of Stock'
        case 'low':
          return m.status === 'Low Stock'
        case 'healthy':
          return m.status === 'In Stock'
        case 'expiring':
          return m.isExpiringSoon
        default:
          return true
      }
    })
  }, [medicines, search, statusFilter, categoryFilter])

  // Handlers
  const handleRestockSave = (updated: MedicineItem) => {
    setMedicines((prev) => prev.map((m) => (m.id === updated.id ? updated : m)))
    showToast(`Restocked ${updated.name}! Stock increased to ${updated.currentStock} ${updated.unit}.`)
  }

  const handleAddNewMedicine = (newMed: MedicineItem) => {
    setMedicines((prev) => [newMed, ...prev])
    showToast(`Added ${newMed.name} (${newMed.strength}) to clinic formulary!`)
  }

  const handleQuickAdjust = (id: string, delta: number) => {
    setMedicines((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m
        const newStock = Math.max(0, m.currentStock + delta)
        const days = Math.round(newStock / (m.dailyConsumption || 1))

        let status: MedicineItem['status'] = 'In Stock'
        if (newStock <= 0) status = 'Out of Stock'
        else if (days <= 3 || newStock <= m.minThreshold / 2) status = 'Critical Shortage'
        else if (days <= 10 || newStock <= m.minThreshold) status = 'Low Stock'

        const deadlineDate = new Date()
        deadlineDate.setDate(deadlineDate.getDate() + Math.max(1, days - 3))

        return {
          ...m,
          currentStock: newStock,
          daysRemaining: days,
          status,
          reorderDeadline: deadlineDate.toISOString().split('T')[0],
          totalValue: newStock * m.unitPrice,
        }
      })
    )
  }

  const handleExportCSV = () => {
    const headers = [
      'Medicine ID',
      'Brand Name',
      'Generic Formula',
      'Category',
      'Form',
      'Strength',
      'Current Stock',
      'Unit',
      'Daily Dispense Rate',
      'Days of Stock Remaining',
      'Reorder Deadline',
      'Stock Status',
      'Batch Number',
      'Expiry Date',
      'Unit Price (INR)',
      'Total Value (INR)',
      'Supplier Name',
      'Supplier Phone',
    ]

    const rows = medicines.map((m) => [
      m.id,
      `"${m.name.replace(/"/g, '""')}"`,
      `"${m.genericName.replace(/"/g, '""')}"`,
      m.category,
      m.form,
      m.strength,
      m.currentStock,
      m.unit,
      m.dailyConsumption,
      m.daysRemaining,
      m.reorderDeadline,
      m.status,
      m.batchNumber,
      m.expiryDate,
      m.unitPrice,
      m.totalValue,
      `"${m.supplier.replace(/"/g, '""')}"`,
      `"${m.supplierPhone}"`,
    ])

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((e) => e.join(','))].join('\n')
    const encodedUri = encodeURI(csvContent)
    const link = document.createElement('a')
    link.setAttribute('href', encodedUri)
    link.setAttribute(
      'download',
      `medicure_medicine_stock_report_${new Date().toISOString().split('T')[0]}.csv`
    )
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    showToast('Exported Medicine Inventory CSV report!')
  }

  const lowStockItems = useMemo(() => {
    return medicines.filter((m) => m.status === 'Critical Shortage' || m.status === 'Low Stock' || m.status === 'Out of Stock')
  }, [medicines])

  return (
    <div className="space-y-6 pb-12">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-4 right-4 z-50 flex items-center gap-2 rounded-xl bg-foreground px-4 py-3 text-sm text-background shadow-xl animate-in fade-in slide-in-from-bottom-5">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-muted text-foreground">
              <Pill className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Medicine Stock & Inventory Tracker</h1>
              <p className="text-xs text-muted-foreground">
                Track available drug quantities, calculate remaining days of stock, and manage automated reorder deadlines.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleExportCSV}
            className="h-8 text-xs gap-1.5 cursor-pointer"
          >
            <Download className="h-3.5 w-3.5" />
            Export Stock CSV
          </Button>
        </div>
      </div>

      {/* Overview KPI Metrics - Clean Neutral Design */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Medicines */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Formulary Medicines
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">{metrics.total}</span>
                  <span className="text-xs text-muted-foreground">items</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <Package className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">{metrics.healthy} items</span> healthy stock
            </p>
          </CardContent>
        </Card>

        {/* Critical & Low Stock */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Critical & Low Stock
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    {metrics.critical + metrics.low}
                  </span>
                  <span className="text-xs text-muted-foreground">require reorder</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <AlertCircle className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              {metrics.critical} critical (&lt;3d) • {metrics.low} low (&lt;10d)
            </p>
          </CardContent>
        </Card>

        {/* Total Stock Asset Value */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Total Inventory Value
                </p>
                <div className="mt-1.5 flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold text-foreground">
                    ₹{metrics.totalValue.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Estimated clinic inventory on premises
            </p>
          </CardContent>
        </Card>

        {/* Daily Clinic Dispense Rate */}
        <Card className="border-border/60 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                  Daily Dispensing Rate
                </p>
                <div className="mt-1.5 flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-foreground">
                    ~{metrics.dailyDispenseTotal}
                  </span>
                  <span className="text-xs text-muted-foreground">units / day</span>
                </div>
              </div>
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted text-muted-foreground">
                <TrendingDown className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-[11px] text-muted-foreground">
              Based on active prescription regimens
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Stock Table Card */}
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="pb-3">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="text-sm font-semibold">Medicine Stock & Replenishment Schedule</CardTitle>
              <CardDescription className="text-xs">
                Showing {filteredMedicines.length} of {medicines.length} registered clinic medications.
              </CardDescription>
            </div>

            {/* Search and Category Filter */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative w-56">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  placeholder="Search drug, generic, batch..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="h-8 pl-8 text-xs"
                />
              </div>

              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="h-8 w-36 text-xs">
                  <Filter className="mr-1.5 h-3 w-3" />
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Retinoids">Retinoids</SelectItem>
                  <SelectItem value="Antibiotics">Antibiotics</SelectItem>
                  <SelectItem value="Antihistamines">Antihistamines</SelectItem>
                  <SelectItem value="Topical Steroids">Topical Steroids</SelectItem>
                  <SelectItem value="Antifungals">Antifungals</SelectItem>
                  <SelectItem value="Cleansers & Sunscreen">Sunscreen & Cleansers</SelectItem>
                  <SelectItem value="Supplements">Supplements</SelectItem>
                  <SelectItem value="Hair Care">Hair Care</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Tabs */}
          <div className="mt-3 flex flex-wrap items-center gap-1.5 border-t border-border/60 pt-3">
            {[
              { id: 'all', label: 'All Medicines', count: medicines.length },
              { id: 'critical', label: 'Critical Shortage (<3d)', count: metrics.critical },
              { id: 'low', label: 'Low Stock (4-10d)', count: metrics.low },
              { id: 'healthy', label: 'Healthy Stock (>10d)', count: metrics.healthy },
              { id: 'expiring', label: 'Expiring Soon', count: medicines.filter((m) => m.isExpiringSoon).length },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors cursor-pointer ${
                  statusFilter === tab.id
                    ? 'bg-foreground text-background shadow-sm'
                    : 'bg-muted/70 text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-y border-border bg-muted/40 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <tr>
                  <th className="px-4 py-3">Medicine & Strength</th>
                  <th className="px-4 py-3">Current Stock</th>
                  <th className="px-4 py-3">Days Remaining</th>
                  <th className="px-4 py-3">Reorder Deadline</th>
                  <th className="px-4 py-3">Batch & Expiry</th>
                  <th className="px-4 py-3">Supplier</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredMedicines.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-xs text-muted-foreground">
                      No medicines found matching the current search & filters.
                    </td>
                  </tr>
                ) : (
                  filteredMedicines.map((med) => (
                    <tr key={med.id} className="transition-colors hover:bg-muted/30">
                      {/* Medicine Info */}
                      <td className="px-4 py-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-foreground text-xs">{med.name}</span>
                            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground font-medium">
                              {med.strength}
                            </span>
                          </div>
                          <p className="text-[11px] text-muted-foreground truncate max-w-xs">{med.genericName}</p>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[10px] text-muted-foreground">
                            <span>{med.category}</span>
                            <span>•</span>
                            <span>{med.form}</span>
                          </div>
                        </div>
                      </td>

                      {/* Stock Level */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="text-sm font-bold text-foreground">{med.currentStock}</span>
                            <span className="text-xs text-muted-foreground">{med.unit}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleQuickAdjust(med.id, -5)}
                              className="h-4.5 w-4.5 rounded bg-muted text-[11px] font-bold hover:bg-muted/80 cursor-pointer flex items-center justify-center text-muted-foreground"
                              title="Decrease 5 units"
                            >
                              -
                            </button>
                            <button
                              onClick={() => handleQuickAdjust(med.id, 5)}
                              className="h-4.5 w-4.5 rounded bg-muted text-[11px] font-bold hover:bg-muted/80 cursor-pointer flex items-center justify-center text-muted-foreground"
                              title="Increase 5 units"
                            >
                              +
                            </button>
                            <span className="text-[10px] text-muted-foreground ml-1">
                              ~{med.dailyConsumption}/day
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Days Remaining */}
                      <td className="px-4 py-3">
                        <div className="w-24 space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-semibold text-foreground text-xs">
                              {med.daysRemaining === 0 ? 'Out of stock' : `${med.daysRemaining} Days Left`}
                            </span>
                          </div>
                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                            <div
                              className="h-full bg-primary"
                              style={{ width: `${Math.min(100, (med.daysRemaining / 30) * 100)}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Reorder Deadline Date */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-xs">
                          <div className="flex items-center gap-1 text-foreground font-medium">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span>{med.reorderDeadline}</span>
                          </div>
                          <div className="text-[11px] text-muted-foreground font-medium">
                            {med.status}
                          </div>
                        </div>
                      </td>

                      {/* Batch & Expiry */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-[11px]">
                          <span className="font-mono text-muted-foreground">{med.batchNumber}</span>
                          <p className="text-muted-foreground">
                            Exp: {med.expiryDate}
                          </p>
                        </div>
                      </td>

                      {/* Supplier */}
                      <td className="px-4 py-3">
                        <div className="space-y-0.5 text-xs">
                          <p className="font-medium text-foreground">{med.supplier}</p>
                          <p className="text-[11px] text-muted-foreground">{med.supplierPhone}</p>
                        </div>
                      </td>

                      {/* Action */}
                      <td className="px-4 py-3 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setSelectedMedicineForRestock(med)}
                          className="h-7 text-xs px-2.5 cursor-pointer gap-1"
                        >
                          <PackagePlus className="h-3 w-3" />
                          Restock
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modals */}
      <RestockModal
        open={!!selectedMedicineForRestock}
        onOpenChange={(open) => !open && setSelectedMedicineForRestock(null)}
        medicine={selectedMedicineForRestock}
        onSave={handleRestockSave}
      />

      <AddMedicineModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        onAdd={handleAddNewMedicine}
      />

      <PurchaseOrderModal
        open={isPOModalOpen}
        onOpenChange={setIsPOModalOpen}
        lowStockItems={lowStockItems}
      />
    </div>
  )
}
