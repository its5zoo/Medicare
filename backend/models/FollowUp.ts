import mongoose, { Schema, Document } from 'mongoose'

export interface IFollowUp extends Document {
  followupId: string
  patientId: string
  patientName: string
  phone: string
  doctor: string
  followupDate: string
  followupTime: string
  type: string
  status: string
  reason?: string
  notes?: string
  rescheduleCount: number
  rescheduleReason?: string
  completedAt?: Date
  createdAt: Date
  updatedAt: Date
}

const FollowUpSchema = new Schema<IFollowUp>(
  {
    followupId: { type: String, required: true, unique: true, index: true },
    patientId: { type: String, required: true, index: true },
    patientName: { type: String, required: true },
    phone: { type: String, default: '' },
    doctor: { type: String, default: 'Dr. Priya Sharma' },
    followupDate: { type: String, required: true },
    followupTime: { type: String, default: '10:00 AM' },
    type: { type: String, default: 'Consultation Follow-Up' },
    status: {
      type: String,
      default: 'Scheduled',
      enum: ['Scheduled', 'Today', 'Upcoming', 'Missed', 'Completed', 'Rescheduled'],
    },
    reason: { type: String, default: '' },
    notes: { type: String, default: '' },
    rescheduleCount: { type: Number, default: 0 },
    rescheduleReason: { type: String },
    completedAt: { type: Date },
  },
  { timestamps: true }
)

export const FollowUp = mongoose.model<IFollowUp>('FollowUp', FollowUpSchema)
