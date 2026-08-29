import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description?: string
  className?: string
}

export function EmptyState({ title, description, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'rounded-xl border border-dashed border-border py-10 text-center',
        className
      )}
    >
      <p className="text-sm font-medium">{title}</p>
      {description && (
        <p className="mt-1 text-sm text-muted-foreground whitespace-pre-line">{description}</p>
      )}
    </div>
  )
}
