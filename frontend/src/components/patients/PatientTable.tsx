import { PatientRow } from '@/components/patients/PatientRow'
import { Card, CardContent } from '@/components/ui/card'
import type { PatientRecord } from '@/api/types'

interface PatientTableProps {
  rows: PatientRecord[]
}

export function PatientTable({ rows }: PatientTableProps) {
  return (
    <Card className="hidden overflow-hidden border-border/80 shadow-sm md:block">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[960px] text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-left text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Patient ID</th>
                <th className="px-4 py-3">Patient Name</th>
                <th className="hidden px-4 py-3 md:table-cell">Phone</th>
                <th className="hidden px-4 py-3 lg:table-cell">Assigned Doctor</th>
                <th className="px-4 py-3">Active Medicines</th>
                <th className="hidden px-4 py-3 sm:table-cell">Next Follow-Up</th>
                <th className="px-4 py-3">Current Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <PatientRow key={row.patientId} row={row} />
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
