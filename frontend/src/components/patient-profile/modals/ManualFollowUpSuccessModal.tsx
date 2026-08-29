import { useEffect } from 'react'
import { TransactionResultCard } from '@/components/shared/TransactionResultCard'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import type { TransactionSuccessState } from '@/hooks/useWorkflowTransaction'

interface ManualFollowUpSuccessModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  successData: TransactionSuccessState | null
  onDone: () => void
}

export function ManualFollowUpSuccessModal({
  open,
  onOpenChange,
  successData,
  onDone,
}: ManualFollowUpSuccessModalProps) {
  useEffect(() => {
    if (open) {
      const timer = setTimeout(() => {
        onDone()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [open, onDone])

  // Prevent closing by clicking outside during success display if desired, 
  // but standard onOpenChange is fine.
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border-none bg-transparent p-0 shadow-none sm:rounded-3xl [&>button]:hidden">
        {successData && (
          <TransactionResultCard
            className="bg-card p-6 pb-8 pt-8 rounded-3xl shadow-xl border border-border mx-0 w-full"
            variant="success"
            title={successData.title}
            lines={successData.lines}
            primaryAction={{
              label: 'Done',
              onClick: onDone,
            }}
          />
        )}
      </DialogContent>
    </Dialog>
  )
}
