import { AlertCircle, RefreshCw } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface DashboardErrorProps {
  onRetry: () => void
  isRetrying?: boolean
}

export function DashboardError({ onRetry, isRetrying = false }: DashboardErrorProps) {
  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center card-shadow">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950">
        <AlertCircle className="h-7 w-7 text-red-500" />
      </div>
      <h3 className="mt-4 text-lg font-semibold">Unable to load dashboard</h3>
      <p className="mt-2 max-w-sm text-sm text-muted-foreground">
        Please refresh and try again.
      </p>
      <Button className="mt-6 gap-2" onClick={onRetry} disabled={isRetrying}>
        <RefreshCw className="h-4 w-4" />
        {isRetrying ? 'Retrying...' : 'Retry'}
      </Button>
    </div>
  )
}
