import mongoose, { Schema, Document } from 'mongoose'

export interface IActivity extends Document {
  type: string
  title: string
  description: string
  patientCode?: string
  priority?: string
  createdAt: Date
}

const ActivitySchema = new Schema<IActivity>(
  {
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    patientCode: { type: String, default: '' },
    priority: { type: String, default: 'normal', enum: ['low', 'normal', 'high', 'urgent'] },
  },
  { timestamps: true }
)

export const Activity = mongoose.model<IActivity>('Activity', ActivitySchema)
