import { HumanizeDuration, HumanizeDurationLanguage } from 'humanize-duration-ts'
import humanize from 'humanize'

const durationService = new HumanizeDuration(new HumanizeDurationLanguage())

export function humanizeDuration(
  ms: number,
  options?: { largest?: number; round?: boolean }
): string {
  if (!ms || ms <= 0) return '0 minutes'
  return durationService.humanize(ms, {
    largest: options?.largest ?? 1,
    round: options?.round ?? true,
  })
}

export function humanizeRelativeTime(dateOrTimestamp: string | number | Date): string {
  if (!dateOrTimestamp) return 'Just now'
  const timeMs = new Date(dateOrTimestamp).getTime()
  if (isNaN(timeMs)) return 'Just now'

  const diffMs = Date.now() - timeMs
  if (diffMs < 30000 && diffMs >= 0) return 'Just now'

  return `${durationService.humanize(diffMs, { largest: 1, round: true })} ago`
}

export function humanizeNumber(val: number, decimals: number = 0): string {
  if (val === undefined || val === null || isNaN(val)) return '0'
  return humanize.numberFormat(val, decimals)
}

export function humanizeTruncate(text: string, length: number = 50): string {
  if (!text) return ''
  return humanize.truncatewords(text, length)
}

export { humanize }

