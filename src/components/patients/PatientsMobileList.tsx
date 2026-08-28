import { ChevronRight } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { WorkspacePatientStatusBadge } from '@/components/patients/PatientStatusBadge'
import { Card, CardContent } from '@/components/ui/card'
import type { PatientRecord } from '@/api/types'
import { formatDate } from '@/lib/utils'

export function PatientsMobileList({ rows }: { rows: PatientRecord[] }) {
  const navigate = useNavigate()

  const displayValue = (val: string | null | undefined) => {
    if (!val || val.trim() === '') return '-'
    return val
  }

  return (
    <div className="space-y-3 md:hidden">
      {rows.map((row) => (
        <Card
          key={row.patientId}
          className="cursor-pointer border-border/80 shadow-sm transition-shadow active:scale-[0.99]"
          onClick={() => navigate(`/patients/${row.patientId}`)}
        >
          <CardContent className="p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold">{row.patientName}</p>
                <p className="font-mono text-xs text-primary">{row.patientId}</p>
              </div>
              <WorkspacePatientStatusBadge status={row.status} />
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-muted-foreground">
              <span>
                {row.activeMedicineCount > 0
                  ? `${row.activeMedicineCount} ${row.activeMedicineCount === 1 ? 'active medicine' : 'active medicines'}`
                  : 'No active medicines'}
              </span>
              <span>{displayValue(row.assignedDoctor)}</span>
              <span className="col-span-2">
                Follow-up:{' '}
                {row.nextFollowupDate ? (
                  <>
                    {formatDate(row.nextFollowupDate)} {row.nextFollowupTime ? `· ${row.nextFollowupTime}` : ''}
                  </>
                ) : (
                  '-'
                )}
              </span>
            </div>
            <div className="mt-3 flex items-center justify-end text-xs font-medium text-primary">
              Open Profile
              <ChevronRight className="h-3.5 w-3.5" />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
