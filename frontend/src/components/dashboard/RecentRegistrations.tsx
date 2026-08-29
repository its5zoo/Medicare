import { useNavigate } from 'react-router-dom'
import type { PatientStatus } from '@/data/types'
import type { RecentRegistration } from '@/api/types'
import { PatientStatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatDateCompact } from '@/lib/utils'

const PATIENT_STATUSES: PatientStatus[] = [
  'Registered',
  'Consultation Pending',
  'Active Treatment',
  'Follow-Up Due',
  'Completed',
]

function mapPatientStatus(status: string): PatientStatus | null {
  if (status === 'Active') return 'Active Treatment'
  if (PATIENT_STATUSES.includes(status as PatientStatus)) return status as PatientStatus
  return null
}

function RegistrationStatusBadge({ status }: { status: string }) {
  const mapped = mapPatientStatus(status)
  if (mapped) return <PatientStatusBadge status={mapped} />
  return <Badge variant="secondary">{status}</Badge>
}

interface RecentRegistrationsProps {
  registrations: RecentRegistration[]
}

export function RecentRegistrations({ registrations }: RecentRegistrationsProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between p-4 pb-3 md:p-6 md:pb-4">
        <CardTitle className="text-base md:text-lg">Recent Registrations</CardTitle>
        <Button variant="ghost" size="sm" className="text-xs h-7 px-2 md:text-sm md:h-8 md:px-3" onClick={() => navigate('/patients')}>
          View all
        </Button>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full table-fixed text-sm">
            <colgroup>
              <col className="w-[15%]" />
              <col className="w-[20%]" />
              <col className="w-[22%] hidden lg:table-column" />
              <col className="w-[15%]" />
              <col className="w-[15%]" />
              <col className="w-[13%]" />
            </colgroup>
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-2 pb-2 text-[11px] font-medium md:px-3 md:pb-3 md:text-xs">Patient ID</th>
                <th className="px-2 pb-2 text-[11px] font-medium md:px-3 md:pb-3 md:text-xs">Name</th>
                <th className="px-2 pb-2 text-[11px] font-medium hidden lg:table-cell md:px-3 md:pb-3 md:text-xs">Doctor</th>
                <th className="px-2 pb-2 text-[11px] font-medium md:px-3 md:pb-3 md:text-xs">Date</th>
                <th className="px-2 pb-2 text-[11px] font-medium text-center md:px-3 md:pb-3 md:text-xs">Status</th>
                <th className="px-2 pb-2 text-[11px] font-medium text-right md:px-3 md:pb-3 md:text-xs">Action</th>
              </tr>
            </thead>
            <tbody>
              {registrations.map((patient) => (
                <tr key={patient.patientId} className="border-b border-border/50 last:border-0">
                  <td className="px-2 py-2 font-mono text-[10px] text-primary whitespace-nowrap md:px-3 md:py-3 md:text-xs">{patient.patientId}</td>
                  <td className="px-2 py-2 text-sm font-medium truncate md:px-3 md:py-3">{patient.name}</td>
                  <td className="px-2 py-2 hidden lg:table-cell text-muted-foreground whitespace-nowrap md:px-3 md:py-3">{patient.doctor}</td>
                  <td className="px-2 py-2 text-muted-foreground whitespace-nowrap md:px-3 md:py-3">
                    <span className="md:hidden">{formatDateCompact(patient.date)}</span>
                    <span className="hidden md:inline">{formatDate(patient.date)}</span>
                  </td>
                  <td className="px-2 py-2 text-center md:px-3 md:py-3">
                    <RegistrationStatusBadge status={patient.status} />
                  </td>
                  <td className="px-2 py-2 text-right md:px-3 md:py-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="group transition-all hover:border-primary hover:bg-primary/5 h-7 text-xs px-3 md:h-8 md:text-sm md:px-3"
                      onClick={() => navigate(`/patients/${patient.patientId}`)}
                    >
                      Profile <span className="ml-1 transition-transform group-hover:translate-x-0.5">→</span>
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden max-h-[420px] overflow-y-auto hide-scrollbar space-y-3 pr-1 pb-2">
          {registrations.map((patient) => (
            <div
              key={patient.patientId}
              className="flex items-center justify-between gap-3 rounded-xl border border-border/50 bg-background/50 p-3 shadow-sm"
            >
              <div className="min-w-0 flex-1 space-y-1.5">
                <p className="truncate text-sm font-bold leading-none text-foreground">
                  {patient.name}
                </p>
                <p className="font-mono text-xs text-primary">
                  {patient.patientId}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateCompact(patient.date)}
                  </span>
                  <RegistrationStatusBadge status={patient.status} />
                </div>
              </div>
              <div className="shrink-0">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs font-medium border-primary/20 text-primary hover:bg-primary/5 hover:text-primary"
                  onClick={() => navigate(`/patients/${patient.patientId}`)}
                >
                  Profile
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
