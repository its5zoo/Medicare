import mongoose, { Schema, Document } from 'mongoose'

export interface IPatient extends Document {
  patientId: string
  name: string
  phone: string
  age: number
  gender: string
  address: string
  doctor: string
  status: string
  registrationDate: string
  lastVisitDate?: string | null
  createdAt: Date
  updatedAt: Date
}

const PatientSchema = new Schema<IPatient>(
  {
    patientId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    age: { type: Number, required: true },
    gender: { type: String, required: true },
    address: { type: String, default: '' },
    doctor: { type: String, default: 'Dr. Priya Sharma' },
    status: {
      type: String,
      default: 'Registered',
      enum: ['Registered', 'Consultation Pending', 'Active Treatment', 'Follow-Up Due', 'Completed'],
    },
    registrationDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    lastVisitDate: { type: String, default: null },
  },
  { timestamps: true }
)

export const Patient = mongoose.model<IPatient>('Patient', PatientSchema)
