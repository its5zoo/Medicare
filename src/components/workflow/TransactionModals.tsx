import { Dialog, DialogContent } from '@/components/ui/dialog'
import { TransactionResultCard } from '@/components/shared/TransactionResultCard'
import { WorkflowModal } from '@/components/workflow/WorkflowModal'
import { ManualFollowUpSuccessModal } from '@/components/patient-profile/modals/ManualFollowUpSuccessModal'
import type { useWorkflowTransaction } from '@/hooks/useWorkflowTransaction'

interface TransactionModalsProps {
  transaction: ReturnType<typeof useWorkflowTransaction>
  steps: string[]
  loadingTitle: string
}

export function TransactionModals({ transaction, steps, loadingTitle }: TransactionModalsProps) {
  const { isRunning, success, error, timeoutNotice, clearStates } = transaction

  return (
    <>
      <WorkflowModal
        open={isRunning}
        steps={steps}
        title={loadingTitle}
      />

      <ManualFollowUpSuccessModal
        open={!!success}
        onOpenChange={(open) => {
          if (!open) clearStates()
        }}
        successData={success}
        onDone={clearStates}
      />

      <Dialog open={timeoutNotice} onOpenChange={() => {}}>
        <DialogContent className="sm:max-w-md border-none bg-transparent p-0 shadow-none sm:rounded-3xl [&>button]:hidden">
          <TransactionResultCard
            className="bg-card p-6 rounded-3xl shadow-xl border border-border mx-0 w-full"
            variant="timeout"
            title="Processing Delayed"
            message="Your request is still being processed. Please refresh after a few moments."
            primaryAction={{ label: 'Close', onClick: clearStates }}
          />
        </DialogContent>
      </Dialog>

      <Dialog 
        open={!!error && !error.isTimeout && error.title !== 'Validation Error' && error.title !== 'Connection Error'} 
        onOpenChange={() => {}}
      >
        <DialogContent className="sm:max-w-md border-none bg-transparent p-0 shadow-none sm:rounded-3xl [&>button]:hidden">
          <TransactionResultCard
            className="bg-card p-6 rounded-3xl shadow-xl border border-border mx-0 w-full"
            variant="error"
            title={error?.title === 'Workflow Error' ? 'Unable to process request.' : 'Something went wrong.'}
            message="Please try again."
            primaryAction={{ label: 'Close', onClick: clearStates }}
          />
        </DialogContent>
      </Dialog>
    </>
  )
}
