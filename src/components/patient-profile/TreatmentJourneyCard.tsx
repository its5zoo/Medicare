import { Check, Circle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { TreatmentJourneyStep } from '@/data/patientProfileTypes'
import { cn } from '@/lib/utils'

interface TreatmentJourneyCardProps {
  steps: TreatmentJourneyStep[]
}

export function TreatmentJourneyCard({ steps }: TreatmentJourneyCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base font-semibold">Treatment Journey</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          {steps.map((step, index) => (
            <div key={step.key} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border',
                  step.completed
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-600 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-400'
                    : 'border-border bg-muted/40 text-muted-foreground'
                )}
              >
                {step.completed ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Circle className="h-3 w-3" />
                )}
              </div>
              <span
                className={cn(
                  'text-sm',
                  step.completed ? 'font-medium text-foreground' : 'text-muted-foreground'
                )}
              >
                {step.label}
              </span>
              {index < steps.length - 1 && (
                <span className="mx-1 hidden text-muted-foreground sm:inline">→</span>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
