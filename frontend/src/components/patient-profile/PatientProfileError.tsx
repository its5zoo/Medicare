import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

interface PatientProfileErrorProps {
  variant: 'not-found' | 'server' | 'network'
  onRetry?: () => void
  isRetrying?: boolean
}

export function PatientProfileError({
  variant,
  onRetry,
  isRetrying = false,
}: PatientProfileErrorProps) {
  const navigate = useNavigate()

  if (variant === 'not-found') {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center card-shadow">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-muted">
          <AlertCircle className="h-7 w-7 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-semibold">Patient not found</h3>
        <Button className="mt-6" onClick={() => navigate('/patients')}>
          Back to Patients
        </Button>
      </div>
    )
  }

  const isNetwork = variant === 'network'

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 text-center card-shadow">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 dark:bg-red-950">
        {isNetwork ? (
          <WifiOff className="h-7 w-7 text-red-500" />
        ) : (
          <AlertCircle className="h-7 w-7 text-red-500" />
        )}
      </div>
      <h3 className="mt-4 text-lg font-semibold">
        {isNetwork ? 'Check internet connection' : 'Unable to load patient data'}
      </h3>
      {onRetry && (
        <Button className="mt-6 gap-2" onClick={onRetry} disabled={isRetrying}>
          <RefreshCw className="h-4 w-4" />
          {isRetrying ? 'Retrying...' : 'Retry'}
        </Button>
      )}
    </div>
  )
}
