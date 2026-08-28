import { useNavigate } from 'react-router-dom'
import type { ConsultationPendingItem } from '@/api/types'
import { Stethoscope } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate, formatDateCompact } from '@/lib/utils'

interface ConsultationPendingProps {
  patients: ConsultationPendingItem[]
}

export function ConsultationPending({ patients }: ConsultationPendingProps) {
  const navigate = useNavigate()

  return (
    <Card>
      <CardHeader className="p-4 pb-3 md:p-6 md:pb-4">
        <CardTitle className="text-base md:text-lg">Consultation Pending</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-2 pb-2 text-[11px] font-medium md:px-0 md:pb-3 md:text-xs">Patient</th>
                <th className="px-2 pb-2 text-[11px] font-medium md:px-0 md:pb-3 md:text-xs">Doctor</th>
                <th className="px-2 pb-2 text-[11px] font-medium md:px-0 md:pb-3 md:text-xs">Reg. Date</th>
                <th className="px-2 pb-2 text-[11px] font-medium md:px-0 md:pb-3 md:text-xs">Waiting</th>
                <th className="px-2 pb-2 text-[11px] font-medium md:px-0 md:pb-3 md:text-xs">Action</th>
              </tr>
            </thead>
            <tbody>
              {patients.map((patient) => (
                <tr key={patient.patientId} className="border-b border-border/50 last:border-0">
                  <td className="px-2 py-2 md:px-0 md:py-3">
                    <p className="text-sm font-medium truncate md:text-sm">{patient.name}</p>
                    <p className="text-[10px] text-muted-foreground md:text-xs">{patient.patientId}</p>
                  </td>
                  <td className="px-2 py-2 text-muted-foreground truncate md:px-0 md:py-3">{patient.doctor}</td>
                  <td className="px-2 py-2 text-muted-foreground whitespace-nowrap md:px-0 md:py-3">
                    <span className="md:hidden">{formatDateCompact(patient.registrationDate)}</span>
                    <span className="hidden md:inline">{formatDate(patient.registrationDate)}</span>
                  </td>
                  <td className="px-2 py-2 md:px-0 md:py-3">
                    <span className="rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400 md:text-xs">
                      {patient.daysWaiting}d
                    </span>
                  </td>
                  <td className="px-2 py-2 md:px-0 md:py-3">
                    <Button 
                      variant="gradient" 
                      size="sm" 
                      className="shadow-sm h-7 text-xs px-3 md:h-8 md:text-sm md:px-3"
                      onClick={() => navigate(`/consultation/${patient.patientId}`)}
                    >
                      Start
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden max-h-[420px] overflow-y-auto hide-scrollbar space-y-3 pr-1 pb-2">
          {patients.map((patient) => (
            <div
              key={patient.patientId}
              className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background/50 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-bold leading-none text-foreground">
                    {patient.name}
                  </p>
                  <p className="font-mono text-xs text-primary">
                    {patient.patientId}
                  </p>
                  <p className="truncate text-xs text-muted-foreground pt-1">
                    {patient.doctor}
                  </p>
                </div>
                <div className="shrink-0 text-right space-y-1.5">
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {formatDateCompact(patient.registrationDate)}
                  </p>
                  <span className="inline-block rounded-lg bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700 dark:bg-amber-950 dark:text-amber-400">
                    Waiting: {patient.daysWaiting} Days
                  </span>
                </div>
              </div>
              
              <Button
                variant="gradient"
                className="w-full h-[42px] rounded-full text-sm font-medium shadow-md hover:shadow-lg hover:brightness-105 active:scale-[0.98] transition-all duration-200 flex items-center justify-center gap-2"
                onClick={() => navigate(`/consultation/${patient.patientId}`)}
              >
                <Stethoscope className="h-4 w-4" />
                Start Consultation
              </Button>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
