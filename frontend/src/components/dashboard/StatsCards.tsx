import {
  BedDouble,
  CheckCircle2,
  ClipboardList,
  Pill,
  Stethoscope,
  Users,
} from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { KpiCard } from '@/components/dashboard/KpiCard'
import { kpiSparklines } from '@/data/mockData'
import type { DashboardCards } from '@/api/types'
import { humanizeNumber } from '@/lib/humanizer'
import { initialBeds } from '@/data/bedManagementData'

interface StatsCardsProps {
  cards: DashboardCards
}

export function StatsCards({ cards }: StatsCardsProps) {
  const navigate = useNavigate()

  const occupiedBeds = initialBeds.filter((b) => b.status === 'Occupied').length
  const availableBeds = initialBeds.filter((b) => b.status === 'Available').length

  const kpis = [
    {
      label: 'Total Patients',
      value: humanizeNumber(cards.totalPatients),
      trend: 12,
      sparkline: kpiSparklines.totalPatients,
      icon: <Users className="h-5 w-5 text-blue-600" />,
      iconBg: 'bg-blue-50 dark:bg-blue-950',
      onClick: () => navigate('/patients'),
    },
    {
      label: 'Consultation Pending',
      value: humanizeNumber(cards.consultationPending),
      trend: -5,
      sparkline: kpiSparklines.consultationPending,
      icon: <ClipboardList className="h-5 w-5 text-amber-600" />,
      iconBg: 'bg-amber-50 dark:bg-amber-950',
      onClick: () => navigate('/patients?status=Registered'),
    },
    {
      label: 'Active Patients',
      value: humanizeNumber(cards.activePatients),
      trend: 8,
      sparkline: kpiSparklines.activePatients,
      icon: <Stethoscope className="h-5 w-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950',
      onClick: () => navigate('/patients/active'),
    },
    {
      label: 'Occupied Beds',
      value: String(occupiedBeds),
      trend: 14,
      sparkline: kpiSparklines.todaysFollowUps,
      icon: <BedDouble className="h-5 w-5 text-indigo-600" />,
      iconBg: 'bg-indigo-50 dark:bg-indigo-950',
      onClick: () => navigate('/beds/occupied'),
    },
    {
      label: 'Available Beds',
      value: String(availableBeds),
      trend: 5,
      sparkline: kpiSparklines.missedFollowUps,
      icon: <CheckCircle2 className="h-5 w-5 text-emerald-600" />,
      iconBg: 'bg-emerald-50 dark:bg-emerald-950',
      onClick: () => navigate('/beds/available'),
    },
    {
      label: 'Active Prescriptions',
      value: humanizeNumber(cards.activePrescriptions),
      trend: 6,
      sparkline: kpiSparklines.activePrescriptions,
      icon: <Pill className="h-5 w-5 text-sky-600" />,
      iconBg: 'bg-sky-50 dark:bg-sky-950',
      onClick: () => navigate('/prescriptions'),
    },
  ]

  return (
    <div className="grid gap-3 grid-cols-2 sm:grid-cols-2 md:gap-4 xl:grid-cols-3 2xl:grid-cols-6 mb-8">
      {kpis.map((kpi, i) => (
        <KpiCard key={kpi.label} {...kpi} delay={i * 0.05} />
      ))}
    </div>
  )
}
