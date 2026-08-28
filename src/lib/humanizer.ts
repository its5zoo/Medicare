import { HumanizeDuration, HumanizeDurationLanguage } from "humanize-duration-ts"
import humanize from "humanize"

const dur = new HumanizeDuration(new HumanizeDurationLanguage())

export function humanizeDuration(ms: number, opts?: { largest?: number; round?: boolean; units?: ("y"|"mo"|"w"|"d"|"h"|"m"|"s")[] }) {
  if (!ms || ms <= 0) return "0 minutes"
  return dur.humanize(ms, { largest: opts?.largest ?? 2, round: opts?.round ?? true, units: opts?.units ?? ["w","d","h","m"] })
}

export function humanizeRelativeTime(val: string | number | Date) {
  if (!val) return "Just now"
  const ms = new Date(val).getTime()
  if (isNaN(ms)) return "Just now"
  const diff = Date.now() - ms
  if (diff < 30000 && diff >= -5000) return "Just now"
  if (diff < 0) return `in ${dur.humanize(Math.abs(diff), { largest: 1, round: true })}`
  return `${dur.humanize(diff, { largest: 1, round: true })} ago`
}

export function humanizeDaysRemaining(days?: number) {
  if (days == null) return "No duration set"
  if (days > 1) return `${days} days remaining`
  if (days === 1) return "1 day remaining"
  if (days === 0) return "Finishes today"
  return "Course completed"
}

export function humanizeNumber(val: number, decimals = 0) {
  if (val == null || isNaN(val)) return "0"
  return humanize.numberFormat(val, decimals)
}

export function humanizeNaturalDate(val: string | number | Date) {
  if (!val) return "N/A"
  const d = new Date(val)
  if (isNaN(d.getTime())) return "N/A"
  const now = new Date()
  const sameDay = (a: Date, b: Date) => a.getDate()===b.getDate() && a.getMonth()===b.getMonth() && a.getFullYear()===b.getFullYear()
  if (sameDay(d, now)) return "Today"
  const yesterday = new Date(now)
  yesterday.setDate(now.getDate() - 1)
  if (sameDay(d, yesterday)) return "Yesterday"
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })
}

export function humanizeTruncate(text: string, length = 50) {
  if (!text) return ""
  return humanize.truncatewords(text, length)
}

export function humanizeOrdinal(num: number) { return humanize.ordinal(num) }
export function humanizeFilesize(bytes: number) { return humanize.filesize(bytes) }
export { humanize }
