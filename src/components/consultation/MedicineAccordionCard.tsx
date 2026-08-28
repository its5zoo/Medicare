import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, ChevronDown, Pill, Trash2 } from 'lucide-react'
import type { ConsultationMedicineDraft, FrequencyOption } from '@/components/consultation/types'
import { FREQUENCY_OPTIONS, formatTimingLabel } from '@/components/consultation/types'
import { TimingChipSelect } from '@/components/consultation/TimingChipSelect'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { formatDate } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface MedicineAccordionCardProps {
  medicine: ConsultationMedicineDraft
  index: number
  expanded: boolean
  onToggle: () => void
  onChange: (medicine: ConsultationMedicineDraft) => void
  onRemove: () => void
  canRemove: boolean
  errors?: Partial<Record<keyof ConsultationMedicineDraft, string>>
}

export function MedicineAccordionCard({
  medicine,
  index,
  expanded,
  onToggle,
  onChange,
  onRemove,
  canRemove,
  errors,
}: MedicineAccordionCardProps) {
  const title = medicine.medicineName.trim() || `Medicine ${index + 1}`
  const isMedicineEmpty = !medicine.medicineName.trim()

  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-card transition-all duration-200',
        expanded
          ? 'border-primary/30 shadow-md ring-1 ring-primary/10'
          : 'border-border shadow-sm hover:border-primary/20'
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5 sm:gap-3 sm:px-4">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
          {index + 1}
        </span>
        <button
          type="button"
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          onClick={onToggle}
        >
          <Pill className="hidden h-4 w-4 shrink-0 text-primary sm:block" />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold">{title}</p>
            {!expanded && (
              <p className="truncate text-xs text-muted-foreground">
                {medicine.dosage && `${medicine.dosage} · `}
                {formatTimingLabel(medicine.timing)} · {medicine.durationDays}d
                {medicine.startDate && ` · from ${formatDate(medicine.startDate)}`}
              </p>
            )}
          </div>
          <ChevronDown
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
              expanded && 'rotate-180'
            )}
          />
        </button>
        {canRemove && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onRemove()
            }}
            className="rounded-lg p-1.5 text-muted-foreground hover:bg-danger/10 hover:text-danger"
            aria-label="Remove medicine"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="grid gap-4 border-t border-border/60 bg-muted/10 p-4 sm:grid-cols-2 sm:p-4">
              <div className="sm:col-span-2">
                <Label htmlFor={`med-name-${medicine.id}`}>Medicine Name</Label>
                <Input
                  id={`med-name-${medicine.id}`}
                  className="mt-1.5 bg-background"
                  placeholder="e.g. Isotretinoin 20mg"
                  value={medicine.medicineName}
                  onChange={(e) => onChange({ ...medicine, medicineName: e.target.value })}
                  required
                />
                {errors?.medicineName && (
                  <p className="mt-1 text-xs text-danger">{errors.medicineName}</p>
                )}
              </div>
              <div>
                <Label htmlFor={`med-dose-${medicine.id}`}>Dosage</Label>
                <Input
                  id={`med-dose-${medicine.id}`}
                  className="mt-1.5 bg-background"
                  placeholder="e.g. 20mg oral"
                  value={medicine.dosage}
                  onChange={(e) => onChange({ ...medicine, dosage: e.target.value })}
                  disabled={isMedicineEmpty}
                />
                {errors?.dosage && (
                  <p className="mt-1 text-xs text-danger">{errors.dosage}</p>
                )}
              </div>
              <div>
                <Label>Frequency</Label>
                <Select
                  value={medicine.frequency}
                  onValueChange={(v) =>
                    onChange({ ...medicine, frequency: v as FrequencyOption })
                  }
                  disabled={isMedicineEmpty}
                >
                  <SelectTrigger className="mt-1.5 bg-background">
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
                {errors?.frequency && (
                  <p className="mt-1 text-xs text-danger">{errors.frequency}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <TimingChipSelect
                  value={medicine.timing}
                  onChange={(timing) => onChange({ ...medicine, timing })}
                  disabled={isMedicineEmpty}
                />
                {errors?.timing && (
                  <p className="mt-1 text-xs text-danger">{errors.timing}</p>
                )}
              </div>
              <div>
                <Label htmlFor={`med-start-${medicine.id}`} className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                  Medicine Start Date
                </Label>
                <Input
                  id={`med-start-${medicine.id}`}
                  type="date"
                  className="mt-1.5 bg-background"
                  value={medicine.startDate}
                  onChange={(e) => onChange({ ...medicine, startDate: e.target.value })}
                  disabled={isMedicineEmpty}
                  required={!isMedicineEmpty}
                />
                <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                  When this medicine should begin for the patient.
                </p>
                {errors?.startDate && (
                  <p className="mt-1 text-xs text-danger">{errors.startDate}</p>
                )}
              </div>
              <div>
                <Label htmlFor={`med-days-${medicine.id}`}>Duration (Days)</Label>
                <Input
                  id={`med-days-${medicine.id}`}
                  type="number"
                  min={1}
                  className="mt-1.5 bg-background"
                  value={medicine.durationDays === 0 ? '' : medicine.durationDays}
                  onChange={(e) =>
                    onChange({
                      ...medicine,
                      durationDays: Math.max(0, Number(e.target.value) || 0),
                    })
                  }
                  disabled={isMedicineEmpty}
                  required={!isMedicineEmpty}
                />
                {errors?.durationDays && (
                  <p className="mt-1 text-xs text-danger">{errors.durationDays}</p>
                )}
              </div>
              <div className="sm:col-span-2">
                <div className={cn(
                  'flex items-center justify-between rounded-xl border border-border/60 bg-background px-4 py-3 transition-opacity',
                  isMedicineEmpty && 'opacity-50 pointer-events-none'
                )}>
                  <div>
                    <Label htmlFor={`med-reminder-${medicine.id}`}>Reminder</Label>
                    <p className="text-[11px] text-muted-foreground">
                      Send WhatsApp reminders for this medicine
                    </p>
                  </div>
                  <Switch
                    id={`med-reminder-${medicine.id}`}
                    checked={medicine.reminder}
                    onCheckedChange={(checked) =>
                      onChange({ ...medicine, reminder: checked })
                    }
                    disabled={isMedicineEmpty}
                  />
                </div>
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor={`med-inst-${medicine.id}`}>Instructions</Label>
                <Textarea
                  id={`med-inst-${medicine.id}`}
                  className="mt-1.5 min-h-[72px] bg-background"
                  placeholder="Special instructions..."
                  value={medicine.instructions}
                  onChange={(e) => onChange({ ...medicine, instructions: e.target.value })}
                  disabled={isMedicineEmpty}
                />
                {errors?.instructions && (
                  <p className="mt-1 text-xs text-danger">{errors.instructions}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
