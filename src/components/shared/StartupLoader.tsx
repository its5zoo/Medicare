import { Loader2 } from 'lucide-react'

interface StartupLoaderProps {
  error?: string | null
  onRetry?: () => void
  onGoToLogin?: () => void
}

export function StartupLoader({ error, onRetry, onGoToLogin }: StartupLoaderProps) {
  if (error) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-background p-4">
        <div className="flex flex-col items-center text-center max-w-md">
          <div className="mb-4 rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
            <svg
              className="h-6 w-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mb-2 text-xl font-semibold">Unable to Connect</h2>
          <p className="mb-6 text-sm text-muted-foreground">
            {error || 'We could not reach the server to verify your session. Please check your connection and try again.'}
          </p>
          <div className="flex items-center gap-3">
            {onRetry && (
              <button
                onClick={onRetry}
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                Try Again
              </button>
            )}
            {onGoToLogin && (
              <button
                onClick={onGoToLogin}
                className="rounded-lg border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
              >
                Go to Login
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-background">
      <div className="flex flex-col items-center animate-in fade-in duration-500">
        <div className="relative mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
        <p className="text-sm font-medium text-muted-foreground tracking-wide">
          Securing session...
        </p>
      </div>
    </div>
  )
}
