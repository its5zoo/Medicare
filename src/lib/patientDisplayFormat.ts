/**
 * Presentation-only formatters for patient profile UI.
 * No business logic - safe to use across any profile view.
 */

export function formatDisplayName(name: string): string {
  return name
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

export function formatLastVisitLabel(lastVisitDate: string | null | undefined): string {
  return lastVisitDate ? '' : 'No Visit Recorded'
}

export function formatTimelineTitle(title: string, type: string): string {
  const combined = `${title} ${type}`.toLowerCase()

  if (combined.includes('discontinu')) return 'Medicine Discontinued'
  if (combined.includes('new medicine') || combined.includes('medicine added')) {
    return 'Medicine Added'
  }
  if (combined.includes('medicine update') || combined.includes('prescription_update')) {
    return 'Medicine Updated'
  }
  if (combined.includes('prescription batch') || combined.includes('prescription created')) {
    return 'Prescription Created'
  }
  if (combined.includes('follow') && combined.includes('complet')) return 'Follow-Up Completed'
  if (combined.includes('follow') && combined.includes('reschedul')) return 'Follow-Up Rescheduled'
  if (combined.includes('follow') && combined.includes('schedul')) return 'Follow-Up Scheduled'
  if (combined.includes('consultation')) return 'Consultation Completed'
  if (combined.includes('registration') || combined.includes('registered')) {
    return 'Patient Registered'
  }

  return title.trim()
}

function cleanValue(value: string): string {
  const trimmed = value.trim()
  if (!trimmed || trimmed === 'undefined' || trimmed === 'null') return ''
  return trimmed
}

function parseFieldChanges(text: string): string[] {
  const lines: string[] = []
  const pattern =
    /(?:[•·\-]\s*)?([\w\s]+?)\s+changed from\s+"([^"]*)"\s+to\s+"([^"]*)"/gi

  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const field = match[1].trim()
    const from = cleanValue(match[2])
    const to = cleanValue(match[3])

    if (!from && !to) continue
    if (from === to) continue

    lines.push(`${field} changed:`)
    lines.push(`${from || '-'} → ${to || '-'}`)
  }

  return lines
}

function parseStructuredDescription(raw: string): string[] {
  const lines: string[] = []
  const text = raw
    .replace(/\r\n/g, '\n')
    .replace(/Update\s*Type\s*:-\s*.+\n?/gi, '')
    .trim()

  const medicineMatch = text.match(/medicine\s*Name\s*:-\s*(.+?)(?:\n|$)/i)
  if (medicineMatch) {
    const name = cleanValue(medicineMatch[1])
    if (name) lines.push(`Medicine: ${name}`)
  }

  const changes = parseFieldChanges(text)
  if (changes.length > 0) {
    if (lines.length > 0) lines.push('')
    lines.push(...changes)
  }

  const clinicNote = text.match(/Clinic\s*(?:Note|INstruction)\s*:-\s*([\s\S]+?)(?:\n\n|$)/i)
  if (clinicNote) {
    const note = cleanValue(clinicNote[1].replace(/\n/g, ' '))
    if (note && changes.length === 0) {
      if (lines.length > 0) lines.push('')
      lines.push(note)
    }
  }

  if (lines.length === 0 && /instructions?\s+changed/i.test(text)) {
    lines.push('Instructions updated')
  }

  return lines
}

function parsePlainDescription(raw: string): string[] {
  const cleaned = raw
    .replace(/medicine\s*Name\s*:-\s*/gi, '')
    .replace(/Update\s*Type\s*:-\s*.+\n?/gi, '')
    .replace(/Clinic\s*(?:Note|INstruction)\s*:-\s*/gi, '')
    .split('\n')
    .map((line) => line.replace(/^[•·\-]\s*/, '').trim())
    .filter((line) => line.length > 0 && line.toLowerCase() !== 'updated')

  if (cleaned.length === 0) return []
  if (cleaned.length === 1) return [cleaned[0]]
  return cleaned
}

export function formatTimelineDescription(description: string): string[] {
  if (!description?.trim()) return []

  const structured = parseStructuredDescription(description)
  if (structured.length > 0) return trimTrailingBlankLines(structured)

  const plain = parsePlainDescription(description)
  if (plain.length > 0) return plain

  return [description.trim()]
}

function trimTrailingBlankLines(lines: string[]): string[] {
  const result = [...lines]
  while (result.length > 0 && result[result.length - 1] === '') {
    result.pop()
  }
  return result
}

export function formatTimelineDateTime(timestamp: string): string {
  const date = new Date(timestamp)
  if (Number.isNaN(date.getTime())) return timestamp

  const dateLabel = date.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })

  const hours = date.getHours()
  const minutes = date.getMinutes()
  if (hours === 0 && minutes === 0 && !timestamp.includes('T')) {
    return dateLabel
  }

  const timeLabel = date.toLocaleTimeString('en-IN', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  })

  return `${dateLabel} · ${timeLabel}`
}
