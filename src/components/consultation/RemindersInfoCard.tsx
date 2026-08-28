import { Bell } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function RemindersInfoCard() {
  return (
    <Card className="border-primary/15 bg-gradient-to-br from-primary/[0.04] to-accent/[0.06]">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Bell className="h-5 w-5 text-primary" />
          Automated Reminder Information
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <p className="text-sm leading-relaxed text-muted-foreground">
          Medicine reminders are automatically managed by the system based on each medicine&apos;s
          timing, start date, and duration. No manual configuration is required during consultation.
        </p>
      </CardContent>
    </Card>
  )
}
