import { AnimatePresence, motion } from 'framer-motion'
import { ClipboardList } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { WorkflowStep } from '@/components/workflow/WorkflowStep'

interface WorkflowModalProps {
  open: boolean
  steps: string[]
  title?: string
}

export function WorkflowModal({ open, steps, title = 'Processing' }: WorkflowModalProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const cardRef = useRef<HTMLDivElement>(null)

  // Reset and cycle steps whenever modal opens
  useEffect(() => {
    if (!open) return
    setActiveIndex(0)
    if (steps.length <= 1) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % steps.length)
    }, 2200)
    return () => clearInterval(interval)
  }, [open, steps])

  // Focus the card for accessibility
  useEffect(() => {
    if (open) {
      const frame = requestAnimationFrame(() => cardRef.current?.focus())
      return () => cancelAnimationFrame(frame)
    }
  }, [open])

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ backgroundColor: 'rgba(0,0,0,0.72)', backdropFilter: 'blur(6px)' }}
          role="dialog"
          aria-modal="true"
          aria-label={title}
        >
          <motion.div
            ref={cardRef}
            tabIndex={-1}
            initial={{ opacity: 0, scale: 0.93, y: 18 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.93, y: 18 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl outline-none"
          >
            {/* Gradient accent bar */}
            <div className="h-1 bg-gradient-to-r from-primary to-accent" />

            {/* Header */}
            <div className="px-8 pt-8 pb-5 text-center">
              {/* Animated concentric rings - no spinner per spec */}
              <div className="relative mx-auto mb-6 h-16 w-16">
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-primary/20"
                  animate={{ scale: [1, 1.22, 1], opacity: [0.7, 0.08, 0.7] }}
                  transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.div
                  className="absolute inset-2 rounded-full border border-primary/30"
                  animate={{ scale: [1, 1.16, 1], opacity: [0.9, 0.15, 0.9] }}
                  transition={{
                    duration: 2.6,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: 0.35,
                  }}
                />
                <div className="absolute inset-3 flex items-center justify-center rounded-full bg-primary/10">
                  <ClipboardList className="h-5 w-5 text-primary" />
                </div>
              </div>

              <h2 className="text-lg font-bold tracking-tight">{title}</h2>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Processing your request - please wait
              </p>
            </div>

            {/* Steps */}
            <div className="space-y-2 px-6 pb-6">
              {steps.map((step, index) => (
                <WorkflowStep
                  key={step}
                  label={step}
                  isActive={index === activeIndex}
                />
              ))}
            </div>

            {/* Footer */}
            <div className="border-t border-border/60 px-8 py-4 text-center">
              <p className="text-xs text-muted-foreground">
                This may take up to{' '}
                <span className="font-semibold text-foreground">40 seconds</span>.
                Do not close this window.
              </p>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
