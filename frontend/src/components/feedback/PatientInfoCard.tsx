import type { FeedbackData } from '@/api/feedbackApi'

interface PatientInfoCardProps {
  data: FeedbackData
}

function formatVisitDate(dateStr?: string | null): string {
  if (!dateStr) return 'Visit Information Unavailable'
  try {
    const date = new Date(dateStr)
    if (isNaN(date.getTime())) return 'Visit Information Unavailable'
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    })
  } catch {
    return 'Visit Information Unavailable'
  }
}

export function PatientInfoCard({ data }: PatientInfoCardProps) {
  const patientName = data.patientName || 'Patient'
  const doctorName = data.doctorName || 'Doctor Information Unavailable'
  const visitDate = formatVisitDate(data.visitDate)
  const patientId = data.patientId || ''

  return (
    <div className="feedback-card">
      {/* Clinic Header */}
      <div className="feedback-clinic-header">
        <div className="feedback-clinic-logo">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
            <rect x="9" y="3" width="6" height="4" rx="1" />
            <path d="M12 11v6" />
            <path d="M9 14h6" />
          </svg>
        </div>
        <div className="feedback-clinic-name">Dermat Clinic</div>
        <div className="feedback-clinic-subtitle">Patient Feedback</div>
      </div>

      {/* Patient Details */}
      <div className="feedback-info-grid">
        <div className="feedback-info-item">
          <span className="feedback-info-label">Patient</span>
          <span className="feedback-info-value">{patientName}</span>
        </div>
        <div className="feedback-info-item">
          <span className="feedback-info-label">Doctor</span>
          <span className="feedback-info-value">{doctorName}</span>
        </div>
        <div className="feedback-info-item">
          <span className="feedback-info-label">Visit Date</span>
          <span className="feedback-info-value">{visitDate}</span>
        </div>
        {patientId && (
          <div className="feedback-info-item">
            <span className="feedback-info-label">Patient ID</span>
            <span className="feedback-info-value">{patientId}</span>
          </div>
        )}
      </div>
    </div>
  )
}
