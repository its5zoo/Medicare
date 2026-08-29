import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useSyncExternalStore } from 'react'
import {
  getTransactionNotifications,
  removeTransactionNotification,
  subscribeTransactionNotifications,
} from '@/store/notifications'

const AUTO_DISMISS_MS = 5000

export function TransactionNotificationStack() {
  const notifications = useSyncExternalStore(
    subscribeTransactionNotifications,
    getTransactionNotifications,
    getTransactionNotifications
  )

  useEffect(() => {
    const timers = notifications.map((notification) => {
      const remaining = AUTO_DISMISS_MS - (Date.now() - notification.createdAt)
      return setTimeout(
        () => removeTransactionNotification(notification.id),
        Math.max(remaining, 0)
      )
    })
    return () => timers.forEach(clearTimeout)
  }, [notifications])

  return (
    <div className="pointer-events-none fixed right-4 top-4 z-[100] flex w-full max-w-sm flex-col gap-3 sm:right-6 sm:top-6">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 80, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.96 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="pointer-events-auto overflow-hidden rounded-2xl border border-border/80 bg-card shadow-2xl"
          >
            <div className="h-1 bg-gradient-to-r from-primary to-accent" />
            <div className="p-4">
              <p className="text-sm font-semibold tracking-tight">{notification.title}</p>
              <dl className="mt-3 space-y-1.5">
                {notification.lines.map((line) => (
                  <div key={line.label} className="flex gap-2 text-sm">
                    <dt className="text-muted-foreground">{line.label}:</dt>
                    <dd className="font-medium">{line.value}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
