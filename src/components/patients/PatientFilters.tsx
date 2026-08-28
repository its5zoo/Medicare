import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export interface PatientFiltersState {
  doctor: string
  status: string
  medicine: string
  followup: string
  time: string
}

export const defaultPatientFilters: PatientFiltersState = {
  doctor: 'All Doctors',
  status: 'All Statuses',
  medicine: 'Any Medicines',
  followup: 'Any Follow-Up',
  time: 'All Time',
}

interface PatientFiltersProps {
  filters: PatientFiltersState
  onChange: (filters: PatientFiltersState) => void
  onClear: () => void
  hasActiveFilters: boolean
}

export function PatientFilters({
  filters,
  onChange,
  onClear,
  hasActiveFilters,
}: PatientFiltersProps) {
  const set = <K extends keyof PatientFiltersState>(key: K, value: PatientFiltersState[K]) =>
    onChange({ ...filters, [key]: value })

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Select value={filters.doctor} onValueChange={(v) => set('doctor', v)}>
          <SelectTrigger className="h-9 w-[160px] rounded-lg bg-background text-xs">
            <SelectValue placeholder="Doctor" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Doctors">All Doctors</SelectItem>
            <SelectItem value="Rizwana Barkat">Rizwana Barkat</SelectItem>
            <SelectItem value="Muzammil Barkat">Muzammil Barkat</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.status} onValueChange={(v) => set('status', v)}>
          <SelectTrigger className="h-9 w-[160px] rounded-lg bg-background text-xs">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Statuses">All Statuses</SelectItem>
            <SelectItem value="Registered">Registered</SelectItem>
            <SelectItem value="Active">Active</SelectItem>
            <SelectItem value="Completed">Completed</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.medicine} onValueChange={(v) => set('medicine', v)}>
          <SelectTrigger className="h-9 w-[170px] rounded-lg bg-background text-xs">
            <SelectValue placeholder="Medicines" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Any Medicines">Any Medicines</SelectItem>
            <SelectItem value="Has Active Medicines">Has Active Medicines</SelectItem>
            <SelectItem value="No Active Medicines">No Active Medicines</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.followup} onValueChange={(v) => set('followup', v)}>
          <SelectTrigger className="h-9 w-[170px] rounded-lg bg-background text-xs">
            <SelectValue placeholder="Follow-Up" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Any Follow-Up">Any Follow-Up</SelectItem>
            <SelectItem value="Has Active Follow-Up">Has Active Follow-Up</SelectItem>
            <SelectItem value="No Active Follow-Up">No Active Follow-Up</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.time} onValueChange={(v) => set('time', v)}>
          <SelectTrigger className="h-9 w-[160px] rounded-lg bg-background text-xs">
            <SelectValue placeholder="Registered" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="All Time">All Time</SelectItem>
            <SelectItem value="Last 7 Days">Last 7 Days</SelectItem>
            <SelectItem value="Last 30 Days">Last 30 Days</SelectItem>
            <SelectItem value="Last 90 Days">Last 90 Days</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" className="h-9 gap-1 text-xs" onClick={onClear}>
            <X className="h-3.5 w-3.5" />
            Clear Filters
          </Button>
        )}
      </div>
    </div>
  )
}
