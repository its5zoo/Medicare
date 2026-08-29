import { useEffect, useRef, useState } from 'react'
import { REDIRECT_COUNTDOWN_SECONDS } from '@/constants/feedbackConstants'

interface RedirectModalProps {
  onRedirect: () => void
}

export function RedirectModal({ onRedirect }: RedirectModalProps) {
  const [count, setCount] = useState(REDIRECT_COUNTDOWN_SECONDS)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setCount((prev) => {
        if (prev <= 1) {
          if (intervalRef.current) clearInterval(intervalRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  useEffect(() => {
    if (count === 0) {
      onRedirect()
    }
  }, [count, onRedirect])

  const progressPercent = ((REDIRECT_COUNTDOWN_SECONDS - count) / REDIRECT_COUNTDOWN_SECONDS) * 100

  return (
    <div className="feedback-modal-overlay" role="dialog" aria-modal="true" aria-label="Redirect to Google Reviews">
      <div className="feedback-modal">
        <div className="feedback-modal-emoji">🎉</div>
        <div className="feedback-modal-title">Thank You</div>
        <div className="feedback-modal-text">
          You are eligible for a 5% discount on your next consultation.
          <br />
          <br />
          Redirecting to Google Reviews...
        </div>
        <div className="feedback-modal-countdown" aria-live="polite">
          {count}
        </div>
        <div className="feedback-modal-progress-track">
          <div
            className="feedback-modal-progress-bar"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="feedback-modal-redirect-text">
          You will be redirected automatically
        </div>
      </div>
    </div>
  )
}
