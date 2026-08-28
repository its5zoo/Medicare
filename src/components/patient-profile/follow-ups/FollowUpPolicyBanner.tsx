import { Info } from 'lucide-react'

export function FollowUpPolicyBanner() {
  return (
    <div className="flex gap-3 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3">
      <Info className="h-5 w-5 shrink-0 text-primary" />
      <p className="text-sm leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Clinic policy:</span> Only one active
        follow-up can exist per patient at any time. Scheduling again updates the existing
        active follow-up instead of creating a duplicate.
      </p>
    </div>
  )
}
