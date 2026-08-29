import type { TimingOption } from '@/components/consultation/types'
import { TIMING_OPTIONS } from '@/components/consultation/types'
import { cn } from '@/lib/utils'

interface TimingChipSelectProps {
  value: TimingOption[]
  onChange: (value: TimingOption[]) => void
  label?: string
  disabled?: boolean
}

export function TimingChipSelect({
  value,
  onChange,
  label = 'Timing',
  disabled = false,
}: TimingChipSelectProps) {
  const toggle = (option: TimingOption) => {
    if (disabled) return
    onChange(
      value.includes(option)
        ? value.filter((t) => t !== option)
        : [...value, option]
    )
  }

  return (
    <div className={cn(disabled && 'opacity-50 pointer-events-none')}>
      <p className="text-sm font-medium leading-none">{label}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {TIMING_OPTIONS.map((option) => {
          const selected = value.includes(option)
          return (
            <button
              key={option}
              type="button"
              onClick={() => toggle(option)}
              disabled={disabled}
              className={cn(
                'rounded-xl border px-3.5 py-2 text-xs font-medium transition-all duration-200',
                selected
                  ? 'border-primary bg-primary/10 text-primary shadow-sm'
                  : 'border-border bg-background text-muted-foreground hover:border-primary/30 hover:bg-muted/50'
              )}
            >
              {option}
            </button>
          )
        })}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">Select one or more times per day</p>
    </div>
  )
}
