import mongoose, { Schema, Document } from 'mongoose'

export interface IConsultation extends Document {
  conditionId: string
  patientId: string
  title: string
  infectionType: string
  diagnosisDate: string
  followupDate?: string
  followupTime?: string
  status: string
  clinicalNotes?: string
  createdAt: Date
  updatedAt: Date
}

const ConsultationSchema = new Schema<IConsultation>(
  {
    conditionId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    infectionType: { type: String, default: 'Non-infectious' },
    diagnosisDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    followupDate: { type: String },
    followupTime: { type: String },
    status: { type: String, default: 'Active', enum: ['Active', 'Resolved', 'In Treatment'] },
    clinicalNotes: { type: String, default: '' },
  },
  { timestamps: true }
)

export const Consultation = mongoose.model<IConsultation>('Consultation', ConsultationSchema)
