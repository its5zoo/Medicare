import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

interface PatientSearchProps {
  value: string
  onChange: (value: string) => void
}

export function PatientSearch({ value, onChange }: PatientSearchProps) {
  return (
    <div className="relative">
      <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        id="patients-search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search by Patient ID, Name, or Phone Number"
        className={cn(
          'h-12 rounded-xl border-border bg-background pl-11 text-base shadow-sm transition-shadow',
          'focus-visible:ring-2 focus-visible:ring-primary/20'
        )}
        autoComplete="off"
      />
    </div>
  )
}
