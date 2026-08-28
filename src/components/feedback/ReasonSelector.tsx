import { FEEDBACK_REASONS } from '@/constants/feedbackConstants'

interface ReasonSelectorProps {
  selected: string[]
  onChange: (reasons: string[]) => void
}

export function ReasonSelector({ selected, onChange }: ReasonSelectorProps) {
  const toggle = (reason: string) => {
    if (selected.includes(reason)) {
      onChange(selected.filter((r) => r !== reason))
    } else {
      onChange([...selected, reason])
    }
  }

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 10, color: '#1e293b' }} className="feedback-rating-title" >
        What could we improve?
      </div>
      <div style={{ fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>
        Select all that apply (optional)
      </div>
      <div className="feedback-reasons" role="group" aria-label="Feedback reasons">
        {FEEDBACK_REASONS.map((reason) => {
          const isActive = selected.includes(reason)
          return (
            <button
              key={reason}
              type="button"
              className={`feedback-reason-pill${isActive ? ' active' : ''}`}
              onClick={() => toggle(reason)}
              aria-pressed={isActive}
            >
              <span className="feedback-reason-check">
                {isActive && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5l2 2 4-4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              {reason}
            </button>
          )
        })}
      </div>
    </div>
  )
}
