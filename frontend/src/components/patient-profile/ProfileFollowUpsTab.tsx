import { CalendarPlus } from 'lucide-react'
import { ActiveFollowUpCard } from '@/components/patient-profile/follow-ups/ActiveFollowUpCard'
import { FollowupHistoryList } from '@/components/patient-profile/FollowupHistoryList'
import { FollowUpPolicyBanner } from '@/components/patient-profile/follow-ups/FollowUpPolicyBanner'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { FollowUpHistoryItem, PatientFollowUpRecord } from '@/data/patientProfileTypes'

interface ProfileFollowUpsTabProps {
  activeFollowUp: PatientFollowUpRecord | null
  followupHistory: FollowUpHistoryItem[]
  onComplete: (fu: PatientFollowUpRecord) => void
  onReschedule: (fu: PatientFollowUpRecord) => void
}

export function ProfileFollowUpsTab({
  activeFollowUp,
  followupHistory,
  onComplete,
  onReschedule,
}: ProfileFollowUpsTabProps) {
  return (
    <div className="space-y-6">
      <FollowUpPolicyBanner />

      {activeFollowUp ? (
        <ActiveFollowUpCard
          followUp={activeFollowUp}
          onComplete={() => onComplete(activeFollowUp)}
          onReschedule={() => onReschedule(activeFollowUp)}
        />
      ) : (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <CalendarPlus className="mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-medium">No active follow-up</p>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Use <strong>Create Follow-Up</strong> in the profile header to schedule one.
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Follow-Up History</CardTitle>
          <p className="text-sm text-muted-foreground">
            Scheduled, rescheduled, completed, and cancelled follow-up activity.
          </p>
        </CardHeader>
        <CardContent>
          <FollowupHistoryList history={followupHistory} />
        </CardContent>
      </Card>
    </div>
  )
}
