export interface TransactionNotificationItem {
  id: string
  title: string
  lines: Array<{ label: string; value: string }>
  createdAt: number
}

type Listener = () => void

let notifications: TransactionNotificationItem[] = []
const listeners = new Set<Listener>()

export function getTransactionNotifications(): TransactionNotificationItem[] {
  return notifications
}

export function subscribeTransactionNotifications(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

function notify() {
  listeners.forEach((listener) => listener())
}

export function pushTransactionNotification(
  item: Omit<TransactionNotificationItem, 'id' | 'createdAt'>
): string {
  const id = crypto.randomUUID()
  notifications = [
    { ...item, id, createdAt: Date.now() },
    ...notifications,
  ]
  notify()
  return id
}

export function removeTransactionNotification(id: string) {
  notifications = notifications.filter((n) => n.id !== id)
  notify()
}
