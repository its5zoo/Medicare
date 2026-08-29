import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface WorkflowProgressProps {
  steps: string[]
  title?: string
}

export function WorkflowProgress({ steps, title = 'Processing' }: WorkflowProgressProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    if (steps.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [steps])

  return (
    <div className="rounded-2xl border border-border/80 bg-card p-6 shadow-lg">
      <p className="text-sm font-medium text-muted-foreground">{title}</p>
      <div className="mt-4 space-y-3">
        <AnimatePresence mode="wait">
          {steps.map((step, index) => {
            const isActive = index === activeIndex
            return (
              <motion.div
                key={step}
                layout
                initial={{ opacity: 0, x: -8 }}
                animate={{
                  opacity: isActive ? 1 : 0.45,
                  x: 0,
                  scale: isActive ? 1 : 0.98,
                }}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors',
                  isActive
                    ? 'border-primary/30 bg-primary/5 shadow-sm'
                    : 'border-border/60 bg-muted/20'
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
                <span className={cn('text-sm font-medium', isActive && 'text-foreground')}>
                  {step}
                </span>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
