import type { FollowUpStatus } from '@/data/types'
import type { TodayFollowupItem } from '@/api/types'
import { FollowUpStatusBadge } from '@/components/shared/StatusBadge'
import { Badge } from '@/components/ui/badge'
// import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatTime } from '@/lib/utils'

const FOLLOW_UP_STATUSES: FollowUpStatus[] = [
  'Scheduled',
  'Completed',
  'Missed',
  'Rescheduled',
  'Cancelled',
  'Superseded',
]

function formatFollowupTime(time: string): string {
  if (time.includes(':')) return formatTime(time)
  return time
}

function FollowupStatusBadge({ status }: { status: string }) {
  if (FOLLOW_UP_STATUSES.includes(status as FollowUpStatus)) {
    return <FollowUpStatusBadge status={status as FollowUpStatus} />
  }
  return <Badge variant="secondary">{status}</Badge>
}

interface TodayFollowupsProps {
  followups: TodayFollowupItem[]
  onComplete?: (fu: TodayFollowupItem) => void
  onReschedule?: (fu: TodayFollowupItem) => void
}

export function TodayFollowups({ followups, onComplete, onReschedule }: TodayFollowupsProps) {
  return (
    <Card>
      <CardHeader className="p-4 pb-3 md:p-6 md:pb-4">
        <CardTitle className="text-base md:text-lg">Today's Follow-Ups</CardTitle>
      </CardHeader>
      <CardContent className="p-4 pt-0 md:p-6 md:pt-0">
        <div className="overflow-x-auto hidden md:block">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-muted-foreground">
                <th className="px-2 pb-2 text-[11px] font-medium md:px-4 md:pb-4 md:text-xs">Patient</th>
                <th className="px-2 pb-2 text-[11px] font-medium md:px-4 md:pb-4 md:text-xs">Doctor</th>
                <th className="px-2 pb-2 text-[11px] font-medium md:px-4 md:pb-4 md:text-xs">Time</th>
                <th className="px-2 pb-2 text-[11px] font-medium md:px-4 md:pb-4 md:text-xs">Status</th>
                <th className="px-2 pb-2 text-[11px] font-medium md:px-4 md:pb-4 md:text-xs">Action</th>
              </tr>
            </thead>
            <tbody>
              {followups.map((fu) => (
                <tr
                  key={fu.followupId ?? `${fu.patientName}-${fu.time}`}
                  className="border-b border-border/50 last:border-0"
                >
                  <td className="px-2 py-2 align-middle md:px-4 md:py-4">
                    <p className="text-sm font-medium leading-none truncate">{fu.patientName}</p>
                    {fu.patientId && (
                      <p className="mt-0.5 text-[10px] text-muted-foreground md:mt-1.5 md:text-xs">{fu.patientId}</p>
                    )}
                  </td>
                  <td className="px-2 py-2 align-middle text-muted-foreground md:px-4 md:py-4">{fu.doctor}</td>
                  <td className="px-2 py-2 align-middle whitespace-nowrap md:px-4 md:py-4">{formatFollowupTime(fu.time)}</td>
                  <td className="px-2 py-2 align-middle md:px-4 md:py-4">
                    <FollowupStatusBadge status={fu.status} />
                  </td>
                  <td className="px-2 py-2 align-middle md:px-4 md:py-4">
                    {/* Mobile: stacked vertically | Desktop: side-by-side */}
                    <div className="flex flex-col gap-1.5 md:flex-row md:flex-nowrap md:items-center md:gap-2">
                      <button 
                        type="button"
                        className="inline-flex items-center justify-center whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-7 px-2 text-xs rounded-full border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition shadow-sm md:h-8 md:px-3 md:text-sm"
                        onClick={() => onComplete?.(fu)}
                        disabled={fu.status === 'Completed'}
                      >
                        ✓ Complete
                      </button>
                      <button 
                        type="button"
                        className="inline-flex items-center justify-center whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-7 px-2 text-xs rounded-full border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition shadow-sm md:h-8 md:px-3 md:text-sm"
                        onClick={() => onReschedule?.(fu)}
                        disabled={fu.status === 'Completed'}
                      >
                        ↻ Reschedule
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile View */}
        <div className="md:hidden max-h-[420px] overflow-y-auto hide-scrollbar space-y-3 pr-1 pb-2">
          {followups.map((fu) => (
            <div
              key={fu.followupId ?? `${fu.patientName}-${fu.time}`}
              className="flex flex-col gap-3 rounded-xl border border-border/50 bg-background/50 p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate text-sm font-bold leading-none text-foreground">
                    {fu.patientName}
                  </p>
                  {fu.patientId && (
                    <p className="font-mono text-xs text-primary">
                      {fu.patientId}
                    </p>
                  )}
                  <p className="truncate text-xs text-muted-foreground pt-1">
                    {fu.doctor}
                  </p>
                </div>
                <div className="shrink-0 text-right space-y-1.5">
                  <p className="text-xs font-medium text-foreground whitespace-nowrap">
                    {formatFollowupTime(fu.time)}
                  </p>
                  <FollowupStatusBadge status={fu.status} />
                </div>
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 text-xs rounded-lg border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 transition shadow-sm"
                  onClick={() => onReschedule?.(fu)}
                  disabled={fu.status === 'Completed'}
                >
                  ↻ Reschedule
                </button>
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center whitespace-nowrap font-medium focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-9 text-xs rounded-lg border border-green-200 bg-green-50 text-green-700 hover:bg-green-100 transition shadow-sm"
                  onClick={() => onComplete?.(fu)}
                  disabled={fu.status === 'Completed'}
                >
                  ✓ Complete
                </button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

