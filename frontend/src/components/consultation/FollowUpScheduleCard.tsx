import { Calendar } from 'lucide-react'
import type { FollowUpTimeSlot } from '@/components/consultation/types'
import { FollowUpTimeChipSelect } from '@/components/consultation/FollowUpTimeChipSelect'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface FollowUpScheduleCardProps {
  followUpDate: string
  onFollowUpDateChange: (value: string) => void
  followUpTime: FollowUpTimeSlot
  onFollowUpTimeChange: (value: FollowUpTimeSlot) => void
  followUpDateError?: string
  followUpTimeError?: string
}

export function FollowUpScheduleCard({
  followUpDate,
  onFollowUpDateChange,
  followUpTime,
  onFollowUpTimeChange,
  followUpDateError,
  followUpTimeError,
}: FollowUpScheduleCardProps) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Calendar className="h-5 w-5 text-primary" />
          Follow-Up Schedule
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="follow-up-date">Follow-Up Date</Label>
          <Input
            id="follow-up-date"
            type="date"
            className="mt-1.5"
            value={followUpDate}
            onChange={(e) => onFollowUpDateChange(e.target.value)}
          />
          {followUpDateError && (
            <p className="mt-1 text-xs text-danger">{followUpDateError}</p>
          )}
        </div>
        <div>
          <FollowUpTimeChipSelect value={followUpTime} onChange={onFollowUpTimeChange} />
          {followUpTimeError && (
            <p className="mt-1 text-xs text-danger">{followUpTimeError}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
