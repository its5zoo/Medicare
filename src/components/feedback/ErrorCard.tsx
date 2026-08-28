interface ErrorCardProps {
  variant: 'invalid' | 'generic'
}

export function ErrorCard({ variant }: ErrorCardProps) {
  if (variant === 'invalid') {
    return (
      <div className="feedback-card">
        <div className="feedback-result-card">
          <div className="feedback-error-icon">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
          </div>
          <div className="feedback-result-title">Invalid Feedback Link</div>
          <div className="feedback-result-text">
            <p>This feedback link may be expired, invalid, or no longer available.</p>
            <p>Please contact the clinic if you believe this is an error.</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="feedback-card">
      <div className="feedback-result-card">
        <div className="feedback-error-icon">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>
        <div className="feedback-result-title">Something went wrong</div>
        <div className="feedback-result-text">
          <p>Please try again later.</p>
        </div>
      </div>
    </div>
  )
}
