import type { ConsultationMedicineDraft } from '@/components/consultation/types'

export interface RegistrationFormValues {
  fullName: string
  age: string
  gender: string
  whatsapp: string
  address: string
  doctorName: string
}

export interface RegistrationFormErrors {
  fullName?: string
  age?: string
  gender?: string
  whatsapp?: string
  address?: string
  doctorName?: string
}

export interface ConsultationFormValues {
  skinProblem: string
  infectionType: string
  diagnosisDate: string
  followUpDate: string
  followUpTime: string
  medicines: ConsultationMedicineDraft[]
}

export interface ConsultationFormErrors {
  skinProblem?: string
  infectionType?: string
  diagnosisDate?: string
  followUpDate?: string
  followUpTime?: string
  medicines?: Record<string, Partial<Record<keyof ConsultationMedicineDraft, string>>>
}

export function normalizeWhatsAppDigits(value: string): string {
  const digits = value.replace(/\D/g, '')
  if (digits.length >= 10) return digits.slice(-10)
  return digits
}

export function validateRegistrationForm(form: RegistrationFormValues): RegistrationFormErrors {
  const errors: RegistrationFormErrors = {}

  if (!form.fullName.trim()) errors.fullName = 'Full name is required'

  const ageNum = Number(form.age)
  if (!form.age.trim() || Number.isNaN(ageNum)) {
    errors.age = 'Age is required'
  }

  if (!form.gender) errors.gender = 'Gender is required'

  const whatsappDigits = normalizeWhatsAppDigits(form.whatsapp)
  if (!whatsappDigits || whatsappDigits.length !== 10) {
    errors.whatsapp = 'Enter a valid 10-digit WhatsApp number'
  }

  if (!form.address.trim()) errors.address = 'Address is required'
  if (!form.doctorName.trim()) errors.doctorName = 'Doctor is required'

  return errors
}

export function isRegistrationFormValid(form: RegistrationFormValues): boolean {
  return Object.keys(validateRegistrationForm(form)).length === 0
}

export function validateMedicineDraft(med: ConsultationMedicineDraft): Partial<
  Record<keyof ConsultationMedicineDraft, string>
> {
  const errors: Partial<Record<keyof ConsultationMedicineDraft, string>> = {}
  const hasName = med.medicineName.trim().length > 0

  if (!hasName) return errors

  if (!med.dosage.trim()) errors.dosage = 'Dosage is required'
  if (med.timing.length === 0) errors.timing = 'Select at least one timing'
  if (!med.frequency) errors.frequency = 'Frequency is required'
  if (
    !med.durationDays ||
    med.durationDays < 1 ||
    !Number.isInteger(med.durationDays)
  ) {
    errors.durationDays = 'Duration must be a whole number (minimum 1 day)'
  }
  if (!med.instructions.trim()) errors.instructions = 'Instructions are required'
  if (!med.startDate) errors.startDate = 'Start date is required'

  return errors
}

export function validateConsultationForm(
  values: ConsultationFormValues
): ConsultationFormErrors {
  const errors: ConsultationFormErrors = {}

  if (!values.skinProblem.trim()) errors.skinProblem = 'Skin problem is required'
  if (!values.infectionType) errors.infectionType = 'Infection type is required'

  if (!values.diagnosisDate) {
    errors.diagnosisDate = 'Diagnosis date is required'
  } else {
    const today = new Date().toISOString().split('T')[0]
    if (values.diagnosisDate < today) {
      errors.diagnosisDate = 'Diagnosis date cannot be in the past'
    }
  }

  if (!values.followUpDate) errors.followUpDate = 'Follow-up date is required'
  if (!values.followUpTime) errors.followUpTime = 'Follow-up time is required'

  const medicineErrors: ConsultationFormErrors['medicines'] = {}
  values.medicines.forEach((med) => {
    const medErrors = validateMedicineDraft(med)
    if (Object.keys(medErrors).length > 0) {
      medicineErrors[med.id] = medErrors
    }
  })

  if (Object.keys(medicineErrors).length > 0) {
    errors.medicines = medicineErrors
  }

  return errors
}

export function isConsultationFormValid(values: ConsultationFormValues): boolean {
  return Object.keys(validateConsultationForm(values)).length === 0
}
