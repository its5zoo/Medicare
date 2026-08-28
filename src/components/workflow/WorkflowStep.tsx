import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface WorkflowStepProps {
  label: string
  isActive: boolean
}

export function WorkflowStep({ label, isActive }: WorkflowStepProps) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -8 }}
      animate={{
        opacity: isActive ? 1 : 0.4,
        x: 0,
        scale: isActive ? 1 : 0.99,
      }}
      transition={{ duration: 0.2 }}
      className={cn(
        'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
        isActive
          ? 'border-primary/30 bg-primary/5 shadow-sm'
          : 'border-border/50 bg-muted/20'
      )}
    >
      <span
        className={cn(
          'relative flex h-2.5 w-2.5 shrink-0 rounded-full',
          isActive ? 'bg-primary' : 'bg-muted-foreground/30'
        )}
      >
        {isActive && (
          <motion.span
            className="absolute inset-0 rounded-full bg-primary"
            animate={{ scale: [1, 1.8, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.6, repeat: Infinity }}
          />
        )}
      </span>
      <span
        className={cn(
          'text-sm font-medium',
          isActive ? 'text-foreground' : 'text-muted-foreground'
        )}
      >
        {label}
      </span>
    </motion.div>
  )
}
