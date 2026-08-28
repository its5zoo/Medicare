import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: string): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return date
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/** Compact DD/MM/YYYY format for dashboard mobile density */
export function formatDateCompact(date: string): string {
  if (!date) return '-'
  const d = new Date(date)
  if (isNaN(d.getTime())) return date
  const day = String(d.getDate()).padStart(2, '0')
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const year = d.getFullYear()
  return `${day}/${month}/${year}`
}

export function formatTime(time: string): string {
  if (!time) return '-'
  if (!time.includes(':')) return time
  const [hours, minutes] = time.split(':')
  const h = parseInt(hours, 10)
  if (isNaN(h)) return time
  const ampm = h >= 12 ? 'PM' : 'AM'
  const hour12 = h % 12 || 12
  return `${hour12}:${minutes || '00'} ${ampm}`
}

export function getWaitingDays(registrationDate: string): number {
  if (!registrationDate) return 0
  const reg = new Date(registrationDate)
  if (isNaN(reg.getTime())) return 0
  const now = new Date()
  return Math.floor((now.getTime() - reg.getTime()) / (1000 * 60 * 60 * 24))
}
