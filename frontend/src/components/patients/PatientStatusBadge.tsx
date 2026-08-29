import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function WorkspacePatientStatusBadge({
  status,
  className,
}: {
  status: string
  className?: string
}) {
  let variant: 'default' | 'secondary' | 'success' | 'warning' | 'purple' | 'outline' = 'default'

  switch (status) {
    case 'Registered':
      variant = 'secondary'
      break
    case 'Active':
      variant = 'success'
      break
    case 'Completed':
      variant = 'outline'
      break
    default:
      variant = 'default'
  }

  return (
    <Badge variant={variant} className={cn('font-medium', className)}>
      {status}
    </Badge>
  )
}
