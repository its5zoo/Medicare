import mongoose, { Schema, Document } from 'mongoose'

export interface IAutomationLog extends Document {
  workflowType: 'medicine_reminder' | 'followup_reminder' | 'missed_followup_check' | 'review_request' | 'welcome_registration'
  recipient: {
    name: string
    phone: string
    patientId: string
  }
  channel: 'WhatsApp' | 'SMS' | 'Email' | 'System'
  payload: Record<string, any>
  status: 'SENT' | 'FAILED' | 'QUEUED' | 'PROCESSED'
  details: string
  dispatchedAt: Date
  createdAt: Date
}

const AutomationLogSchema = new Schema<IAutomationLog>(
  {
    workflowType: {
      type: String,
      required: true,
      enum: [
        'medicine_reminder',
        'followup_reminder',
        'missed_followup_check',
        'review_request',
        'welcome_registration',
      ],
      index: true,
    },
    recipient: {
      name: { type: String, required: true },
      phone: { type: String, default: '' },
      patientId: { type: String, required: true, index: true },
    },
    channel: { type: String, default: 'WhatsApp', enum: ['WhatsApp', 'SMS', 'Email', 'System'] },
    payload: { type: Schema.Types.Mixed, default: {} },
    status: { type: String, default: 'SENT', enum: ['SENT', 'FAILED', 'QUEUED', 'PROCESSED'] },
    details: { type: String, default: '' },
    dispatchedAt: { type: Date, default: () => new Date() },
  },
  { timestamps: true }
)

export const AutomationLog = mongoose.model<IAutomationLog>('AutomationLog', AutomationLogSchema)
