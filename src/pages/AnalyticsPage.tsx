import { BarChart3, TrendingUp, Users } from 'lucide-react'
import { PageHeader } from '@/components/shared/PageHeader'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getDashboardStats } from '@/data/mockData'
import { Sparkline } from '@/components/dashboard/KpiCard'
import { kpiSparklines } from '@/data/mockData'

export function AnalyticsPage() {
  const stats = getDashboardStats()

  const metrics = [
    { label: 'Patient Growth', value: '+12%', data: kpiSparklines.totalPatients },
    { label: 'Consultation Rate', value: '87%', data: kpiSparklines.consultationPending },
    { label: 'Follow-Up Compliance', value: '92%', data: kpiSparklines.todaysFollowUps },
    { label: 'Prescription Adherence', value: '78%', data: kpiSparklines.activePrescriptions },
  ]

  return (
    <div>
      <PageHeader
        title="Analytics"
        description="Clinic performance metrics and insights."
      />

      <div className="grid gap-4 grid-cols-2 md:grid-cols-2 lg:grid-cols-4 mb-8">
        {[
          { icon: Users, label: 'Total Patients', value: stats.totalPatients },
          { icon: TrendingUp, label: 'Active Treatments', value: stats.activePatients },
          { icon: BarChart3, label: 'Active Rx', value: stats.activePrescriptions },
          { icon: TrendingUp, label: 'Follow-Ups Today', value: stats.todaysFollowUps },
        ].map((item) => {
          const Icon = item.icon
          return (
            <Card key={item.label}>
              <CardContent className="p-5">
                <Icon className="h-5 w-5 text-primary mb-3" />
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="text-2xl font-bold mt-1">{item.value}</p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {metrics.map((m) => (
          <Card key={m.label}>
            <CardHeader>
              <CardTitle className="text-base">{m.label}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end justify-between">
                <span className="text-3xl font-bold text-primary">{m.value}</span>
                <Sparkline data={m.data} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
