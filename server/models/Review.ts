import mongoose, { Schema, Document } from 'mongoose'

export interface IReview extends Document {
  feedbackId: string
  patientRecordId?: string
  patientId: string
  patientName: string
  doctorName: string
  phone: string
  visitDate: string
  submittedAt?: Date | null
  status: 'Pending' | 'Completed'
  rating?: number | null
  reasons: string[]
  comment: string
  googleRedirected: boolean
  reviewLinkOpened: boolean
  whatsappSent: boolean
  token: string
  createdAt: Date
  updatedAt: Date
}

const ReviewSchema = new Schema<IReview>(
  {
    feedbackId: { type: String, required: true, unique: true, index: true },
    patientRecordId: { type: String, default: '' },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    doctorName: { type: String, default: 'Dr. Priya Sharma' },
    phone: { type: String, default: '' },
    visitDate: { type: String, default: () => new Date().toISOString().split('T')[0] },
    submittedAt: { type: Date, default: null },
    status: { type: String, default: 'Pending', enum: ['Pending', 'Completed'] },
    rating: { type: Number, default: null },
    reasons: { type: [String], default: [] },
    comment: { type: String, default: '' },
    googleRedirected: { type: Boolean, default: false },
    reviewLinkOpened: { type: Boolean, default: false },
    whatsappSent: { type: Boolean, default: true },
    token: { type: String, required: true, unique: true, index: true },
  },
  { timestamps: true }
)

export const Review = mongoose.model<IReview>('Review', ReviewSchema)
