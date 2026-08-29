import mongoose, { Schema, Document } from 'mongoose'

export interface IPrescription extends Document {
  prescriptionId: string
  patientId: string
  conditionId?: string
  patientName: string
  doctor: string
  phone: string
  medicineName: string
  dosage: string
  timing: string[]
  frequency: string
  startDate: string
  endDate?: string
  durationDays: number
  instructions?: string
  reminderActive?: boolean
  status: string
  discontinueReason?: string
  discontinuedBy?: string
  createdAt: Date
  updatedAt: Date
}

const PrescriptionSchema = new Schema<IPrescription>(
  {
    prescriptionId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    conditionId: { type: String, index: true, default: '' },
    patientName: { type: String, required: true },
    doctor: { type: String, default: 'Dr. Priya Sharma' },
    phone: { type: String, default: '' },
    medicineName: { type: String, required: true },
    dosage: { type: String, required: true },
    timing: { type: [String], default: ['Morning'] },
    frequency: { type: String, default: 'Once daily' },
    startDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    endDate: { type: String },
    durationDays: { type: Number, default: 14 },
    instructions: { type: String, default: '' },
    reminderActive: { type: Boolean, default: true },
    status: { type: String, default: 'Active', enum: ['Active', 'Completed', 'Discontinued'] },
    discontinueReason: { type: String },
    discontinuedBy: { type: String },
  },
  { timestamps: true }
)

export const Prescription = mongoose.model<IPrescription>('Prescription', PrescriptionSchema)
