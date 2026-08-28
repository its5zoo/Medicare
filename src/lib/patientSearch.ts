import type { PatientSearchIndexItem } from '@/api/types'

const MAX_RESULTS = 10

function normalizeQuery(query: string): string {
  return query.toLowerCase().trim()
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '')
}

function getMatchPriority(patient: PatientSearchIndexItem, query: string): number {
  const q = normalizeQuery(query)
  const patientId = patient.patientId.toLowerCase()
  const fullName = patient.fullName.toLowerCase()
  const phone = normalizePhone(patient.phone)
  const doctor = patient.doctor.toLowerCase()
  const qDigits = normalizePhone(q)

  if (patientId === q) return 1

  if (
    patientId.startsWith(q) ||
    fullName.startsWith(q) ||
    (qDigits.length > 0 && phone.startsWith(qDigits)) ||
    doctor.startsWith(q)
  ) {
    return 2
  }

  if (patientId.includes(q)) return 2

  if (fullName.includes(q)) return 3

  if (qDigits.length > 0 && phone.includes(qDigits)) return 4

  if (doctor.includes(q)) return 5

  return 6
}

export function filterPatientSearchIndex(
  index: PatientSearchIndexItem[],
  query: string,
  limit = MAX_RESULTS
): PatientSearchIndexItem[] {
  const q = normalizeQuery(query)
  if (!q) return []

  const matched = index.filter((patient) =>
    patient.searchText.toLowerCase().includes(q)
  )

  return matched
    .sort((a, b) => {
      const priorityDiff = getMatchPriority(a, q) - getMatchPriority(b, q)
      if (priorityDiff !== 0) return priorityDiff
      return a.fullName.localeCompare(b.fullName)
    })
    .slice(0, limit)
}

export function formatPatientPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 10) return `+91 ${digits}`
  if (digits.startsWith('91') && digits.length === 12) {
    return `+91 ${digits.slice(2)}`
  }
  return phone.startsWith('+') ? phone : `+${digits}`
}

export function getPatientInitials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function formatPatientDisplayName(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}
