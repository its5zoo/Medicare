import { formatDate } from '@/lib/utils'
import { formatDisplayName } from '@/lib/patientDisplayFormat'

export function formatWhatsAppSent(sent: boolean): string {
  return sent ? 'Sent' : 'Not sent'
}

export function formatRegistrationSuccessLines(
  data: {
    patient: { name: string; code: string }
    doctor: { name: string }
    whatsapp: { sent: boolean }
  },
  formValues: { age: string; gender: string }
): Array<{ label: string; value: string }> {
  return [
    { label: 'Patient ID', value: data.patient.code },
    { label: 'Patient Name', value: formatDisplayName(data.patient.name) },
    { label: 'Age', value: `${formValues.age} years` },
    { label: 'Gender', value: formValues.gender },
    { label: 'Doctor', value: data.doctor.name },
    { label: 'WhatsApp Status', value: formatWhatsAppSent(data.whatsapp.sent) },
    { label: 'Registration Date', value: formatDate(new Date().toISOString().split('T')[0]) },
  ]
}

export function formatConsultationSuccessLines(data: {
  patient: { name: string; code: string }
  condition: { id: string }
  Medicine: { count: number; ids: string }
  followup: { date: string; time: string }
}): Array<{ label: string; value: string }> {
  return [
    { label: 'Patient', value: data.patient.code },
    { label: 'Patient Name', value: formatDisplayName(data.patient.name) },
    { label: 'Condition', value: data.condition.id },
    { label: 'Medicines', value: `${data.Medicine.count} prescribed` },
    { label: 'Follow-Up Date', value: formatDate(data.followup.date) },
    { label: 'Follow-Up Time', value: data.followup.time },
  ]
}
