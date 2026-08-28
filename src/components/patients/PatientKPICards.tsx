import { AlertTriangle, CalendarCheck, Users } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { PatientSummary } from '@/api/types'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface PatientKPICardsProps {
  summary?: PatientSummary
}

export function PatientKPICards({ summary }: PatientKPICardsProps) {
  const navigate = useNavigate()

  if (!summary) return null

  const cards = [
    {
      label: 'Total Patients',
      value: summary.totalPatients,
      icon: Users,
      iconClass: 'text-slate-600 dark:text-slate-300',
      bg: 'bg-slate-100 dark:bg-slate-800',
      onClick: () => navigate('/patients'),
    },
    {
      label: 'Active Patients',
      value: summary.activePatients,
      icon: Users,
      iconClass: 'text-emerald-700 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950',
      onClick: () => navigate('/patients/active'),
    },
    {
      label: 'Patients With Active Follow-Up',
      value: summary.patientsWithActiveFollowup,
      icon: CalendarCheck,
      iconClass: 'text-indigo-700 dark:text-indigo-400',
      bg: 'bg-indigo-50 dark:bg-indigo-950',
      onClick: () => navigate('/patients/active?followup=scheduled'),
    },
    {
      label: 'Patients Requiring Attention',
      value: summary.patientsRequiringAttention,
      icon: AlertTriangle,
      iconClass: 'text-amber-700 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950',
      onClick: () => navigate('/patients?status=Registered'),
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Card 
            key={card.label} 
            className="border-border/80 shadow-sm cursor-pointer transition-shadow hover:shadow-md"
            onClick={card.onClick}
          >
            <CardContent className="flex items-start justify-between gap-3 p-5">
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight tabular-nums">
                  {card.value}
                </p>
              </div>
              <div
                className={cn(
                  'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
                  card.bg
                )}
              >
                <Icon className={cn('h-5 w-5', card.iconClass)} />
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
