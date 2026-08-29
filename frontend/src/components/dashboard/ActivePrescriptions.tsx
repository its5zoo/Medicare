import type { PrescriptionStatus } from '@/data/types'
import type { ActivePrescriptionItem } from '@/api/types'
import { PrescriptionStatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { humanizeDaysRemaining } from '@/lib/humanizer'

const PRESCRIPTION_STATUSES: PrescriptionStatus[] = ['Active', 'Completed', 'Discontinued']

function PrescriptionStatus({ status }: { status: string }) {
  if (PRESCRIPTION_STATUSES.includes(status as PrescriptionStatus)) {
    return <PrescriptionStatusBadge status={status as PrescriptionStatus} />
  }
  return <Badge variant="secondary">{status}</Badge>
}

interface ActivePrescriptionsProps {
  prescriptions: ActivePrescriptionItem[]
}

export function ActivePrescriptions({ prescriptions }: ActivePrescriptionsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Active Prescriptions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="pb-3 font-medium">Patient</th>
                <th className="pb-3 font-medium">Medicine</th>
                <th className="pb-3 font-medium">Dosage</th>
                <th className="pb-3 font-medium">Frequency</th>
                <th className="pb-3 font-medium">Days Remaining</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {prescriptions.map((rx) => (
                <tr
                  key={rx.prescriptionId ?? `${rx.patientName}-${rx.medicine}`}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="py-3 font-medium">{rx.patientName}</td>
                  <td className="py-3 text-muted-foreground">{rx.medicine}</td>
                  <td className="py-3 text-muted-foreground">{rx.dosage}</td>
                  <td className="py-3 text-muted-foreground">{rx.frequency}</td>
                  <td className="py-3">
                    <span className="rounded-lg bg-sky-50 px-2 py-0.5 text-xs font-medium text-sky-700 dark:bg-sky-950 dark:text-sky-400">
                      {humanizeDaysRemaining(rx.daysRemaining)}
                    </span>
                  </td>
                  <td className="py-3">
                    <PrescriptionStatus status={rx.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
