import { motion } from 'framer-motion'
import { AlertCircle, CheckCircle2, Clock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TransactionResultCardProps {
  variant: 'success' | 'error' | 'timeout'
  title: string
  lines?: Array<{ label: string; value: string }>
  message?: string
  primaryAction?: { label: string; onClick: () => void }
  secondaryAction?: { label: string; onClick: () => void }
  className?: string
}

export function TransactionResultCard({
  variant,
  title,
  lines,
  message,
  primaryAction,
  secondaryAction,
  className,
}: TransactionResultCardProps) {
  const Icon =
    variant === 'success' ? CheckCircle2 : variant === 'timeout' ? Clock : AlertCircle

  const iconClass =
    variant === 'success'
      ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950'
      : variant === 'timeout'
        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950'
        : 'bg-red-50 text-red-600 dark:bg-red-950'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn('mx-auto max-w-lg pt-12 text-center', className)}
    >
      <div
        className={cn(
          'mx-auto flex h-20 w-20 items-center justify-center rounded-full',
          iconClass
        )}
      >
        <Icon className="h-10 w-10" />
      </div>
      <h2 className="mt-6 text-2xl font-bold tracking-tight">{title}</h2>
      {message && <p className="mt-2 text-muted-foreground">{message}</p>}
      {lines && lines.length > 0 && (
        <dl className="mt-6 space-y-2 rounded-2xl border border-border bg-muted/20 p-5 text-left">
          {lines.map((line) => (
            <div key={line.label} className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5 text-sm">
              <dt className="text-muted-foreground">{line.label}:</dt>
              <dd className="font-medium whitespace-pre-line">{line.value}</dd>
            </div>
          ))}
        </dl>
      )}
      {(primaryAction || secondaryAction) && (
        <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-center">
          {secondaryAction && (
            <Button variant="outline" onClick={secondaryAction.onClick}>
              {secondaryAction.label}
            </Button>
          )}
          {primaryAction && (
            <Button onClick={primaryAction.onClick}>
              {primaryAction.label}
            </Button>
          )}
        </div>
      )}
    </motion.div>
  )
}
